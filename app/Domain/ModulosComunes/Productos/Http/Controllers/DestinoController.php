<?php

namespace App\Domain\ModulosComunes\Productos\Http\Controllers;

use App\Domain\ModulosComunes\Productos\Models\Destino;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DestinoController extends Controller
{
    public function index()
    {
        return Destino::with(['estado', 'ubicacion'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:50',
            'codigo' => 'required|string|max:10|unique:destinos',
            'descripcion' => 'nullable|string|max:255',
            'estado_id' => 'required|exists:estados,id',
            'ubicacion_id' => 'required|exists:ubicaciones,id'
        ]);

        $destino = Destino::create($validated);
        return response()->json($destino, 201);
    }

    public function update(Request $request, Destino $destino)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:50',
            'codigo' => 'required|string|max:10|unique:destinos,codigo,' . $destino->id,
            'descripcion' => 'nullable|string|max:255',
            'estado_id' => 'required|exists:estados,id',
            'ubicacion_id' => 'required|exists:ubicaciones,id'
        ]);

        $destino->update($validated);
        return response()->json($destino);
    }

    public function destroy(Destino $destino)
    {
        if ($destino->productos()->exists()) {
            return response()->json([
                'error' => 'No se puede eliminar el destino porque tiene productos asociados.'
            ], 422);
        }

        $destino->delete();
        return response()->json(['message' => 'Destino eliminado correctamente']);
    }
}