<?php

namespace App\Domain\ModulosComunes\Canastillos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\ModulosComunes\Canastillos\Models\Canastillo;
use App\Domain\ModulosComunes\Canastillos\Services\CanastilloService;
use App\Domain\ModulosComunes\Canastillos\Http\Requests\CanastilloRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CanastilloController extends Controller
{
    protected CanastilloService $canastilloService;

    public function __construct(CanastilloService $canastilloService)
    {
        $this->canastilloService = $canastilloService;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'tamaño']);

        $canastillos = Canastillo::filter($filters)
            ->orderBy($request->get('sort', 'nombre'), $request->get('direction', 'asc'))
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        return Inertia::render('canastillos/canastillos/index', [
            'canastillos' => $canastillos,
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        return Inertia::render('canastillos/canastillos/crear');
    }

    public function store(CanastilloRequest $request)
    {
        try {
            $this->canastilloService->store($request->validated());
            return redirect()->route('canastillos.canastillos.index')
                ->with('success', 'Canastillo creado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al crear el canastillo: ' . $e->getMessage());
        }
    }

    public function show(Canastillo $canastillo)
    {
        return Inertia::render('canastillos/canastillos/show', [
            'canastillo' => $canastillo,
        ]);
    }

    public function edit(Canastillo $canastillo)
    {
        return Inertia::render('canastillos/canastillos/editar', [
            'canastillo' => $canastillo,
        ]);
    }

    public function update(CanastilloRequest $request, Canastillo $canastillo)
    {
        try {
            $this->canastilloService->update($canastillo, $request->validated());
            return redirect()->route('canastillos.canastillos.index')
                ->with('success', 'Canastillo actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al actualizar el canastillo: ' . $e->getMessage());
        }
    }

    public function destroy(Canastillo $canastillo)
    {
        try {
            $this->canastilloService->delete($canastillo);
            return redirect()->route('canastillos.canastillos.index')
                ->with('success', 'Canastillo eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al eliminar el canastillo: ' . $e->getMessage());
        }
    }

    public function paraSelect()
    {
        return response()->json(
            Canastillo::select('id', 'nombre', 'tamaño', 'color')->orderBy('nombre')->get()
        );
    }
}
