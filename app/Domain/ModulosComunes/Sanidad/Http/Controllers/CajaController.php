<?php

namespace App\Domain\ModulosComunes\Sanidad\Http\Controllers;

use App\Domain\ModulosComunes\Sanidad\Models\Caja;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CajaController extends Controller
{
    public function index()
    {
        // Asumiendo que tienes un campo 'estado'; si no, usa Caja::all()
        return Caja::where('estado', true)->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:san_cajas,nombre',
            'descripcion' => 'nullable|string',
        ]);

        $caja = Caja::create($validated);
        return response()->json($caja);
    }

    public function update(Request $request, Caja $caja)
    {
        $validated = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:255',
                Rule::unique('san_cajas')->ignore($caja->id),
            ],
            'descripcion' => 'nullable|string',
        ]);

        $caja->update($validated);
        return response()->json($caja);
    }

    public function destroy(Caja $caja)
    {
        // Verificar si tiene policlínicos asociados
        if ($caja->policlinicos()->exists()) {
            return response()->json([
                'error' => 'No se puede eliminar la caja porque tiene policlínicos asociados.'
            ], 422);
        }

        $caja->delete();
        return response()->json(['success' => true]);
    }
}