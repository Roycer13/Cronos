<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Domain\PlantaLacteos\Services\UhtHtstService;
use App\Domain\PlantaLacteos\Services\DashboardPlantaService;
use App\Domain\PlantaLacteos\Models\AnalisisLinea;
use App\Domain\ModulosComunes\Orp\Models\Orp;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class UhtHtstController extends Controller
{
    protected UhtHtstService $service;
    protected DashboardPlantaService $dashboardService;


    public function __construct(UhtHtstService $service, DashboardPlantaService $dashboardService)
    {

        $this->service = $service;
        $this->dashboardService = $dashboardService;
    }

    public function index(string $tipo)
    {
        if (!in_array($tipo, ['UHT', 'HTST'])) {
            abort(404);
        }

        $data = [
            'tipo' => $tipo,
            'pesos' => $this->service->getPesosData($tipo),
            'temperaturas' => $this->service->getTemperaturasData($tipo),
            'orps_vencimiento' => $this->service->getVencimientosData($tipo),
        ];

        if ($tipo === 'UHT') {
            $dashboardData = $this->dashboardService->getDashboardData();

            // Optimizar consulta de ORPs en producción usando scopes existentes
            $orpsProduccion = Orp::enPlantaLacteos()
                ->enProceso()
                ->with(['productoTerminado.linea'])
                ->get();

            $etapas = \App\Domain\Sistema\Configuracion\Models\Estado::where('nombre', 'LIKE', 'Mezcla%')
                ->orWhere('nombre', 'LIKE', '%Pasteurizado%')
                ->orWhere('nombre', 'LIKE', '%Inoculacion%')
                ->orWhere('nombre', 'LIKE', '%Corte%')
                ->orWhere('nombre', 'LIKE', '%Saborizacion%')
                ->orWhere('nombre', 'LIKE', '%Envasando%')
                ->get();

            $data = array_merge($data, $dashboardData, [
                'orps' => $orpsProduccion,
                'etapas' => $etapas,
            ]);
        }

        return Inertia::render('planta_lacteos/UhtHtst/index', $data);
    }

    public function updatePeso(Request $request, $id)
    {
        $request->validate(['peso' => 'nullable|numeric']);
        $analisis = AnalisisLinea::findOrFail($id);
        $analisis->peso = $request->peso;
        $analisis->save();

        return redirect()->back()->with('success', 'Peso actualizado.');
    }

    public function updateTemperatura(Request $request, $id)
    {
        $request->validate(['tempUHT' => 'nullable|numeric']);
        $analisis = AnalisisLinea::findOrFail($id);
        $analisis->tempUHT = $request->tempUHT;
        $analisis->save();

        return redirect()->back()->with('success', 'Temperatura actualizada.');
    }

    public function updateVencimiento(Request $request, $id)
    {
        $request->validate(['fecha_vencimiento1' => 'nullable|date']);
        $orp = Orp::findOrFail($id);
        $orp->fecha_vencimiento1 = $request->fecha_vencimiento1;
        $orp->save();

        return redirect()->back()->with('success', 'Fecha de vencimiento actualizada.');
    }
}
