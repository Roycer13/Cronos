<?php

namespace App\Domain\ModulosComunes\Canastillos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\ModulosComunes\Canastillos\Models\Almacen;
use App\Domain\ModulosComunes\Canastillos\Models\TipoAlmacen;
use App\Domain\ModulosComunes\Canastillos\Services\AlmacenService;
use App\Domain\ModulosComunes\Canastillos\Http\Requests\AlmacenRequest;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AlmacenController extends Controller
{
    protected AlmacenService $almacenService;

    public function __construct(AlmacenService $almacenService)
    {
        $this->almacenService = $almacenService;
    }

    public function index(Request $request)
{
    $filters = $request->only(['tipo_almacen_id', 'responsable_id', 'search']);

    $almacenes = Almacen::with(['responsables', 'tipoAlmacen'])
        ->filter($filters)
        ->orderBy($request->get('sort', 'nombre'), $request->get('direction', 'asc'))
        ->paginate($request->get('per_page', 10))
        ->withQueryString();

    $tiposAlmacen = TipoAlmacen::all();
    $responsables = User::all();

    return Inertia::render('canastillos/almacenes/index', [
        'almacenes' => $almacenes,
        'tiposAlmacen' => $tiposAlmacen,
        'responsables' => $responsables,
        'filters' => $filters,
    ]);
}

    public function create()
    {
        $tiposAlmacen = TipoAlmacen::all();
        $responsables = User::all();
        return Inertia::render('canastillos/almacenes/crear', [
            'tipos_almacen' => $tiposAlmacen,
            'responsables' => $responsables,
        ]);
    }

  public function store(AlmacenRequest $request)
{
    try {
        $this->almacenService->store($request->validated());
        return redirect()->route('canastillos.almacenes.index')
            ->with('success', 'Almacén creado exitosamente.');
    } catch (\Exception $e) {
        return redirect()->back()->with('error', 'Error al crear el almacén: ' . $e->getMessage());
    }
}

    public function show(Almacen $almacen)
    {
        $almacen->load(['responsable', 'tipoAlmacen']);
        return Inertia::render('canastillos/almacenes/show', [
            'almacen' => $almacen,
        ]);
    }

    public function edit(Almacen $almacen)
{
    $almacen->load('responsables'); // ← importante
    $tiposAlmacen = TipoAlmacen::all();
    $responsables = User::all();
    return Inertia::render('canastillos/almacenes/editar', [
        'almacen' => $almacen,
        'tipos_almacen' => $tiposAlmacen,
        'responsables' => $responsables,
    ]);
}
    public function update(AlmacenRequest $request, Almacen $almacen)
{
    try {
        $this->almacenService->update($almacen, $request->validated());
        return redirect()->route('canastillos.almacenes.index')
            ->with('success', 'Almacén actualizado exitosamente.');
    } catch (\Exception $e) {
        return redirect()->back()->with('error', 'Error al actualizar el almacén: ' . $e->getMessage());
    }
}

    public function destroy(Almacen $almacen)
    {
        try {
            $this->almacenService->delete($almacen);
            return redirect()->route('canastillos.almacenes.index')
                ->with('success', 'Almacén eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al eliminar el almacén: ' . $e->getMessage());
        }
    }

    // Para selects
    public function paraSelect()
    {
        return response()->json(
            Almacen::select('id', 'nombre')->orderBy('nombre')->get()
        );
    }
}
