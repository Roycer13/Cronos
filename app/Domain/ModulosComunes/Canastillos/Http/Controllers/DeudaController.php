<?php

namespace App\Domain\ModulosComunes\Canastillos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\ModulosComunes\Canastillos\Models\Vendedor;
use App\Domain\ModulosComunes\Canastillos\Models\Almacen;
use App\Domain\ModulosComunes\Canastillos\Services\DeudaService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class DeudaController extends Controller
{
    protected DeudaService $deudaService;

    public function __construct(DeudaService $deudaService)
    {
        $this->deudaService = $deudaService;
    }

    /**
     * Verifica si el usuario es administrador.
     * Ajusta según tu lógica real (campo is_admin, rol 'admin', etc.)
     */
    private function esAdmin($user): bool
{
    return $user && $user->hasRole('admin');
}

    /**
     * Listado de deudas por almacén (nunca global).
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

        // Si no hay almacenes accesibles
        if (!$selectedAlmacen) {
            return Inertia::render('canastillos/deudas/index', [
                'almacenes' => $almacenes,
                'deudas' => [],
                'selectedAlmacen' => null,
                'puedeVerTodos' => $puedeVerTodos,
                'vendedores' => Vendedor::select('id', 'nombre', 'apellido')->get(),
            ]);
        }

        // Obtener deudas del almacén seleccionado
        $deudas = $this->deudaService->getDeudasPorAlmacen($selectedAlmacen->id);

        return Inertia::render('canastillos/deudas/index', [
            'almacenes' => $almacenes,
            'deudas' => $deudas,
            'selectedAlmacen' => $selectedAlmacen,
            'puedeVerTodos' => $puedeVerTodos,
            'vendedores' => Vendedor::select('id', 'nombre', 'apellido')->get(),
        ]);
    }

    /**
     * Deudas de un vendedor específico.
     */
    public function porVendedor(Vendedor $vendedor, Request $request)
    {
        $user = Auth::user();
        $isAdmin = $this->esAdmin($user);
        $almacenId = $request->get('almacen_id');

        // Verificar acceso al almacén (si se especifica)
        if ($almacenId && !$isAdmin) {
            $tieneAcceso = $user && method_exists($user, 'almacenes') && $user->almacenes()->where('almacen_id', $almacenId)->exists();
            if (!$tieneAcceso) {
                throw new AccessDeniedHttpException('No tienes permiso para ver deudas de ese almacén.');
            }
        } elseif (!$isAdmin && !$almacenId && $user && method_exists($user, 'almacenes')) {
            // Si no es admin y no especifica almacén, tomar el primero al que tenga acceso
            $primerAlmacen = $user->almacenes()->first();
            $almacenId = $primerAlmacen ? $primerAlmacen->id : null;
        }

        $deuda = $this->deudaService->getDeudasPorVendedor($vendedor->id, $almacenId ?: null);

        return Inertia::render('canastillos/deudas/por-vendedor', [
            'vendedor' => $vendedor,
            'deuda' => $deuda,
            'almacen_id' => $almacenId,
        ]);
    }

    /**
     * Deudas de un almacén específico.
     */
    public function porAlmacen(Almacen $almacen)
    {
        $user = Auth::user();
        $isAdmin = $this->esAdmin($user);

        if (!$isAdmin) {
            $tieneAcceso = $user && method_exists($user, 'almacenes') && $user->almacenes()->where('almacen_id', $almacen->id)->exists();
            if (!$tieneAcceso) {
                throw new AccessDeniedHttpException('No tienes permiso para ver las deudas de este almacén.');
            }
        }

        $deudas = $this->deudaService->getDeudasPorAlmacen($almacen->id);

        return Inertia::render('canastillos/deudas/por-almacen', [
            'almacen' => $almacen,
            'deudas' => $deudas,
        ]);
    }
}
