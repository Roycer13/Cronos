<?php

namespace App\Domain\ModulosComunes\Canastillos\Http\Controllers;

use App\Domain\ModulosComunes\Canastillos\Http\Requests\AjusteRequest;
use App\Http\Controllers\Controller;
use App\Domain\ModulosComunes\Canastillos\Models\Movimiento;
use App\Domain\ModulosComunes\Canastillos\Models\Almacen;
use App\Domain\ModulosComunes\Canastillos\Models\Vendedor;
use App\Domain\ModulosComunes\Canastillos\Models\Canastillo;
use App\Domain\ModulosComunes\Canastillos\Services\MovimientoService;
use App\Domain\ModulosComunes\Canastillos\Http\Requests\PrestamoRequest;
use App\Domain\ModulosComunes\Canastillos\Http\Requests\DevolucionRequest;
use App\Domain\ModulosComunes\Canastillos\Http\Requests\TransferenciaRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class MovimientoController extends Controller
{
    protected MovimientoService $movimientoService;

    public function __construct(MovimientoService $movimientoService)
    {
        $this->movimientoService = $movimientoService;
    }

    /**
     * Listado de movimientos con restricción por almacenes del usuario (si no es admin).
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $isAdmin = $user && ($user->is_admin ?? $user->hasRole('admin'));

        // Base de consulta
        $query = Movimiento::with([
            'almacen',
            'almacen2',
            'vendedor',
            'responsable',
            'detalles.canastillo',
            'estado',
        ]);

        // Si no es administrador, limitar a los almacenes donde es responsable
        if (!$isAdmin && $user) {
            $almacenesIds = $user->almacenes()->pluck('almacen_id')->toArray();
            $query->whereIn('almacen_id', $almacenesIds);
        }

        // Aplicar filtros
        $filters = $request->only([
            'almacen_id',
            'vendedor_id',
            'tipo_movimiento',
            'fecha_desde',
            'fecha_hasta',
            'responsable_id',
        ]);
        $query->filter($filters);

        $movimientos = $query->orderBy($request->get('sort', 'created_at'), $request->get('direction', 'desc'))
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Cargar lista de almacenes para el filtro (solo los que el usuario puede ver)
        if (!$isAdmin && $user) {
            $almacenes = $user->almacenes()->select('CAN_almacenes.id', 'CAN_almacenes.nombre')->get();
        } else {
            $almacenes = Almacen::select('id', 'nombre')->get();
        }

        $vendedores = Vendedor::select('id', 'nombre', 'apellido')->get();
        $tiposMovimiento = [
            'prestamo' => 'Préstamo',
            'devolucion' => 'Devolución',
            'transferencia_salida' => 'Transferencia Salida',
            'transferencia_entrada' => 'Transferencia Entrada',
            'ajuste' => 'Todos los ajustes',
        ];

        return Inertia::render('canastillos/movimientos/index', [
            'movimientos' => $movimientos,
            'almacenes' => $almacenes,
            'vendedores' => $vendedores,
            'tiposMovimiento' => $tiposMovimiento,
            'filters' => $filters,
        ]);
    }

    /**
     * Mostrar detalle de un movimiento.
     */
    public function show(Movimiento $movimiento)
    {
        $movimiento->load([
            'almacen',
            'almacen2',
            'vendedor',
            'responsable',
            'responsable2',
            'detalles.canastillo',
        ]);

        return Inertia::render('canastillos/movimientos/show', [
            'movimiento' => $movimiento,
        ]);
    }

    /**
     * Formulario de préstamo: mostrar solo almacenes donde el usuario es responsable (si no es admin).
     */
    public function createPrestamo()
    {
        $user = Auth::user();
        $isAdmin = $user && ($user->is_admin ?? $user->hasRole('admin'));

        if (!$isAdmin && $user) {
            // ✅ Corregido: calificar la columna id
            $almacenes = $user->almacenes()->select('CAN_almacenes.id', 'CAN_almacenes.nombre')->get();
        } else {
            $almacenes = Almacen::select('id', 'nombre')->get();
        }

        $vendedores = Vendedor::select('id', 'nombre', 'apellido')->get();
        $canastillos = Canastillo::select('id', 'nombre', 'tamaño')->get();

        return Inertia::render('canastillos/movimientos/prestamo', [
            'almacenes' => $almacenes,
            'vendedores' => $vendedores,
            'canastillos' => $canastillos,
        ]);
    }

    public function storePrestamo(PrestamoRequest $request)
    {
        try {
            $this->movimientoService->storePrestamo($request->validated());
            return redirect()->route('canastillos.movimientos.index')
                ->with('success', 'Préstamo registrado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al registrar préstamo: ' . $e->getMessage());
        }
    }

    /**
     * Formulario de devolución.
     */
    public function createDevolucion()
    {
        $user = Auth::user();
        $isAdmin = $user && ($user->is_admin ?? $user->hasRole('admin'));

        if (!$isAdmin && $user) {
            // ✅ Corregido
            $almacenes = $user->almacenes()->select('CAN_almacenes.id', 'CAN_almacenes.nombre')->get();
        } else {
            $almacenes = Almacen::select('id', 'nombre')->get();
        }

        $vendedores = Vendedor::select('id', 'nombre', 'apellido')->get();
        $canastillos = Canastillo::select('id', 'nombre', 'tamaño')->get();

        return Inertia::render('canastillos/movimientos/devolucion', [
            'almacenes' => $almacenes,
            'vendedores' => $vendedores,
            'canastillos' => $canastillos,
        ]);
    }

    public function storeDevolucion(DevolucionRequest $request)
    {
        try {
            $this->movimientoService->storeDevolucion($request->validated());
            return redirect()->route('canastillos.movimientos.index')
                ->with('success', 'Devolución registrada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al registrar devolución: ' . $e->getMessage());
        }
    }

    /**
     * Formulario de transferencia.
     */
    public function createTransferencia()
{
    $user = Auth::user();
    $isAdmin = $user && ($user->is_admin ?? $user->hasRole('admin'));

    // Almacenes origen (solo los que puede usar como origen)
    if (!$isAdmin && $user) {
        $almacenesOrigen = $user->almacenes()->select('CAN_almacenes.id', 'CAN_almacenes.nombre')->get();
    } else {
        $almacenesOrigen = Almacen::select('id', 'nombre')->get();
    }

    // Almacenes destino (todos los almacenes, sin restricción)
    $almacenesDestino = Almacen::select('id', 'nombre')->get();

    $canastillos = Canastillo::select('id', 'nombre', 'tamaño')->get();

    return Inertia::render('canastillos/movimientos/transferencia', [
        'almacenesOrigen' => $almacenesOrigen,
        'almacenesDestino' => $almacenesDestino,
        'canastillos' => $canastillos,
    ]);
}
    public function storeTransferencia(TransferenciaRequest $request)
    {
        try {
            $this->movimientoService->storeTransferencia($request->validated());
            return redirect()->route('canastillos.movimientos.index')
                ->with('success', 'Transferencia realizada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al realizar transferencia: ' . $e->getMessage());
        }
    }

    public function destroy(Movimiento $movimiento)
    {
        try {
            $this->movimientoService->delete($movimiento);
            return redirect()->route('canastillos.movimientos.index')
                ->with('success', 'Movimiento eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al eliminar movimiento: ' . $e->getMessage());
        }
    }

    public function createAjuste()
    {
        $user = Auth::user();
        $isAdmin = $user && ($user->is_admin ?? $user->hasRole('admin'));

        if (!$isAdmin && $user) {
            // ✅ Corregido
            $almacenes = $user->almacenes()->select('CAN_almacenes.id', 'CAN_almacenes.nombre')->get();
        } else {
            $almacenes = Almacen::select('id', 'nombre')->get();
        }

        $canastillos = Canastillo::select('id', 'nombre', 'tamaño')->get();

        return Inertia::render('canastillos/movimientos/ajuste', [
            'almacenes' => $almacenes,
            'canastillos' => $canastillos,
        ]);
    }

    public function storeAjuste(AjusteRequest $request)
    {
        try {
            $this->movimientoService->storeAjuste($request->validated());
            return redirect()->route('canastillos.movimientos.index')
                ->with('success', 'Ajuste de inventario registrado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al registrar ajuste: ' . $e->getMessage());
        }
    }


    /**
 * Lista las transferencias pendientes que el usuario puede confirmar (como destino).
 */
public function transferenciasPendientes(Request $request)
{
    $user = Auth::user();
    $isAdmin = $user && ($user->is_admin ?? $user->hasRole('admin'));

    // Obtener IDs de almacenes a los que el usuario tiene acceso (destino)
    if ($isAdmin) {
        $almacenesIds = Almacen::pluck('id')->toArray();
    } else {
        $almacenesIds = $user->almacenes()->pluck('almacen_id')->toArray();
    }

    $pendientes = Movimiento::with(['almacen', 'almacen2', 'responsable', 'detalles.canastillo'])
        ->where('tipo_movimiento', 'transferencia_entrada')
        ->whereIn('almacen_id', $almacenesIds) // almacen_id es el destino
        ->where('estado_id', Estado::where('nombre', 'Pendiente')->value('id'))
        ->orderBy('created_at', 'desc')
        ->get();

    return Inertia::render('canastillos/movimientos/pendientes', [
        'pendientes' => $pendientes,
    ]);
}

/**
 * Aceptar una transferencia pendiente.
 */
public function aceptarTransferencia(Movimiento $movimiento)
{
    try {
        $this->movimientoService->aceptarTransferencia($movimiento, auth()->id());
        return redirect()->back()->with('success', 'Transferencia aceptada y stock actualizado.');
    } catch (\Exception $e) {
        return redirect()->back()->with('error', $e->getMessage());
    }
}

/**
 * Rechazar una transferencia pendiente.
 */
public function rechazarTransferencia(Movimiento $movimiento)
{
    try {
        $this->movimientoService->rechazarTransferencia($movimiento);
        return redirect()->back()->with('success', 'Transferencia rechazada.');
    } catch (\Exception $e) {
        return redirect()->back()->with('error', $e->getMessage());
    }
}
}
