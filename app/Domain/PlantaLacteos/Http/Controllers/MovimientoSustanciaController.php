<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\RecepcionLeche;
use App\Domain\PlantaLacteos\Models\SubRutaAcopio;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\PlantaLacteos\Http\Requests\RecepcionLecheRequest;
use App\Domain\PlantaLacteos\Http\Requests\RecepcionMateriaPrimaRequest;
use App\Domain\PlantaLacteos\Models\CategoriaMateriaPrima;
use App\Domain\PlantaLacteos\Models\ItemMateriaPrima;
use App\Domain\PlantaLacteos\Models\ItemSustancia;
use App\Domain\PlantaLacteos\Models\MovimientoSustancia;
use App\Domain\PlantaLacteos\Models\ProveedorMateriaPrima;
use App\Domain\PlantaLacteos\Models\RecepcionEstadoHistorial;
use App\Domain\PlantaLacteos\Models\RecepcionMateriaPrima;
use App\Domain\PlantaLacteos\Services\RecepcionMateriaPrimaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;


class MovimientoSustanciaController extends Controller
{

   public function index(Request $request)
{
    $user = auth()->user();
    $isAdmin = $user->hasRole('admin');
    $ubicacionId = $user->ubicacion_id;

    $filters = $request->only([
        'search',
        'user_id',
        'sustancia_id',
        'autorizante_id',
        'entregante_id',
        'tiempo',
        'estado_id',
        'fecha_entrega',
        'tipo',
    ]);

    // Consulta base para sustancias - YA TIENE FILTRADO
    $sustanciasQuery = ItemSustancia::with('unidad');
    if (!$isAdmin && $ubicacionId) {
        $sustanciasQuery->where('ubicacion_id', $ubicacionId);
    }
    $sustancias = $sustanciasQuery->get();

    // Consulta base de movimientos - YA TIENE FILTRADO
    $movimientosQuery = MovimientoSustancia::with([
        'user',
        'sustancia.unidad',
        'autorizante',
        'entregante',
        'estado',
        'ubicacion'
    ]);

    if (!$isAdmin && $ubicacionId) {
        $movimientosQuery->whereHas('sustancia', function($query) use ($ubicacionId) {
            $query->where('ubicacion_id', $ubicacionId);
        });
    }

    $movimientos = $movimientosQuery
        ->filter($filters)
        ->orderBy($request->get('sort', 'created_at'), 'desc')
        ->paginate($request->get('per_page', 10))
        ->withQueryString();

    // Base query para stocks por sustancia - MEJORADO
    $stockQuery = MovimientoSustancia::select(
        'sustancia_id',
        DB::raw("SUM(CASE WHEN tipo = 1 THEN cantidad ELSE -cantidad END) as stock")
    )
    ->whereHas('estado', function ($query) {
        $query->whereIn('nombre', ['Aceptado']);
    });

    // Filtrar por ubicación si no es admin
    if (!$isAdmin && $ubicacionId) {
        $stockQuery->whereHas('sustancia', function($query) use ($ubicacionId) {
            $query->where('ubicacion_id', $ubicacionId);
        });
    }

    $stockPorSustancia = $stockQuery
        ->groupBy('sustancia_id')
        ->pluck('stock', 'sustancia_id');

    // Stock por sustancia real (entregado)
    $stockRealQuery = MovimientoSustancia::select(
        'sustancia_id',
        DB::raw("SUM(CASE WHEN tipo = 1 THEN cantidad ELSE -cantidad END) as stock")
    )
    ->whereHas('estado', function ($query) {
        $query->whereIn('nombre', ['Entregado']);
    });

    // Filtrar por ubicación si no es admin
    if (!$isAdmin && $ubicacionId) {
        $stockRealQuery->whereHas('sustancia', function($query) use ($ubicacionId) {
            $query->where('ubicacion_id', $ubicacionId);
        });
    }

    $stockPorSustanciaReal = $stockRealQuery
        ->groupBy('sustancia_id')
        ->pluck('stock', 'sustancia_id');

    // Obtener usuarios - FILTRAR POR UBICACIÓN SI NO ES ADMIN
    $usersQuery = User::query();
    if (!$isAdmin && $ubicacionId) {
        $usersQuery->where('ubicacion_id', $ubicacionId);
    }
    $users = $usersQuery->get();

    return Inertia::render('planta_lacteos/limpiezaOrdenDesinfeccion/sustanciasQuimicas/index', [
        'movimientos' => $movimientos,
        'users' => $users, // Ya filtrado por ubicación
        'sustancias' => $sustancias,
        'estados' => Estado::whereIn('nombre', [
            'Pendiente',
            'Aceptado',
            'Rechazado',
            'Entregado',
        ])->get(),
        'stock' => $stockPorSustancia,
        'stockReal' => $stockPorSustanciaReal,
        'autorizantes' => $users, // Usar los usuarios filtrados
        'entregantes' => $users, // Usar los usuarios filtrados
        'filters' => $filters,
        'isAdmin' => $isAdmin, // Pasar si es admin al frontend
        'flash' => [
            'success' => session('success'),
            'error' => session('error'),
        ],
    ]);
}





    public function ingresarStock(Request $request)
    {
        // Validación simple
        $request->validate([
            'sustancia_id' => 'required|exists:PLL_item_sustancias,id',
            'cantidad' => 'required|numeric|min:0.01',
            'observacion' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            // Obtener el estado "Entregado"
            $estadoEntregado = Estado::where('nombre', 'Entregado')->first();

            // Buscar el último movimiento por fecha de entrega para esta sustancia
            $ultimoMovimiento = MovimientoSustancia::where('sustancia_id', $request->sustancia_id)
                ->whereNotNull('fecha_entrega') // Solo movimientos con fecha de entrega
                ->orderBy('fecha_entrega', 'desc')
                ->orderBy('created_at', 'desc')
                ->first();

            // Calcular el nuevo saldo
            $saldoAnterior = $ultimoMovimiento ? $ultimoMovimiento->saldo : 0;
            $nuevoSaldo = $saldoAnterior + $request->cantidad;

            // Crear el movimiento
            MovimientoSustancia::create([
                'tiempo' => now(),
                'user_id' => auth()->id(),
                'sustancia_id' => $request->sustancia_id,
                'cantidad' => $request->cantidad,
                'estado_id' => $estadoEntregado->id,
                'tipo' => 1, // 1 = Ingreso, 0 = Egreso
                'autorizante_id' => auth()->id(),
                'entregante_id' => auth()->id(),
                'fecha_entrega' => now(),
                'saldo' => $nuevoSaldo,
                'observacion' => $request->observacion ?? 'Ingreso directo de stock desde panel',
            ]);

            DB::commit();

            return redirect()->back()
                ->with('success', 'Stock ingresado correctamente');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Error al ingresar stock: ' . $e->getMessage());
        }
    }



    public function solicitarSustancia(Request $request)
    {
        // Validación simple
        $request->validate([
            'sustancia_id' => 'required|exists:PLL_item_sustancias,id',
            'cantidad' => 'required|numeric|min:0.01',
            'observacion' => 'nullable|string|max:500',
        ]);

        try {


            // Obtener el estado "Pendiente"
            $estadoPendiente = Estado::where('nombre', 'Pendiente')->first();

            // Calcular stock disponible usando el helper
            $stockDisponible = MovimientoSustancia::getStockDisponible($request->sustancia_id);

            if ($stockDisponible < $request->cantidad) {

                return redirect()->back()
                    ->with('error', 'Stock insuficiente para realizar la solicitud. Stock disponible: ' . $stockDisponible);
            }
            DB::beginTransaction();
            // Crear el movimiento como solicitud
            MovimientoSustancia::create([
                'tiempo' => now(),
                'user_id' => auth()->id(),
                'sustancia_id' => $request->sustancia_id,
                'cantidad' => $request->cantidad,
                'estado_id' => $estadoPendiente->id,
                'tipo' => 0, // 0 = Egreso (Solicitud)
                'autorizante_id' => null,
                'entregante_id' => null,
                'fecha_entrega' => null, // Pendiente de entrega
                'saldo' => null, // El saldo se establecerá cuando se entregue
                'observacion' => $request->observacion ?? 'Solicitud de sustancia',
            ]);

            DB::commit();

            $sustancia = ItemSustancia::find($request->sustancia_id);

            return redirect()->back()
                ->with('success', "Solicitud de {$sustancia->nombre} enviada correctamente");
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Error al enviar solicitud: ' . $e->getMessage());
        }
    }


    public function aceptar($id)
    {
        try {

            $movimiento = MovimientoSustancia::with('sustancia')->findOrFail($id);

            // Verificar que esté pendiente
            if ($movimiento->estado->nombre !== 'Pendiente') {
                return redirect()->back()
                    ->with('error', 'Este movimiento ya ha sido procesado');
            }

            // Verificar stock disponible ANTES de aceptar
            $stockDisponible = MovimientoSustancia::getStockDisponible($movimiento->sustancia_id);

            if ($stockDisponible < $movimiento->cantidad) {
                return redirect()->back()
                    ->with('error', 'Stock insuficiente para aceptar la solicitud. Stock disponible: ' . $stockDisponible);
            }

            DB::beginTransaction();
            // Obtener estado "Aceptado"
            $estadoAceptado = Estado::where('nombre', 'Aceptado')->first();

            // Actualizar movimiento
            $movimiento->update([
                'estado_id' => $estadoAceptado->id,
                'autorizante_id' => auth()->id(),
                'fecha_entrega' => null, // Aún no entregado
            ]);

            DB::commit();

            return redirect()->back()
                ->with('success', 'Movimiento aceptado correctamente');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Error al aceptar movimiento: ' . $e->getMessage());
        }
    }

    public function rechazar($id)
    {
        try {
            DB::beginTransaction();

            $movimiento = MovimientoSustancia::findOrFail($id);

            // Verificar que esté pendiente
            if ($movimiento->estado->nombre !== 'Pendiente') {
                return redirect()->back()
                    ->with('error', 'Este movimiento ya ha sido procesado');
            }

            // Obtener estado "Rechazado"
            $estadoRechazado = Estado::where('nombre', 'Rechazado')->first();



            // Actualizar movimiento
            $movimiento->update([
                'estado_id' => $estadoRechazado->id,
                'autorizante_id' => auth()->id(),
            ]);

            DB::commit();

            return redirect()->back()
                ->with('success', 'Movimiento rechazado correctamente');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Error al rechazar movimiento: ' . $e->getMessage());
        }
    }

    public function entregar(Request $request, $id)
    {
        $request->validate([
            'cantidad_entregada' => 'required|numeric|min:0',
        ]);

        try {

            $movimiento = MovimientoSustancia::with('sustancia')->findOrFail($id);

            // Verificar que esté aceptado
            if ($movimiento->estado->nombre !== 'Aceptado') {
                return redirect()->back()
                    ->with('error', 'Solo se pueden entregar movimientos aceptados');
            }

            // Verificar stock disponible (excluyendo esta solicitud que ya está aceptada)
            $stockDisponible = MovimientoSustancia::getStockDisponibleReal($movimiento->sustancia_id);

            // NOTA: getStockDisponible ya incluye las solicitudes aceptadas en el cálculo
            // Si la cantidad entregada es mayor que la solicitada, validar
            if ($request->cantidad_entregada > $stockDisponible) {
                return redirect()->back()
                    ->with('error', 'No puede entregar más de lo q se tiene en stock disponible. Stock disponible: ' . $stockDisponible);
            }

            DB::beginTransaction();
            // Obtener estado "Entregado"
            $estadoEntregado = Estado::where('nombre', 'Entregado')->first();

            // Buscar el último movimiento con fecha de entrega para calcular saldo
            $ultimoMovimiento = MovimientoSustancia::where('sustancia_id', $movimiento->sustancia_id)
                ->whereNotNull('fecha_entrega')
                ->orderBy('fecha_entrega', 'desc')
                ->orderBy('created_at', 'desc')
                ->first();

            // Calcular nuevo saldo
            $saldoAnterior = $ultimoMovimiento ? $ultimoMovimiento->saldo : 0;
            $nuevoSaldo = $saldoAnterior - $request->cantidad_entregada; // Restar porque es egreso

            // Crear observación con las cantidades
            $observacion = "Solicitado: {$movimiento->cantidad}, Entregado: {$request->cantidad_entregada}";

            // Agregar observación anterior si existe
            if (!empty($movimiento->observacion)) {
                $observacion = $movimiento->observacion . " | " . $observacion;
            }

            // Actualizar movimiento
            $movimiento->update([
                'estado_id' => $estadoEntregado->id,
                'entregante_id' => auth()->id(),
                'fecha_entrega' => now(),
                'saldo' => $nuevoSaldo,
                'cantidad' => $request->cantidad_entregada, // Actualizar con la cantidad entregada
                'observacion' => $observacion,
            ]);

            DB::commit();

            return redirect()->back()
                ->with('success', 'Sustancia entregada correctamente. Stock actual: ' . $nuevoSaldo);
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Error al entregar sustancia: ' . $e->getMessage());
        }
    }


  public function pdf(Request $request)
{
    $user = auth()->user();
    $isAdmin = $user->hasRole('admin');
    $ubicacionId = $user->ubicacion_id;

    $query = MovimientoSustancia::with([
        'user',
        'sustancia.unidad',
        'autorizante',
        'entregante',
        'estado'
    ]);

    // Filtros
    if ($request->filled('fecha_desde')) {
        $query->whereDate('tiempo', '>=', $request->fecha_desde);
    }
    if ($request->filled('fecha_hasta')) {
        $query->whereDate('tiempo', '<=', $request->fecha_hasta);
    }
    if ($request->filled('sustancia_id')) {
        $query->where('sustancia_id', $request->sustancia_id);
    }

    // ✅ Solo movimientos con estado "Entregado"
    $estadoEntregado = Estado::where('nombre', 'Entregado')->first();
    if ($estadoEntregado) {
        $query->where('estado_id', $estadoEntregado->id);
    }

    // Filtrar por ubicación si no es admin
    if (!$isAdmin && $ubicacionId) {
        $query->whereHas('sustancia', function($q) use ($ubicacionId) {
            $q->where('ubicacion_id', $ubicacionId);
        });
    }

    $movimientos = $query->orderBy('tiempo')->get();

    // Recolectar usuarios involucrados (user, autorizante, entregante)
    $usuariosMap = [];
    foreach ($movimientos as $mov) {
        if ($mov->user && $mov->user->codigo) {
            $codigo = $mov->user->codigo;
            if (!isset($usuariosMap[$codigo])) {
                $usuariosMap[$codigo] = [
                    'codigo' => $codigo,
                    'nombre' => trim(($mov->user->name ?? '') . ' ' . ($mov->user->apellido ?? '')),
                ];
            }
        }
        if ($mov->autorizante && $mov->autorizante->codigo) {
            $codigo = $mov->autorizante->codigo;
            if (!isset($usuariosMap[$codigo])) {
                $usuariosMap[$codigo] = [
                    'codigo' => $codigo,
                    'nombre' => trim(($mov->autorizante->name ?? '') . ' ' . ($mov->autorizante->apellido ?? '')),
                ];
            }
        }
        if ($mov->entregante && $mov->entregante->codigo) {
            $codigo = $mov->entregante->codigo;
            if (!isset($usuariosMap[$codigo])) {
                $usuariosMap[$codigo] = [
                    'codigo' => $codigo,
                    'nombre' => trim(($mov->entregante->name ?? '') . ' ' . ($mov->entregante->apellido ?? '')),
                ];
            }
        }
    }

    $usuariosInvolucrados = array_values($usuariosMap);

    return response()->json([
        'movimientos' => $movimientos,
        'usuarios_involucrados' => $usuariosInvolucrados,
    ]);
}
}
