<?php

namespace App\Domain\ModulosComunes\Productos\Http\Controllers;

use App\Domain\ModulosComunes\Productos\Models\CategoriaProducto;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CategoriaProductoController extends Controller
{
    public function index()
    {
        return CategoriaProducto::with(['estado', 'ubicacion'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:50',
            'codigo' => 'required|string|max:10|unique:categoria_productos',
            'descripcion' => 'nullable|string|max:255',
            'estado_id' => 'required|exists:estados,id',
            'ubicacion_id' => 'required|exists:ubicaciones,id'
        ]);

        $categoria = CategoriaProducto::create($validated);
        return response()->json($categoria, 201);
    }

    public function update(Request $request, CategoriaProducto $categoriaProducto)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:50',
            'codigo' => 'required|string|max:10|unique:categoria_productos,codigo,' . $categoriaProducto->id,
            'descripcion' => 'nullable|string|max:255',
            'estado_id' => 'required|exists:estados,id',
            'ubicacion_id' => 'required|exists:ubicaciones,id'
        ]);

        $categoriaProducto->update($validated);
        return response()->json($categoriaProducto);
    }

    public function destroy(CategoriaProducto $categoriaProducto)
    {
        if ($categoriaProducto->subcategorias()->exists()) {
            return response()->json([
                'error' => 'No se puede eliminar la categoría porque tiene subcategorías asociadas.'
            ], 422);
        }

        if ($categoriaProducto->productos()->exists()) {
            return response()->json([
                'error' => 'No se puede eliminar la categoría porque tiene productos asociados.'
            ], 422);
        }

        $categoriaProducto->delete();
        return response()->json(['message' => 'Categoría eliminada correctamente']);
    }
}