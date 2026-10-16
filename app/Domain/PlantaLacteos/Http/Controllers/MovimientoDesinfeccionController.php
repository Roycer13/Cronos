<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\ItemDesinfeccion;
use App\Domain\PlantaLacteos\Models\DestinoDesinfeccion;
use App\Domain\PlantaLacteos\Models\MovimientoDesinfeccion;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MovimientoDesinfeccionController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole('admin');
        $ubicacionId = $user->ubicacion_id;

        $filters = $request->only([
            'search',
            'user_id',
            'item_desinfeccion_id',
            'destino_desinfeccion_id',
            'autorizante_id',
            'entregante_id',
            'tiempo',
            'estado_id',
            'fecha_entrega',
            'tipo',
        ]);

        // Consulta base para items de desinfección
        $itemsQuery = ItemDesinfeccion::with('unidad');
        if (!$isAdmin && $ubicacionId) {
            $itemsQuery->where('ubicacion_id', $ubicacionId);
        }
        $items = $itemsQuery->get();

        // Consulta base para destinos
        $destinosQuery = DestinoDesinfeccion::with(['unidad', 'item:id,id']); // Agrega 'item'
        if (!$isAdmin && $ubicacionId) {
            $destinosQuery->where('ubicacion_id', $ubicacionId);
        }
        $destinos = $destinosQuery->get();


        // Consulta base de movimientos
        $movimientosQuery = MovimientoDesinfeccion::with([
            'user',
            'item.unidad',
            'destino.unidad',
            'autorizante',
            'entregante',
            'estado',
            'ubicacion'
        ]);

        if (!$isAdmin && $ubicacionId) {
            $movimientosQuery->whereHas('item', function ($query) use ($ubicacionId) {
                $query->where('ubicacion_id', $ubicacionId);
            });
        }

        $movimientos = $movimientosQuery
            ->filter($filters)
            ->orderBy($request->get('sort', 'created_at'), 'desc')
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Stock por item (Aceptado)
        $stockQuery = MovimientoDesinfeccion::select(
            'item_desinfeccion_id',
            DB::raw("SUM(CASE WHEN tipo = 1 THEN cantidad_item ELSE -cantidad_item END) as stock")
        )
            ->whereHas('estado', function ($query) {
                $query->whereIn('nombre', ['Aceptado']);
            });

        if (!$isAdmin && $ubicacionId) {
            $stockQuery->whereHas('item', function ($query) use ($ubicacionId) {
                $query->where('ubicacion_id', $ubicacionId);
            });
        }

        $stockPorItem = $stockQuery
            ->groupBy('item_desinfeccion_id')
            ->pluck('stock', 'item_desinfeccion_id');

        // Stock real por item (Entregado)
        $stockRealQuery = MovimientoDesinfeccion::select(
            'item_desinfeccion_id',
            DB::raw("SUM(CASE WHEN tipo = 1 THEN cantidad_item ELSE -cantidad_item END) as stock")
        )
            ->whereHas('estado', function ($query) {
                $query->whereIn('nombre', ['Entregado']);
            });

        if (!$isAdmin && $ubicacionId) {
            $stockRealQuery->whereHas('item', function ($query) use ($ubicacionId) {
                $query->where('ubicacion_id', $ubicacionId);
            });
        }

        $stockPorItemReal = $stockRealQuery
            ->groupBy('item_desinfeccion_id')
            ->pluck('stock', 'item_desinfeccion_id');

        // Obtener usuarios
        $usersQuery = User::query();
        if (!$isAdmin && $ubicacionId) {
            $usersQuery->where('ubicacion_id', $ubicacionId);
        }
        $users = $usersQuery->get();



        return Inertia::render('planta_lacteos/limpiezaOrdenDesinfeccion/desinfeccion/index', [
            'movimientos' => $movimientos,
            'users' => $users,
            'items' => $items,
            'destinos' => $destinos,
            'estados' => Estado::whereIn('nombre', [
                'Pendiente',
                'Aceptado',
                'Rechazado',
                'Entregado',
            ])->get(),
            'stock' => $stockPorItem,
            'stockReal' => $stockPorItemReal,
            'autorizantes' => $users,
            'entregantes' => $users,
            'filters' => $filters,
            'isAdmin' => $isAdmin,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function ingresarStock(Request $request)
    {
        $request->validate([
            'item_desinfeccion_id' => 'required|exists:PLL_item_desinfecciones,id',
            'cantidad_item' => 'required|numeric|min:0.01',
            'observacion' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            // Obtener el estado "Entregado"
            $estadoEntregado = Estado::where('nombre', 'Entregado')->first();

            // Buscar el último movimiento por fecha de entrega para este item
            $ultimoMovimiento = MovimientoDesinfeccion::where('item_desinfeccion_id', $request->item_desinfeccion_id)
                ->whereNotNull('fecha_entrega')
                ->orderBy('fecha_entrega', 'desc')
                ->orderBy('created_at', 'desc')
                ->first();

            // Calcular el nuevo saldo
            $saldoAnterior = $ultimoMovimiento ? $ultimoMovimiento->saldo : 0;

            // 🔑 NORMALIZAR DECIMALES (evita notación científica)
            $cantidadItem = number_format(
                (float) $request->cantidad_item,
                10,
                '.',
                ''
            );

            $nuevoSaldo = number_format(
                (float) ($saldoAnterior + $request->cantidad_item),
                10,
                '.',
                ''
            );

            // Crear el movimiento (ingreso sin destino)
            MovimientoDesinfeccion::create([
                'tiempo' => now(),
                'user_id' => auth()->id(),
                'item_desinfeccion_id' => $request->item_desinfeccion_id,
                'destino_desinfeccion_id' => null,
                'cantidad_item' => $cantidadItem, // ✅ normalizado
                'cantidad_mezcla' => 0,
                'estado_id' => $estadoEntregado->id,
                'tipo' => 1,
                'autorizante_id' => auth()->id(),
                'entregante_id' => auth()->id(),
                'ubicacion_id' => auth()->user()->ubicacion->id,
                'fecha_entrega' => now(),
                'saldo' => $nuevoSaldo, // ✅ normalizado
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


    public function solicitarDesinfeccion(Request $request)
    {
        $request->validate([
            'item_desinfeccion_id' => 'required|exists:PLL_item_desinfecciones,id',
            'destino_desinfeccion_id' => 'required|exists:PLL_destino_desinfecciones,id',
            'cantidad_item' => 'required|numeric',
            'cantidad_mezcla' => 'required|numeric',
            'observacion' => 'nullable|string|max:500',
        ]);

        try {
            // Obtener el estado "Pendiente"
            $estadoPendiente = Estado::where('nombre', 'Pendiente')->first();

            // Obtener el destino para acceder al multiplicador
            $destino = DestinoDesinfeccion::find($request->destino_desinfeccion_id);

            // Aplicar el multiplicador a la cantidad de mezcla para validación real
            $multiplicador = $destino->multiplicador ?? 1;
            $cantidadMezclaReal = $request->cantidad_mezcla * $multiplicador;

            // Calcular la cantidad REAL de item necesaria con multiplicador
            $item = ItemDesinfeccion::find($request->item_desinfeccion_id);
            $cantidadItemRealNecesaria =
                ($destino->concentracion * $cantidadMezclaReal) / $item->concentracion;

            // 🔑 NORMALIZAR para SQL Server
            $cantidadItemRealNecesaria = number_format(
                (float) $cantidadItemRealNecesaria,
                10, // decimales necesarios
                '.',
                ''
            );

            // Calcular stock disponible usando la misma lógica que MovimientoSustancia
            $stockDisponible = $this->getStockDisponible($request->item_desinfeccion_id);

            if ($stockDisponible < $cantidadItemRealNecesaria) {
                return redirect()->back()
                    ->with('error', 'Stock insuficiente para realizar la solicitud. Stock disponible: ' . $stockDisponible . ', Cantidad real necesaria: ' . round($cantidadItemRealNecesaria, 2));
            }

            DB::beginTransaction();

            // Crear el movimiento como solicitud
            MovimientoDesinfeccion::create([
                'tiempo' => now(),
                'user_id' => auth()->id(),
                'item_desinfeccion_id' => $request->item_desinfeccion_id,
                'destino_desinfeccion_id' => $request->destino_desinfeccion_id,
                'cantidad_item' => $cantidadItemRealNecesaria, // Guardamos la cantidad REAL
                'cantidad_mezcla' => $request->cantidad_mezcla,
                'estado_id' => $estadoPendiente->id,
                'tipo' => 0, // 0 = Egreso (Solicitud)
                'autorizante_id' => null,
                'entregante_id' => null,
                'fecha_entrega' => null,
                'saldo' => null,
                'ubicacion_id' => auth()->user()->ubicacion->id,
                'observacion' => $request->observacion ?? 'Solicitud de desinfección',
            ]);

            DB::commit();

            $item = ItemDesinfeccion::find($request->item_desinfeccion_id);

            return redirect()->back()
                ->with('success', "Solicitud de {$item->nombre} para {$destino->nombre} enviada correctamente");
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Error al enviar solicitud: ' . $e->getMessage());
        }
    }


    public function aceptar($id)
    {
        try {
            $movimiento = MovimientoDesinfeccion::with(['item', 'destino'])->findOrFail($id);

            // Verificar que esté pendiente
            if ($movimiento->estado->nombre !== 'Pendiente') {
                return redirect()->back()
                    ->with('error', 'Este movimiento ya ha sido procesado');
            }

            // Obtener el multiplicador del destino para validación real
            $multiplicador = $movimiento->destino->multiplicador ?? 1;
            $cantidadMezclaReal = $movimiento->cantidad_mezcla * $multiplicador;

            // Calcular la cantidad REAL de item necesaria
            $cantidadItemRealNecesaria =
                ($movimiento->destino->concentracion * $cantidadMezclaReal)
                / $movimiento->item->concentracion;

            $cantidadItemRealNecesaria = number_format(
                (float) $cantidadItemRealNecesaria,
                10,
                '.',
                ''
            );

            // Calcular stock disponible (misma lógica que al solicitar)
            $stockDisponible = $this->getStockDisponible($movimiento->item_desinfeccion_id);

            // Validar contra la cantidad REAL necesaria
            if ($stockDisponible < $cantidadItemRealNecesaria) {
                return redirect()->back()
                    ->with('error', 'Stock insuficiente para aceptar la solicitud. Stock disponible: ' . $stockDisponible . ', Cantidad real necesaria: ' . round($cantidadItemRealNecesaria, 2));
            }

            DB::beginTransaction();

            // Obtener estado "Aceptado"
            $estadoAceptado = Estado::where('nombre', 'Aceptado')->first();

            // Actualizar movimiento con la cantidad REAL
            $movimiento->update([
                'estado_id' => $estadoAceptado->id,
                'autorizante_id' => auth()->id(),
                'fecha_entrega' => null,
                'cantidad_item' => $cantidadItemRealNecesaria, // Actualizar con cantidad REAL
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


    public function entregar(Request $request, $id)
    {
        $request->validate([
            'cantidad_item_entregada' => 'required|numeric|min:0',
            'observacion' => 'nullable|string|max:500',
        ]);

        try {
            $movimiento = MovimientoDesinfeccion::with(['item', 'destino'])->findOrFail($id);

        // Verificar que esté aceptado
        if ($movimiento->estado->nombre !== 'Aceptado') {
            return redirect()->back()
                ->with('error', 'Solo se pueden entregar movimientos aceptados');
        }

        // Obtener el multiplicador del destino
        $multiplicador = $movimiento->destino->multiplicador ?? 1;

        // Calcular la cantidad real de mezcla
        $cantidadMezclaReal = $movimiento->cantidad_mezcla * $multiplicador;

        // Cálculo solo informativo
        $cantidadItemRealNecesaria =
            ($movimiento->destino->concentracion * $cantidadMezclaReal)
            / $movimiento->item->concentracion;

        // Stock físico
        $stockFisico = $this->getStockFisico($movimiento->item_desinfeccion_id);

        if ($request->cantidad_item_entregada > $stockFisico) {
            return redirect()->back()
                ->with('error', 'No puede entregar más de lo que se tiene en stock físico. Stock físico disponible: ' . $stockFisico);
        }

        DB::beginTransaction();

        // Estado "Entregado"
        $estadoEntregado = Estado::where('nombre', 'Entregado')->first();

        // Último movimiento entregado
        $ultimoMovimiento = MovimientoDesinfeccion::where('item_desinfeccion_id', $movimiento->item_desinfeccion_id)
            ->whereNotNull('fecha_entrega')
            ->orderBy('fecha_entrega', 'desc')
            ->orderBy('created_at', 'desc')
            ->first();

        $saldoAnterior = $ultimoMovimiento ? $ultimoMovimiento->saldo : 0;

        // 🔑 NORMALIZAR DECIMALES
        $cantidadEntregada = number_format(
            (float) $request->cantidad_item_entregada,
            10,
            '.',
            ''
        );

        $nuevoSaldo = number_format(
            (float) ($saldoAnterior - $request->cantidad_item_entregada),
            10,
            '.',
            ''
        );

        // Observación
        $observacionBase = "Solicitado: " . round($cantidadItemRealNecesaria, 2) . ", Entregado: {$request->cantidad_item_entregada}";
        if ($multiplicador != 1) {
            $observacionBase .= " (Multiplicador de destino: {$multiplicador}x, Mezcla real: " . round($cantidadMezclaReal, 2) . ")";
        }

        $observacion = trim($request->observacion ?? '');
        if ($observacion !== '') {
            $observacion = $observacion . ' | ' . $observacionBase;
        } elseif (!empty($movimiento->observacion)) {
            $observacion = $movimiento->observacion . ' | ' . $observacionBase;
        } else {
            $observacion = $observacionBase;
        }

        // Actualizar movimiento
        $movimiento->update([
            'estado_id' => $estadoEntregado->id,
            'entregante_id' => auth()->id(),
            'fecha_entrega' => now(),
            'saldo' => $nuevoSaldo,                 // ✅ normalizado
            'cantidad_item' => $cantidadEntregada, // ✅ normalizado
            'observacion' => $observacion,
        ]);

        DB::commit();

        return redirect()->back()
            ->with('success', 'Item entregado correctamente. Stock actual: ' . $nuevoSaldo);
    } catch (\Exception $e) {
        DB::rollBack();

        return redirect()->back()
            ->with('error', 'Error al entregar item: ' . $e->getMessage());
    }
}


    /**
     * Obtener stock físico (solo movimientos Entregado)
     * Stock físico = Ingresos entregados - Egresos entregados
     */
    private function getStockFisico($itemId)
    {
        $estadoEntregado = Estado::where('nombre', 'Entregado')->first();

        // Calcular ingresos entregados
        $ingresos = MovimientoDesinfeccion::where('item_desinfeccion_id', $itemId)
            ->where('tipo', 1) // Ingresos
            ->where('estado_id', $estadoEntregado->id)
            ->sum('cantidad_item') ?? 0;

        // Calcular egresos entregados
        $egresosEntregados = MovimientoDesinfeccion::where('item_desinfeccion_id', $itemId)
            ->where('tipo', 0) // Egresos
            ->where('estado_id', $estadoEntregado->id)
            ->sum('cantidad_item') ?? 0;

        // Stock físico = Ingresos entregados - Egresos entregados
        return $ingresos - $egresosEntregados;
    }
    public function rechazar($id)
    {
        try {
            DB::beginTransaction();

            $movimiento = MovimientoDesinfeccion::findOrFail($id);

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


    /**
     * Obtener stock disponible para un item
     */
    private function getStockDisponible($itemId)
    {
        $estadoEntregado = Estado::where('nombre', 'Entregado')->first();
        $estadoAceptado = Estado::where('nombre', 'Aceptado')->first();

        // Calcular ingresos entregados
        $ingresos = MovimientoDesinfeccion::where('item_desinfeccion_id', $itemId)
            ->where('tipo', 1) // Ingresos
            ->where('estado_id', $estadoEntregado->id)
            ->sum('cantidad_item') ?? 0;

        // Calcular egresos entregados
        $egresosEntregados = MovimientoDesinfeccion::where('item_desinfeccion_id', $itemId)
            ->where('tipo', 0) // Egresos
            ->where('estado_id', $estadoEntregado->id)
            ->sum('cantidad_item') ?? 0;

        // Calcular egresos aceptados (pero no entregados aún)
        $egresosAceptados = MovimientoDesinfeccion::where('item_desinfeccion_id', $itemId)
            ->where('tipo', 0) // Egresos
            ->where('estado_id', $estadoAceptado->id)
            ->sum('cantidad_item') ?? 0;

        // Stock disponible = Ingresos entregados - Egresos entregados - Egresos aceptados
        return $ingresos - $egresosEntregados - $egresosAceptados;
    }

    /**
     * Obtener stock disponible real (excluyendo solicitudes pendientes)
     */
    private function getStockDisponibleReal($itemId)
    {
        $estadoEntregado = Estado::where('nombre', 'Entregado')->first();

        // Calcular ingresos entregados
        $ingresos = MovimientoDesinfeccion::where('item_desinfeccion_id', $itemId)
            ->where('tipo', 1) // Ingresos
            ->where('estado_id', $estadoEntregado->id)
            ->sum('cantidad_item') ?? 0;

        // Calcular egresos entregados
        $egresosEntregados = MovimientoDesinfeccion::where('item_desinfeccion_id', $itemId)
            ->where('tipo', 0) // Egresos
            ->where('estado_id', $estadoEntregado->id)
            ->sum('cantidad_item') ?? 0;

        // Stock disponible = Ingresos entregados - Egresos entregados
        return $ingresos - $egresosEntregados;
    }



    /**
     * Método para calcular concentraciones (puedes ajustar según tu fórmula)
     */
    public function calcularConcentracion(Request $request)
    {
        $request->validate([
            'item_desinfeccion_id' => 'required|exists:PLL_item_desinfecciones,id',
            'destino_desinfeccion_id' => 'required|exists:PLL_destino_desinfecciones,id',
            'volumen_mezcla' => 'required|numeric|min:0.01',
        ]);

        $item = ItemDesinfeccion::find($request->item_desinfeccion_id);
        $destino = DestinoDesinfeccion::find($request->destino_desinfeccion_id);

        // Obtener el multiplicador del destino
        $multiplicador = $destino->multiplicador ?? 1;

        // Cálculo actualizado con multiplicador: (concentracion_destino * multiplicador * volumen_mezcla) / concentracion_item
        $cantidadItemNecesaria = ($destino->concentracion * $multiplicador * $request->volumen_mezcla) / $item->concentracion;

        return response()->json([
            'success' => true,
            'cantidad_item' => round($cantidadItemNecesaria, 2),
            'cantidad_mezcla' => $request->volumen_mezcla,
            'concentracion_item' => $item->concentracion,
            'concentracion_destino' => $destino->concentracion,
            'multiplicador' => $multiplicador,
            'cantidad_mezcla_real' => $request->volumen_mezcla * $multiplicador,
        ]);
    }

    public function pdf(Request $request)
{
    $user = auth()->user();
    $isAdmin = $user->hasRole('admin');
    $ubicacionId = $user->ubicacion_id;

    $query = MovimientoDesinfeccion::with([
        'user',
        'item.unidad',
        'destino',
        'autorizante',
        'entregante',
        'estado'
    ]);

    // Filtros de fecha con rango completo
    if ($request->filled('fecha_desde')) {
        $fechaDesde = Carbon::parse($request->fecha_desde)->startOfDay();
        $query->where('tiempo', '>=', $fechaDesde);
    }
    if ($request->filled('fecha_hasta')) {
        $fechaHasta = Carbon::parse($request->fecha_hasta)->endOfDay();
        $query->where('tiempo', '<=', $fechaHasta);
    }
    if ($request->filled('item_desinfeccion_id')) {
        $query->where('item_desinfeccion_id', $request->item_desinfeccion_id);
    }

    // Solo movimientos con estado "Entregado"
    $estadoEntregado = Estado::where('nombre', 'Entregado')->first();
    if ($estadoEntregado) {
        $query->where('estado_id', $estadoEntregado->id);
    }

    // Filtrar por ubicación si no es admin (a través del item)
    if (!$isAdmin && $ubicacionId) {
        $query->whereHas('item', function($q) use ($ubicacionId) {
            $q->where('ubicacion_id', $ubicacionId);
        });
    }

    $movimientos = $query->orderBy('tiempo')->get();

    // Recolectar usuarios involucrados
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


public function corregirStocks()
{
    try {
        DB::beginTransaction();

        $estadoEntregado = Estado::where('nombre', 'Entregado')->first();
        if (!$estadoEntregado) {
            throw new \Exception('No se encontró el estado "Entregado"');
        }

        $sql = "
            UPDATE t
            SET t.saldo = c.saldo_correcto
            FROM PLL_movimiento_desinfecciones AS t
            INNER JOIN (
                SELECT
                    id,
                    SUM(
                        CASE
                            WHEN tipo = 1 THEN cantidad_item
                            WHEN tipo = 0 THEN -cantidad_item
                            ELSE 0
                        END
                    ) OVER (
                        PARTITION BY item_desinfeccion_id
                        ORDER BY fecha_entrega, id
                    ) AS saldo_correcto
                FROM PLL_movimiento_desinfecciones
                WHERE estado_id = ?
            ) AS c ON t.id = c.id
        ";

        $filasActualizadas = DB::update($sql, [$estadoEntregado->id]);

        DB::commit();

        return redirect()->back()->with(
            'success',
            "Stocks corregidos correctamente. Registros actualizados: {$filasActualizadas}"
        );
    } catch (\Exception $e) {
        DB::rollBack();
        return redirect()->back()->with(
            'error',
            'Error al corregir stocks: ' . $e->getMessage()
        );
    }
}
}
