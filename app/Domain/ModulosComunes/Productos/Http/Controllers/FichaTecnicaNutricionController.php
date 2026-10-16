<?php

namespace App\Domain\ModulosComunes\Productos\Http\Controllers;

use App\Domain\ModulosComunes\Productos\Http\Requests\FichaTecnicaNutricionRequest;
use App\Domain\ModulosComunes\Productos\Services\FichaTecnicaNutricionService;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class FichaTecnicaNutricionController extends Controller
{
    protected $fichaTecnicaNutricionService;

    public function __construct(FichaTecnicaNutricionService $fichaTecnicaNutricionService)
    {
        $this->fichaTecnicaNutricionService = $fichaTecnicaNutricionService;
    }

    public function store(FichaTecnicaNutricionRequest $request)
    {
        $fichaTecnicaNutricion = $this->fichaTecnicaNutricionService->crear($request->validated());

        return redirect()->route('fichas-tecnicas.show', $fichaTecnicaNutricion->ficha_tecnica_id)
            ->with('success', 'Información nutricional creada correctamente.');
    }

    public function show($id)
    {
        $fichaTecnicaNutricion = $this->fichaTecnicaNutricionService->encontrar($id);

        if (!$fichaTecnicaNutricion) {
            abort(404);
        }

        return Inertia::render('Productos/FichaTecnicaNutricion/Show', [
            'fichaTecnicaNutricion' => $fichaTecnicaNutricion
        ]);
    }

    public function edit($id)
    {
        $fichaTecnicaNutricion = $this->fichaTecnicaNutricionService->encontrar($id);

        if (!$fichaTecnicaNutricion) {
            abort(404);
        }

        return Inertia::render('Productos/FichaTecnicaNutricion/Edit', [
            'fichaTecnicaNutricion' => $fichaTecnicaNutricion
        ]);
    }

    public function update(FichaTecnicaNutricionRequest $request, $id)
    {
        $fichaTecnicaNutricion = $this->fichaTecnicaNutricionService->encontrar($id);

        if (!$fichaTecnicaNutricion) {
            abort(404);
        }

        $this->fichaTecnicaNutricionService->actualizar($fichaTecnicaNutricion, $request->validated());

        return redirect()->route('fichas-tecnicas.show', $fichaTecnicaNutricion->ficha_tecnica_id)
            ->with('success', 'Información nutricional actualizada correctamente.');
    }

    public function destroy($id)
    {
        $fichaTecnicaNutricion = $this->fichaTecnicaNutricionService->encontrar($id);

        if (!$fichaTecnicaNutricion) {
            abort(404);
        }

        $fichaTecnicaId = $fichaTecnicaNutricion->ficha_tecnica_id;
        $this->fichaTecnicaNutricionService->eliminar($fichaTecnicaNutricion);

        return redirect()->route('fichas-tecnicas.show', $fichaTecnicaId)
            ->with('success', 'Información nutricional eliminada correctamente.');
    }
}