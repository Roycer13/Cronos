<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\DispositivoMedicion;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DispositivoMedicionController extends Controller
{
    /**
     * Mostrar la página de administración de dispositivos
     */
    public function admin(): Response
    {
        $dispositivos = DispositivoMedicion::orderBy('dispositivo')
            ->orderBy('codigo')
            ->paginate(15);

        return Inertia::render('planta_lacteos/dispositivos_medicion/admin', [
            'dispositivos' => $dispositivos,
        ]);
    }

    /**
     * Obtener todos los dispositivos (para CRUD de configuración)
     */
    public function index()
    {
        return DispositivoMedicion::all();
    }

    /**
     * Almacenar un nuevo dispositivo
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo' => 'nullable|string|max:255|unique:PLL_dispositivos_mediciones,codigo',
            'dispositivo' => 'required|string|max:255',
            'marca' => 'nullable|string|max:255',
            'modelo' => 'nullable|string|max:255',
            'capacidadMedicion' => 'nullable|string|max:255',
            'rangoUso' => 'nullable|string|max:255',
            'areaUso' => 'nullable|string|max:255',
            'responsable' => 'nullable|string|max:255',
            'baja' => 'nullable|boolean',
            'observaciones' => 'nullable|string',
        ]);

        $dispositivo = DispositivoMedicion::create($validated);
        return response()->json($dispositivo, 201);
    }

    /**
     * Actualizar un dispositivo existente
     */
    public function update(Request $request, DispositivoMedicion $dispositivo_medicion)
    {
        $validated = $request->validate([
            'codigo' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('PLL_dispositivos_mediciones')->ignore($dispositivo_medicion->id),
            ],
            'dispositivo' => 'required|string|max:255',
            'marca' => 'nullable|string|max:255',
            'modelo' => 'nullable|string|max:255',
            'capacidadMedicion' => 'nullable|string|max:255',
            'rangoUso' => 'nullable|string|max:255',
            'areaUso' => 'nullable|string|max:255',
            'responsable' => 'nullable|string|max:255',
            'baja' => 'nullable|boolean',
            'observaciones' => 'nullable|string',
        ]);

        $dispositivo_medicion->update($validated);
        return response()->json($dispositivo_medicion);
    }

    /**
     * Eliminar un dispositivo
     */
    public function destroy(DispositivoMedicion $dispositivo_medicion)
    {
        $dispositivo_medicion->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Obtener datos para reporte en PDF
     */
    public function reporteData()
    {
        $dispositivos = DispositivoMedicion::orderBy('dispositivo')
            ->orderBy('codigo')
            ->get();

        return response()->json([
            'dispositivos' => $dispositivos,
        ]);
    }
}