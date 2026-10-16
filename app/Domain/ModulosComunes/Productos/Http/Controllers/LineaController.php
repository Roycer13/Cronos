<?php

namespace App\Domain\ModulosComunes\Productos\Http\Controllers;

use App\Domain\ModulosComunes\Productos\Models\Linea;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LineaController extends Controller
{
    public function index()
    {
        return Linea::with(['estado', 'ubicacion'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:50',
            'codigo' => 'required|string|max:10|unique:lineas',
            'descripcion' => 'nullable|string|max:255',
            'ubicacion_id' => 'required|exists:ubicaciones,id',
            'estado_id' => 'required|exists:estados,id'
        ]);

        $linea = Linea::create($validated);
        return response()->json($linea, 201);
    }

    public function update(Request $request, Linea $linea)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:50',
            'codigo' => 'required|string|max:10|unique:lineas,codigo,' . $linea->id,
            'descripcion' => 'nullable|string|max:255',
            'ubicacion_id' => 'required|exists:ubicaciones,id',
            'estado_id' => 'required|exists:estados,id'
        ]);

        $linea->update($validated);
        return response()->json($linea);
    }

    public function destroy(Linea $linea)
    {
        if ($linea->productos()->exists()) {
            return response()->json([
                'error' => 'No se puede eliminar la línea porque tiene productos asociados.'
            ], 422);
        }

        $linea->delete();
        return response()->json(['message' => 'Línea eliminada correctamente']);
    }
}