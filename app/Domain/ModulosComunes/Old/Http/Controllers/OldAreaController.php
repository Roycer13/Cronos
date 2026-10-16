<?php

namespace App\Domain\ModulosComunes\Old\Http\Controllers;

use App\Domain\ModulosComunes\Old\Models\OldArea;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class OldAreaController extends Controller
{
    public function index(Request $request)
    {
        $query = OldArea::with('ubicacion')->latest();

        if ($request->filled('search')) {
            $query->where('nombre', 'like', "%{$request->search}%");
        }

        return Inertia::render('comunes/old/areas/index', [
            'areas' => $query->paginate(10),
            'ubicaciones' => Ubicacion::select('id', 'nombre')->get(),
            'filtros' => $request->only('search')
        ]);
    }

    /**
     * 🆕 FORM CREATE
     */
    public function create()
    {
        return Inertia::render('comunes/old/areas/create', [
            'ubicaciones' => Ubicacion::select('id', 'nombre')->get()
        ]);
    }

    /**
     * 🆕 FORM EDIT
     */
    public function edit(OldArea $oldArea)
    {
        return Inertia::render('comunes/old/areas/edit', [
            'area' => $oldArea,
            'ubicaciones' => Ubicacion::select('id', 'nombre')->get()
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'nullable|string|max:255',
            'ubicacion_id' => 'nullable|exists:ubicaciones,id',
            'descripcion' => 'nullable|string'
        ]);

        OldArea::create($data);

        return redirect()->route('old-areas.index')
            ->with('success', 'Área creada');
    }

    public function show(OldArea $oldArea)
    {
        return response()->json($oldArea->load('ubicacion'));
    }

    public function update(Request $request, OldArea $oldArea)
    {
        $data = $request->validate([
            'nombre' => 'nullable|string|max:255',
            'ubicacion_id' => 'nullable|exists:ubicaciones,id',
            'descripcion' => 'nullable|string'
        ]);

        $oldArea->update($data);

        return redirect()->route('old-areas.index')
            ->with('success', 'Área actualizada');
    }

    public function destroy(OldArea $oldArea)
    {
        $oldArea->delete();

        return redirect()->route('old-areas.index')
            ->with('success', 'Área eliminada');
    }
}
