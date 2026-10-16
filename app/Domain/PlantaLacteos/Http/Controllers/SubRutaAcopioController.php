<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\SubRutaAcopio;
use Illuminate\Http\Request;

class SubRutaAcopioController extends Controller
{
    public function index()
    {
        return SubRutaAcopio::with('ruta')->where('estado', true)->get(); // JSON puro para Axios
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'PLL_ruta_acopios_id' => 'required|exists:PLL_ruta_acopios,id',
            'nombre' => 'required|string|max:255',
            'alias' => 'nullable|string|max:100',
            'detalle' => 'nullable|string',
            'grupo' => 'nullable|string|max:100',
            'estado' => 'boolean',
        ]);

        $subruta = SubRutaAcopio::create($validated);
        return response()->json($subruta);
    }

    public function update(Request $request, SubRutaAcopio $subrutas_acopio)
    {
        $validated = $request->validate([
            'PLL_ruta_acopios_id' => 'required|exists:PLL_ruta_acopios,id',
            'nombre' => 'required|string|max:255',
            'alias' => 'nullable|string|max:100',
            'detalle' => 'nullable|string',
            'grupo' => 'nullable|string|max:100',
            'estado' => 'boolean',
        ]);

        $subrutas_acopio->update($validated);
        return response()->json($subrutas_acopio);
    }

    public function destroy(SubRutaAcopio $subrutas_acopio)
    {
        // Verificar si tiene recepciones asociadas
        if ($subrutas_acopio->recepciones()->exists()) {
            return response()->json([
                'error' => 'No se puede eliminar la subruta porque tiene recepciones asociadas.'
            ], 422);
        }

        $subrutas_acopio->delete();
        return response()->json(['success' => true]);
    }
}