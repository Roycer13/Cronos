<?php

namespace App\Domain\ModulosComunes\Canastillos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\ModulosComunes\Canastillos\Models\Vendedor;
use App\Domain\ModulosComunes\Canastillos\Services\VendedorService;
use App\Domain\ModulosComunes\Canastillos\Http\Requests\VendedorRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendedorController extends Controller
{
    protected VendedorService $vendedorService;

    public function __construct(VendedorService $vendedorService)
    {
        $this->vendedorService = $vendedorService;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search']);

        $vendedores = Vendedor::filter($filters)
            ->orderBy($request->get('sort', 'nombre'), $request->get('direction', 'asc'))
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        return Inertia::render('canastillos/vendedores/index', [
            'vendedores' => $vendedores,
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        return Inertia::render('canastillos/vendedores/crear');
    }

    public function store(VendedorRequest $request)
    {
        try {
            $this->vendedorService->store($request->validated());
            return redirect()->route('canastillos.vendedores.index')
                ->with('success', 'Vendedor creado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al crear el vendedor: ' . $e->getMessage());
        }
    }

    public function show(Vendedor $vendedor)
    {
        return Inertia::render('canastillos/vendedores/show', [
            'vendedor' => $vendedor,
        ]);
    }

    public function edit(Vendedor $vendedor)
    {
        return Inertia::render('canastillos/vendedores/editar', [
            'vendedor' => $vendedor,
        ]);
    }

    public function update(VendedorRequest $request, Vendedor $vendedor)
    {
        try {
            $this->vendedorService->update($vendedor, $request->validated());
            return redirect()->route('canastillos.vendedores.index')
                ->with('success', 'Vendedor actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al actualizar el vendedor: ' . $e->getMessage());
        }
    }

    public function destroy(Vendedor $vendedor)
    {
        try {
            $this->vendedorService->delete($vendedor);
            return redirect()->route('canastillos.vendedores.index')
                ->with('success', 'Vendedor eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al eliminar el vendedor: ' . $e->getMessage());
        }
    }

    // Para selects
    public function paraSelect()
    {
        return response()->json(
            Vendedor::select('id', 'nombre', 'apellido')->orderBy('nombre')->get()
        );
    }
}
