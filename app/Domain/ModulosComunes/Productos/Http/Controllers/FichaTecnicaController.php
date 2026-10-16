<?php

namespace App\Domain\ModulosComunes\Productos\Http\Controllers;

use App\Domain\ModulosComunes\Productos\Http\Requests\FichaTecnicaRequest;
use App\Domain\ModulosComunes\Productos\Services\FichaTecnicaService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FichaTecnicaController extends Controller
{
    protected $fichaTecnicaService;

    public function __construct(FichaTecnicaService $fichaTecnicaService)
    {
        $this->fichaTecnicaService = $fichaTecnicaService;
    }

    public function index(Request $request)
    {
        $filtros = $request->only([
            'search', 'aprobado', 'producto_terminado_id', 'refrigerado', 'congelado', 'version'
        ]);

        $fichasTecnicas = $this->fichaTecnicaService->listar($filtros, 10);

        return Inertia::render('Productos/FichaTecnica/Index', [
            'fichasTecnicas' => $fichasTecnicas,
            'filtros' => $filtros
        ]);
    }

    public function create()
    {
        $datosFormulario = $this->fichaTecnicaService->obtenerParaFormulario();

        return Inertia::render('Productos/FichaTecnica/Create', $datosFormulario);
    }

    public function store(FichaTecnicaRequest $request)
    {
        $fichaTecnica = $this->fichaTecnicaService->crear($request->validated());

        return redirect()->route('fichas-tecnicas.index')
            ->with('success', 'Ficha técnica creada correctamente.');
    }

    public function show($id)
    {
        $fichaTecnica = $this->fichaTecnicaService->encontrar($id);

        if (!$fichaTecnica) {
            abort(404);
        }

        return Inertia::render('Productos/FichaTecnica/Show', [
            'fichaTecnica' => $fichaTecnica
        ]);
    }

    public function edit($id)
    {
        $fichaTecnica = $this->fichaTecnicaService->encontrar($id);

        if (!$fichaTecnica) {
            abort(404);
        }

        $datosFormulario = $this->fichaTecnicaService->obtenerParaFormulario();

        return Inertia::render('Productos/FichaTecnica/Edit', array_merge($datosFormulario, [
            'fichaTecnica' => $fichaTecnica
        ]));
    }

    public function update(FichaTecnicaRequest $request, $id)
    {
        $fichaTecnica = $this->fichaTecnicaService->encontrar($id);

        if (!$fichaTecnica) {
            abort(404);
        }

        $this->fichaTecnicaService->actualizar($fichaTecnica, $request->validated());

        return redirect()->route('fichas-tecnicas.index')
            ->with('success', 'Ficha técnica actualizada correctamente.');
    }

    public function destroy($id)
    {
        $fichaTecnica = $this->fichaTecnicaService->encontrar($id);

        if (!$fichaTecnica) {
            abort(404);
        }

        $this->fichaTecnicaService->eliminar($fichaTecnica);

        return redirect()->route('fichas-tecnicas.index')
            ->with('success', 'Ficha técnica eliminada correctamente.');
    }

    public function aprobar(Request $request, $id)
    {
        $fichaTecnica = $this->fichaTecnicaService->encontrar($id);

        if (!$fichaTecnica) {
            abort(404);
        }

        $this->fichaTecnicaService->aprobar($fichaTecnica, auth()->id());

        return redirect()->back()->with('success', 'Ficha técnica aprobada correctamente.');
    }
}