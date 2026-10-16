<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\Origen;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrigenController extends Controller
{
    public function index()
    {
        return Origen::with(['maquina', 'sector'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'alias' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'maquina_id' => 'nullable|exists:maquinaria,id',
            'sector_id' => 'nullable|exists:sectores,id',
        ]);

        $origen = Origen::create($validated);
        return response()->json($origen);
    }

    public function update(Request $request, Origen $origen)
    {
        $validated = $request->validate([
            'alias' => [
                'required',
                'string',
                'max:255',
                Rule::unique('origenes')->ignore($origen->id),
            ],
            'descripcion' => 'nullable|string',
            'maquina_id' => 'nullable|exists:maquinaria,id',
            'sector_id' => 'nullable|exists:sectores,id',
        ]);

        $origen->update($validated);
        return response()->json($origen);
    }

    public function destroy(Origen $origen)
    {
        // Verificar si tiene estado_plantas o estado_detalles asociados
        if ($origen->estadoPlantas()->exists() || $origen->estadoDetalles()->exists()) {
            return response()->json([
                'error' => 'No se puede eliminar el origen porque tiene registros asociados.'
            ], 422);
        }

        $origen->delete();
        return response()->json(['success' => true]);
    }
}