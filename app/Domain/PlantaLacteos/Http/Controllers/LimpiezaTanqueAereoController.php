<?php
// app/Domain/PlantaLacteos/Http/Controllers/LimpiezaTanqueAereoController.php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Http\Requests\LimpiezaTanqueAereoRequest;
use App\Domain\PlantaLacteos\Models\LimpiezaTanqueAereo;
use App\Domain\PlantaLacteos\Services\LimpiezaTanqueAereoService;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LimpiezaTanqueAereoController extends Controller
{
    protected LimpiezaTanqueAereoService $service;

    public function __construct(LimpiezaTanqueAereoService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'tanque', 'user_id', 'fecha_desde', 'fecha_hasta', 'per_page']);

        $limpiezas = LimpiezaTanqueAereo::with('usuario')
            ->filter($filters)
            ->orderBy('tiempo', 'desc')
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        $usuarios = User::all();

        return Inertia::render('planta_lacteos/limpiezaOrdenDesinfeccion/tanquesAereos/index', [
            'limpiezas' => $limpiezas,
            'usuarios' => $usuarios,
            'filters' => $filters,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create()
{
    $usuarios = User::all();
    $currentUserId = auth()->id(); // Usuario logueado
    return Inertia::render('planta_lacteos/limpiezaOrdenDesinfeccion/tanquesAereos/crear', [
        'usuarios' => $usuarios,
        'currentUserId' => $currentUserId,
    ]);
}

    public function store(LimpiezaTanqueAereoRequest $request)
    {


        try {
            $this->service->store($request->validated());
            return redirect()->route('limpieza-tanques-aereos.index')
                ->with('success', 'Registro de limpieza creado correctamente.');
        } catch (\Exception $e) {
            dd($e); // Muestra la excepción completa
        }
    }

    public function edit(LimpiezaTanqueAereo $limpieza_tanques_aereo)
    {
        $limpieza_tanques_aereo->load('usuario');
        $usuarios = User::all();

        return Inertia::render('planta_lacteos/limpiezaOrdenDesinfeccion/tanquesAereos/editar', [
            'limpieza' => $limpieza_tanques_aereo,
            'usuarios' => $usuarios,
        ]);
    }

    public function update(LimpiezaTanqueAereoRequest $request, LimpiezaTanqueAereo $limpieza_tanques_aereo)
    {


        try {
            $this->service->update($limpieza_tanques_aereo, $request->validated());
            return redirect()->route('limpieza-tanques-aereos.index')
                ->with('success', 'Registro actualizado correctamente.');
        } catch (\Exception $e) {
            dd($e);
        }
    }

    public function destroy(LimpiezaTanqueAereo $limpieza_tanques_aereo)
    {
        try {
            $this->service->delete($limpieza_tanques_aereo);
            return redirect()->route('limpieza-tanques-aereos.index')
                ->with('success', 'Registro eliminado correctamente.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
