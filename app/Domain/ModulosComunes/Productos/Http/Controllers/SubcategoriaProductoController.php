<?php

namespace App\Domain\ModulosComunes\Productos\Http\Controllers;

use App\Domain\ModulosComunes\Productos\Models\SubcategoriaProducto;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SubcategoriaProductoController extends Controller
{
    public function index()
    {
        return SubcategoriaProducto::with(['categoria', 'categoria.ubicacion'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:50',
            'codigo' => 'required|string|max:10|unique:subcategoria_productos',
            'descripcion' => 'nullable|string|max:255',
            'categoria_id' => 'required|exists:categoria_productos,id'
        ]);

        $subcategoria = SubcategoriaProducto::create($validated);
        return response()->json($subcategoria, 201);
    }

    public function update(Request $request, SubcategoriaProducto $subcategoriaProducto)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:50',
            'codigo' => 'required|string|max:10|unique:subcategoria_productos,codigo,' . $subcategoriaProducto->id,
            'descripcion' => 'nullable|string|max:255',
            'categoria_id' => 'required|exists:categoria_productos,id'
        ]);

        $subcategoriaProducto->update($validated);
        return response()->json($subcategoriaProducto);
    }

    public function destroy(SubcategoriaProducto $subcategoriaProducto)
    {
        if ($subcategoriaProducto->productos()->exists()) {
            return response()->json([
                'error' => 'No se puede eliminar la subcategoría porque tiene productos asociados.'
            ], 422);
        }

        $subcategoriaProducto->delete();
        return response()->json(['message' => 'Subcategoría eliminada correctamente']);
    }
}