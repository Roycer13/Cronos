<?php

namespace App\Domain\PlantaLacteos\Http\Controllers\Externo;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Http\Requests\Externo\AguaFisicoRequest;
use App\Domain\PlantaLacteos\Models\ExtAguaFisico;
use App\Domain\PlantaLacteos\Services\Externo\AguaFisicoService;
use Inertia\Inertia;
use Illuminate\Http\Request;

class AguaFisicoController extends Controller
{
    protected $service;

    public function __construct(AguaFisicoService $service)
    {
        $this->service = $service;
    }
    public function index(Request $request)
    {
        $user = $request->user();
        $analisis = ExtAguaFisico::with(['detalle.productoTerminado', 'detalle.tipoMuestra'])
            ->whereHas('detalle.solicitud', function ($q) use ($user) {
                $q->where('ubicacion_id', $user->ubicacion_id);
            })
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('planta_lacteos/externo/agua_fisico/index', [
            'analisis' => $analisis,
            'flash' => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function edit(ExtAguaFisico $registro)
    {
        $analistas = \App\Domain\Sistema\Configuracion\Models\User::where('estado', true)->get();
        return Inertia::render('externo/agua_fisico/editar', [
            'registro' => $registro->load('detalle.solicitud'),
            'analistas' => $analistas,
        ]);
    }

    public function update(AguaFisicoRequest $request, ExtAguaFisico $registro)
    {
        $this->authorize('update', $registro);
        $this->service->registrarResultados($registro, $request->validated());
        return redirect()->route('externo.agua-fisico.edit', $registro)->with('success', 'Resultados guardados.');
    }
}
