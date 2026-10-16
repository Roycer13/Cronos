<?php

namespace App\Domain\ModulosComunes\Sanidad\Http\Controllers;

use App\Domain\ModulosComunes\Sanidad\Http\Requests\AtencionMedicaRequest;
use App\Domain\ModulosComunes\Sanidad\Models\Policlinico;
use App\Domain\ModulosComunes\Sanidad\Services\AtencionMedicaService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AtencionMedicaController extends Controller
{
    protected AtencionMedicaService $atencionMedicaService;

    public function __construct(AtencionMedicaService $atencionMedicaService)
    {
        $this->atencionMedicaService = $atencionMedicaService;
    }

    public function index(Request $request)
    {
        $filtros = $request->only([
            'medico',
            'paciente',
            'fecha_desde',
            'fecha_hasta',
            'estado_id',
            'transferencia',
            'policlinico_id',
            'gravedad'
        ]);
        $atenciones = $this->atencionMedicaService->listar($filtros, 10);

        return Inertia::render('sanidad/atencionesMedicas/index', [
            'atenciones' => $atenciones,
            'filtros' => $filtros
        ]);
    }

    public function create()
    {
        $datosFormulario = $this->atencionMedicaService->obtenerParaFormulario();

        return Inertia::render('sanidad/atencionesMedicas/create', $datosFormulario);
    }

    public function store(AtencionMedicaRequest $request)
    {
        $data = $request->validated();
        $data['medico'] = auth()->id(); // Agregar el médico autenticado

        $this->atencionMedicaService->crear($data);

        return redirect()->route('atenciones-medicas.index')
            ->with('success', 'Atención médica registrada correctamente.');
    }

    public function show($id)
    {
        $atencion = $this->atencionMedicaService->encontrar($id);

        if (!$atencion) {
            abort(404);
        }

        // Obtener lista de policlínicos (de donde corresponda, ejemplo: Policlinico::all())
        $policlinicos = Policlinico::select('id', 'nombre')->get();

        return Inertia::render('sanidad/atencionesMedicas/show', [
            'atencion' => $atencion,
            'policlinicos' => $policlinicos,
        ]);
    }

    public function edit($id)
    {
        $atencion = $this->atencionMedicaService->encontrar($id);

        if (!$atencion) {
            abort(404);
        }

        $datosFormulario = $this->atencionMedicaService->obtenerParaFormulario();

        return Inertia::render('sanidad/atencionesMedicas/edit', array_merge($datosFormulario, [
            'atencion' => $atencion
        ]));
    }

    public function update(AtencionMedicaRequest $request, $id)
    {
        $atencion = $this->atencionMedicaService->encontrar($id);

        if (!$atencion) {
            abort(404);
        }

        $this->atencionMedicaService->actualizar($atencion, $request->validated());

        return redirect()->route('atenciones-medicas.index')
            ->with('success', 'Atención médica actualizada correctamente.');
    }

    public function destroy($id)
    {
        $atencion = $this->atencionMedicaService->encontrar($id);

        if (!$atencion) {
            abort(404);
        }

        try {
            $this->atencionMedicaService->eliminar($atencion);
            return redirect()->route('atenciones-medicas.index')
                ->with('success', 'Atención médica eliminada correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
