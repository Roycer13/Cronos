<?php

namespace App\Domain\ModulosComunes\Sanidad\Http\Controllers;

use App\Domain\ModulosComunes\Sanidad\Models\Policlinico;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PoliclinicoController extends Controller
{
    public function index()
    {
        // Opcional: puedes cargar la relación con la caja
        return Policlinico::with('caja')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150|unique:san_policlinicos,nombre',
            'direccion' => 'nullable|string|max:255',
            'caja_id' => 'required|exists:san_cajas,id',
        ]);

        $policlinico = Policlinico::create($validated);
        return response()->json($policlinico);
    }

    public function update(Request $request, Policlinico $policlinico)
    {
        $validated = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:150',
                Rule::unique('san_policlinicos')->ignore($policlinico->id),
            ],
            'direccion' => 'nullable|string|max:255',
            'caja_id' => 'required|exists:san_cajas,id',
        ]);

        $policlinico->update($validated);
        return response()->json($policlinico);
    }

    public function destroy(Policlinico $policlinico)
    {
        // Verificar dependencias: atenciones médicas, reconsultas, exámenes ocupacionales o empleados
        if ($policlinico->atencionesMedicas()->exists() ||
            $policlinico->reconsultas()->exists() ||
            $policlinico->examenesOcupacionales()->exists() ||
            $policlinico->empleadosReferencia()->exists()) {
            return response()->json([
                'error' => 'No se puede eliminar el policlínico porque tiene registros asociados (atenciones, reconsultas, exámenes o empleados).'
            ], 422);
        }

        $policlinico->delete();
        return response()->json(['success' => true]);
    }
}