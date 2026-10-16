<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\LugarControlTemperatura;
use App\Domain\PlantaLacteos\Services\LugarControlTemperaturaService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LugarControlTemperaturaController extends Controller
{
    protected LugarControlTemperaturaService $lugarService;

    public function __construct(LugarControlTemperaturaService $lugarService)
    {
        $this->lugarService = $lugarService;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['nombre', 'tipo', 'estado', 'per_page']);

        $lugares = LugarControlTemperatura::filter($filters)
            ->orderBy($request->get('sort', 'created_at'), $request->get('direction', 'desc'))
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        return Inertia::render('planta_lacteos/controlTemperatura/index', [
            'lugares' => $lugares,
            'filters' => $filters,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'tipo' => 'nullable|string|max:255',
                'alias' => 'nullable|string|max:255',
                'estado' => 'boolean'
            ]);

            $this->lugarService->create($validated);

            return redirect()->route('lugares-control-temperatura.index')
                ->with('success', 'Lugar de control de temperatura creado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al crear el lugar: ' . $e->getMessage());
        }
    }

    public function update(Request $request, LugarControlTemperatura $lugares_control_temperatura)
    {
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'tipo' => 'nullable|string|max:255',
                'alias' => 'nullable|string|max:255',
                'estado' => 'boolean'
            ]);

            $this->lugarService->update($lugares_control_temperatura, $validated);

            return redirect()->route('lugares-control-temperatura.index')
                ->with('success', 'Lugar actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al actualizar el lugar: ' . $e->getMessage());
        }
    }

    public function destroy(LugarControlTemperatura $lugares_control_temperatura)
    {
        try {
            $this->lugarService->delete($lugares_control_temperatura);

            return redirect()->route('lugares-control-temperatura.index')
                ->with('success', 'Lugar eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al eliminar el lugar: ' . $e->getMessage());
        }
    }

    public function toggleEstado(LugarControlTemperatura $lugares_control_temperatura)
    {
        try {
            $this->lugarService->toggleEstado($lugares_control_temperatura);

            return redirect()->back()
                ->with('success', 'Estado actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al cambiar el estado: ' . $e->getMessage());
        }
    }
}