<?php

namespace App\Domain\ModulosComunes\Sanidad\Http\Controllers;

use App\Domain\ModulosComunes\Sanidad\Http\Requests\ReconsultaAtencionMedicaRequest;
use App\Domain\ModulosComunes\Sanidad\Services\ReconsultaAtencionMedicaService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReconsultaAtencionMedicaController extends Controller
{
    protected ReconsultaAtencionMedicaService $reconsultaService;

    public function __construct(ReconsultaAtencionMedicaService $reconsultaService)
    {
        $this->reconsultaService = $reconsultaService;
    }

    public function store(ReconsultaAtencionMedicaRequest $request)
    {
        $data = $request->validated();
        $data['medico'] = auth()->id();
        $reconsulta = $this->reconsultaService->crear($data);

        return redirect()->route('atenciones-medicas.show', $reconsulta->atencion_medica_id)
            ->with('success', 'Reconsulta registrada correctamente.');
    }

    public function update(ReconsultaAtencionMedicaRequest $request, $id)
    {
        $reconsulta = $this->reconsultaService->encontrar($id);
        if (!$reconsulta) abort(404);

        $this->reconsultaService->actualizar($reconsulta, $request->validated());

        return redirect()->route('atenciones-medicas.show', $reconsulta->atencion_medica_id)
            ->with('success', 'Reconsulta actualizada correctamente.');
    }

    public function destroy($id)
    {
        $reconsulta = $this->reconsultaService->encontrar($id);
        if (!$reconsulta) abort(404);

        $atencionId = $reconsulta->atencion_medica_id;
        $this->reconsultaService->eliminar($reconsulta);

        return redirect()->route('atenciones-medicas.show', $atencionId)
            ->with('success', 'Reconsulta eliminada correctamente.');
    }
}
