<?php

namespace App\Domain\PlantaLacteos\Http\Controllers\Externo;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Http\Requests\Externo\MicrobiologiaRequest;
use App\Domain\PlantaLacteos\Models\ExtMicrobiologia;
use App\Domain\PlantaLacteos\Services\Externo\MicrobiologiaService;
use Inertia\Inertia;
use Illuminate\Http\Request;

class MicrobiologiaController extends Controller
{
    protected $service;

    public function __construct(MicrobiologiaService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $analisis = ExtMicrobiologia::with(['detalle.productoTerminado', 'detalle.tipoMuestra'])
            ->whereHas('detalle.solicitud', function ($q) use ($user) {
                $q->where('ubicacion_id', $user->ubicacion_id);
            })
            ->orderBy('id', 'desc')
            ->get();   // ← antes paginate(10)

        return Inertia::render('planta_lacteos/externo/microbiologia/index', [
            'analisis' => $analisis,
            'flash' => ['success' => session('success'), 'error' => session('error')],
        ]);
    }
    // Formulario para editar/llenar siembra o día 2 o día 5 según estado
    public function edit(ExtMicrobiologia $microbiologia)
    {
        $analistas = \App\Domain\Sistema\Configuracion\Models\User::where('estado', true)->get();
        return Inertia::render('planta_lacteos/externo/microbiologia/editar', [
            'microbiologia' => $microbiologia->load('detalle.solicitud', 'detalle.tipoMuestra'),
            'analistas' => $analistas,
        ]);
    }

    // Actualizar siembra
    public function updateSiembra(MicrobiologiaRequest $request, $microbiologia)
    {
        $micro = ExtMicrobiologia::findOrFail($microbiologia);
        $data = $request->validated();
        $data['ana_sem_id'] = $data['ana_sem_id'] ?? auth()->id();
        $this->service->registrarSiembra($micro, $data);
        return redirect()->route('externo.microbiologia.index')->with('success', 'Siembra registrada.');
    }

    public function updateDia2(MicrobiologiaRequest $request, $microbiologia)
    {
        $micro = ExtMicrobiologia::findOrFail($microbiologia);
        $data = $request->validated();
        $data['ana_dia2_id'] = $data['ana_dia2_id'] ?? auth()->id();
        $this->service->registrarDia2($micro, $data);
        return redirect()->route('externo.microbiologia.index')->with('success', 'Día 2 registrado.');
    }

    public function updateDia5(MicrobiologiaRequest $request, $microbiologia)
    {
        $micro = ExtMicrobiologia::findOrFail($microbiologia);
        $data = $request->validated();
        $data['ana_dia5_id'] = $data['ana_dia5_id'] ?? auth()->id();
        $this->service->registrarDia5($micro, $data);
        return redirect()->route('externo.microbiologia.index')->with('success', 'Análisis completado.');
    }
    public function completarDia2($microbiologia)
    {
        $micro = ExtMicrobiologia::with('detalle.tipoMuestra')->findOrFail($microbiologia);
        $tipoMuestra = $micro->detalle?->tipoMuestra;
        $tipoMuestraNombre = strtolower($tipoMuestra->nombre ?? '');
        $esPaneton = str_contains($tipoMuestraNombre, 'paneton') || str_contains($tipoMuestraNombre, 'panetón');

        $data = [
            'fecha_dia2' => now()->format('Y-m-d'),
            'ana_dia2_id' => auth()->id(),
            'aer_mes' => $tipoMuestra?->mesofilos ? 0 : null,
            'col_tot' => $tipoMuestra?->coliformes ? 0 : null,
        ];
        if ($esPaneton) {
            $data['aer_mes2'] = 0;
            $data['col_tot2'] = 0;
        }

        $this->service->registrarDia2($micro, $data);
        return redirect()->route('externo.microbiologia.index')->with('success', 'Día 2 completado (limpio).');
    }

    public function completarDia5($microbiologia)
    {
        $micro = ExtMicrobiologia::with('detalle.tipoMuestra')->findOrFail($microbiologia);
        $tipoMuestra = $micro->detalle?->tipoMuestra;
        $tipoMuestraNombre = strtolower($tipoMuestra->nombre ?? '');
        $esPaneton = str_contains($tipoMuestraNombre, 'paneton') || str_contains($tipoMuestraNombre, 'panetón');

        $data = [
            'fecha_dia5' => now()->format('Y-m-d'),
            'ana_dia5_id' => auth()->id(),
            'moh_lev' => $tipoMuestra?->mohos ? 0 : null,
        ];
        if ($esPaneton) {
            $data['moh_lev2'] = 0;
        }

        $this->service->registrarDia5($micro, $data);
        return redirect()->route('externo.microbiologia.index')->with('success', 'Día 5 completado (limpio).');
    }
}
