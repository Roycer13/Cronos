<?php

namespace App\Domain\PlantaLacteos\Http\Controllers\Externo;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Http\Requests\Externo\ActividadAguaRequest;
use App\Domain\PlantaLacteos\Models\ExtActividadAgua;
use App\Domain\PlantaLacteos\Services\Externo\ActividadAguaService;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ActividadAguaController extends Controller
{
    protected $service;

    public function __construct(ActividadAguaService $service)
    {
        $this->service = $service;
    }
   public function index(Request $request)
{
    $user = $request->user();
    $analisis = ExtActividadAgua::with(['detalle.productoTerminado', 'detalle.tipoMuestra'])
        ->whereHas('detalle.solicitud', function ($q) use ($user) {
            $q->where('ubicacion_id', $user->ubicacion_id);
        })
        ->orderBy('id', 'desc')
        ->get();

    return Inertia::render('planta_lacteos/externo/actividad_agua/index', [
        'analisis' => $analisis,
        'flash' => ['success' => session('success'), 'error' => session('error')],
    ]);
}

    public function edit(ExtActividadAgua $actividad)
    {
        $analistas = \App\Domain\Sistema\Configuracion\Models\User::where('estado', true)->get();
        return Inertia::render('planta_lacteos/externo/actividad_agua/editar', [
            'actividad' => $actividad->load('detalle.solicitud'),
            'analistas' => $analistas,
        ]);
    }

    public function update(ActividadAguaRequest $request, ExtActividadAgua $actividad)
    {
        $this->service->registrarResultados($actividad, $request->validated());
        
        return redirect()->route('externo.actividad-agua.index', $actividad)->with('success', 'Resultados guardados.');
    }
}
