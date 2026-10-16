<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\RutaAcopio;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RutaAcopioController extends Controller
{
    public function index()
    {
        return RutaAcopio::where('estado', true)->get(); // JSON puro para Axios
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:PLL_ruta_acopios,nombre',
            'detalle' => 'nullable|string',
            'alias' => 'nullable|string|max:100',
            'estado' => 'boolean',
        ]);

        $ruta = RutaAcopio::create($validated);
        return response()->json($ruta);
    }

    public function update(Request $request, RutaAcopio $rutas_acopio)
    {
        $validated = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:255',
                Rule::unique('PLL_ruta_acopios')->ignore($rutas_acopio->id),
            ],
            'detalle' => 'nullable|string',
            'alias' => 'nullable|string|max:100',
            'estado' => 'boolean',
        ]);

        $rutas_acopio->update($validated);
        return response()->json($rutas_acopio);
    }

    public function destroy(RutaAcopio $rutas_acopio)
    {
        // Verificar si tiene subrutas asociadas
        if ($rutas_acopio->subrutas()->exists()) {
            return response()->json([
                'error' => 'No se puede eliminar la ruta porque tiene subrutas asociadas.'
            ], 422);
        }

        $rutas_acopio->delete();
        return response()->json(['success' => true]);
    }
}