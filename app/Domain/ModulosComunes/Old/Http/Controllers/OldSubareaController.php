<?php

namespace App\Domain\ModulosComunes\Old\Http\Controllers;

use App\Domain\ModulosComunes\Old\Models\OldSubarea;
use App\Domain\ModulosComunes\Old\Models\OldArea;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class OldSubareaController extends Controller
{
    public function index(Request $request)
    {
        $query = OldSubarea::with('area')->latest();

        if ($request->filled('search')) {
            $query->where('nombre', 'like', "%{$request->search}%");
        }

        if ($request->filled('area_id')) {
            $query->where('old_area_id', $request->area_id);
        }

        return Inertia::render('comunes/old/subareas/index', [
            'subareas' => $query->paginate(10),
            'areas' => OldArea::select('id', 'nombre')->get(),
            'filtros' => $request->only('search', 'area_id')
        ]);
    }
    public function create()
    {
        return Inertia::render('comunes/old/subareas/create', [
            'areas' => OldArea::select('id', 'nombre')->get()
        ]);
    }

    public function edit(OldSubarea $oldSubarea)
    {
        return Inertia::render('comunes/old/subareas/edit', [
            'subarea' => $oldSubarea,
            'areas' => OldArea::select('id', 'nombre')->get()
        ]);
    }
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'nullable|string|max:255',
            'old_area_id' => 'nullable|exists:old_areas,id',
            'descripcion' => 'nullable|string'
        ]);

        OldSubarea::create($data);

        return redirect()->route('old-subareas.index')
            ->with('success', 'Subárea creada');
    }

    public function show(OldSubarea $oldSubarea)
    {
        return response()->json($oldSubarea->load('area'));
    }

    public function update(Request $request, OldSubarea $oldSubarea)
    {
        $data = $request->validate([
            'nombre' => 'nullable|string|max:255',
            'old_area_id' => 'nullable|exists:old_areas,id',
            'descripcion' => 'nullable|string'
        ]);

        $oldSubarea->update($data);

        return redirect()->route('old-subareas.index')
            ->with('success', 'Subárea actualizada');
    }

    public function destroy(OldSubarea $oldSubarea)
    {
        $oldSubarea->delete();

        return redirect()->route('old-subareas.index')
            ->with('success', 'Subárea eliminada');
    }
}
