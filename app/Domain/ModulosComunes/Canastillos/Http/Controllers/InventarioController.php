<?php

namespace App\Domain\ModulosComunes\Canastillos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\ModulosComunes\Canastillos\Models\Almacen;
use App\Domain\ModulosComunes\Canastillos\Services\InventarioService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class InventarioController extends Controller
{
    protected InventarioService $inventarioService;

    public function __construct(InventarioService $inventarioService)
    {
        $this->inventarioService = $inventarioService;
    }

    /**
     * Muestra el inventario de un almacén (el seleccionado o el primero accesible).
     * Nunca se muestra inventario global.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $puedeVerTodos = $user && (
            $user->is_admin ??
            $user->hasRole('admin') ??
            $user->hasPermissionTo('r_todosLosAlmacenes')
        );

        // Obtener almacenes a los que tiene acceso
        if ($puedeVerTodos) {
            $almacenes = Almacen::select('id', 'nombre')->orderBy('nombre')->get();
        } else {
            $almacenes = $user->almacenes()->select('CAN_almacenes.id', 'CAN_almacenes.nombre')->get();
        }

        // Determinar qué almacén mostrar (seleccionado por filtro o el primero)
        $almacenId = $request->get('almacen_id');
        if ($almacenId && $almacenes->contains('id', $almacenId)) {
            $selectedAlmacen = $almacenes->firstWhere('id', $almacenId);
        } else {
            $selectedAlmacen = $almacenes->first();
        }

        // Si no hay almacenes accesibles, mostrar vacío
        if (!$selectedAlmacen) {
            return Inertia::render('canastillos/inventario/index', [
                'almacenes' => $almacenes,
                'inventario' => [],
                'selectedAlmacen' => null,
                'puedeVerTodos' => $puedeVerTodos,
            ]);
        }

        // Obtener inventario del almacén seleccionado (siempre array)
        $inventario = $this->inventarioService->getInventarioPorAlmacen($selectedAlmacen->id);

        return Inertia::render('canastillos/inventario/index', [
            'almacenes' => $almacenes,
            'inventario' => $inventario,
            'selectedAlmacen' => $selectedAlmacen,
            'puedeVerTodos' => $puedeVerTodos,
        ]);
    }

    /**
     * Muestra el inventario de un almacén específico, verificando acceso.
     */
    public function porAlmacen(Almacen $almacen)
    {
        $user = Auth::user();
        $puedeVerTodos = $user && (
            $user->is_admin ??
            $user->hasRole('admin') ??
            $user->hasPermissionTo('r_todosLosAlmacenes')
        );

        if (!$puedeVerTodos) {
            $esResponsable = $user->almacenes()->where('almacen_id', $almacen->id)->exists();
            if (!$esResponsable) {
                abort(403, 'No tienes permiso para ver este almacén.');
            }
        }

        $inventario = $this->inventarioService->getInventarioPorAlmacen($almacen->id);

        return Inertia::render('canastillos/inventario/por-almacen', [
            'almacen' => $almacen,
            'inventario' => $inventario,
        ]);
    }
}
