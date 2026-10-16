<?php

namespace App\Domain\ModulosComunes\Sanidad\Http\Controllers;

use App\Domain\ModulosComunes\Sanidad\Http\Requests\ExamenOcupacionalRequest;
use App\Domain\ModulosComunes\Sanidad\Services\ExamenOcupacionalService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamenOcupacionalController extends Controller
{
    protected ExamenOcupacionalService $examenService;

    public function __construct(ExamenOcupacionalService $examenService)
    {
        $this->examenService = $examenService;
    }

    public function index(Request $request)
    {
        $filtros = $request->only([
            'tipo_examen',
            'empleado_id',
            'medico_id',
            'fecha_desde',
            'fecha_hasta',
            'aptitud_ocupacional',
            'policlinico_id',
            'transferencia_requerida'
        ]);
        $examenes = $this->examenService->listar($filtros, 10);

        return Inertia::render('sanidad/examenesOcupacionales/index', [
            'examenes' => $examenes,
            'filtros' => $filtros
        ]);
    }

    public function create()
    {
        $datosFormulario = $this->examenService->obtenerParaFormulario();


        // Asegurar que los arrays existan
        $datosFormulario['tiposExamen'] = $datosFormulario['tipos_examen'] ?? [];
        unset($datosFormulario['tipos_examen']);
        $datosFormulario['empleados'] = $datosFormulario['empleados'] ?? [];
        $datosFormulario['policlinicos'] = $datosFormulario['policlinicos'] ?? [];

        return Inertia::render('sanidad/examenesOcupacionales/create', $datosFormulario);
    }

    public function store(ExamenOcupacionalRequest $request)
    {
        $data = $request->validated();
        $data['medico_id'] = auth()->id();
        // No recalcular tiempo_servicio_total, ya viene del frontend
        $this->examenService->crear($data);

        return redirect()->route('examenes-ocupacionales.index')
            ->with('success', 'Examen ocupacional registrado correctamente.');
    }

    public function show($id)
    {
        $examen = $this->examenService->encontrar($id);

        if (!$examen) {
            abort(404);
        }

        return Inertia::render('sanidad/examenesOcupacionales/show', [
            'examen' => $examen
        ]);
    }

    public function edit($id)
    {
        $examen = $this->examenService->encontrar($id);
        if (!$examen) abort(404);

        $datosFormulario = $this->examenService->obtenerParaFormulario();
        // Renombrar la clave para que coincida con el componente React
        $datosFormulario['tiposExamen'] = $datosFormulario['tipos_examen'] ?? [];
        unset($datosFormulario['tipos_examen']);

        return Inertia::render('sanidad/examenesOcupacionales/edit', array_merge($datosFormulario, [
            'examen' => $examen
        ]));
    }

    public function update(ExamenOcupacionalRequest $request, $id)
    {
        $examen = $this->examenService->encontrar($id);

        if (!$examen) {
            abort(404);
        }

        $this->examenService->actualizar($examen, $request->validated());

        return redirect()->route('examenes-ocupacionales.index')
            ->with('success', 'Examen ocupacional actualizado correctamente.');
    }

    public function destroy($id)
    {
        $examen = $this->examenService->encontrar($id);

        if (!$examen) {
            abort(404);
        }

        $this->examenService->eliminar($examen);

        return redirect()->route('examenes-ocupacionales.index')
            ->with('success', 'Examen ocupacional eliminado correctamente.');
    }
}
