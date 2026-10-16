<?php

namespace App\Domain\ModulosComunes\ControlPlagas\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Domain\ModulosComunes\ControlPlagas\Models\{
    BarreraPlaga,
    ControlBarrera,
    PresenciaVector,
    Trampa,
    ControlTrampa,
    ArranqueFumigacion,
    Insectocaptor,
    RegistroInsecto
};
use App\Domain\ModulosComunes\ControlPlagas\Services\{
    BarreraPlagaService,
    ControlBarreraService,
    PresenciaVectorService,
    TrampaService,
    ControlTrampaService,
    ArranqueFumigacionService,
    InsectocaptorService,
    RegistroInsectoService
};
use App\Domain\ModulosComunes\ControlPlagas\Http\Requests\{
    BarreraPlagaRequest,
    ControlBarreraRequest,
    PresenciaVectorRequest,
    TrampaRequest,
    ControlTrampaRequest,
    ArranqueFumigacionRequest,
    InsectocaptorRequest,
    RegistroInsectoRequest
};
use App\Domain\Sistema\Configuracion\Models\Sector;
use Illuminate\Support\Facades\DB;

class ControlTrampaController extends Controller
{
    public function __construct(protected ControlTrampaService $service) {}

    public function index(Request $request)
    {
        $query = ControlTrampa::with(['trampa.sector', 'inspector'])->orderBy('fecha', 'desc');

        if ($request->filled('filtro_trampa'))  $query->porTrampa($request->filtro_trampa);
        if ($request->filled('filtro_tipo'))    $query->porTipoRevision($request->filtro_tipo);
        if ($request->has('filtro_deterioro') && $request->filtro_deterioro !== '') {
            $query->where('deterioro', $request->filtro_deterioro);
        }
        if ($request->filled('filtro_fecha')) {
            $query->porFecha($request->filtro_fecha, $request->filtro_fecha);
        } elseif ($request->filled('filtro_fecha_desde') || $request->filled('filtro_fecha_hasta')) {
            $query->porFecha($request->filtro_fecha_desde, $request->filtro_fecha_hasta);
        }

        return Inertia::render('comunes/plagas/controlTrampas/index', [
            'registros'   => $query->paginate($request->get('per_page', 10)),
            'trampas'     => Trampa::activas()->with('sector')->get(),
            'sectores' => Sector::select('id', 'nombre')->get(),
            'glosas'      => ControlTrampa::OBSERVACIONES_GLOSAS,
            'tiposRevision' => ControlTrampa::TIPOS_REVISION,
            'filters'     => $request->only(['filtro_trampa', 'filtro_tipo', 'filtro_deterioro', 'filtro_fecha', 'filtro_fecha_desde', 'filtro_fecha_hasta', 'per_page']),
            'flash'       => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function store(ControlTrampaRequest $request)
    {
        $this->service->crear($request->validated(), auth()->user());
        return redirect()->route('plagas.control-trampas.index')->with('success', 'Inspección registrada correctamente.');
    }

    public function update(ControlTrampaRequest $request, ControlTrampa $controlTrampa)
    {
        $this->service->actualizar($controlTrampa, $request->validated());
        return redirect()->route('plagas.control-trampas.index')->with('success', 'Inspección actualizada.');
    }

    public function destroy(ControlTrampa $controlTrampa)
    {
        $controlTrampa->delete();
        return redirect()->route('plagas.control-trampas.index')->with('success', 'Registro eliminado.');
    }


    public function registroRapido()
    {
        $user = auth()->user();
        $ubicacionId = $user->ubicacion_id;

        $trampas = Trampa::with('sector')
            ->whereHas('sector', fn($q) => $q->where('ubicacion_id', $ubicacionId))
            ->activas()
            ->orderBy('man_sector_id')  // ← Cambiado de 'sector_id' a 'man_sector_id'
            ->orderBy('codigo')
            ->get();

        $sectores = Sector::where('ubicacion_id', $ubicacionId)->get(['id', 'nombre']);

        return Inertia::render('comunes/plagas/controlTrampas/registro-rapido', [
            'trampas'       => $trampas,
            'sectores'      => $sectores,
            'glosas'        => ControlTrampa::OBSERVACIONES_GLOSAS,
            'tiposRevision' => ControlTrampa::TIPOS_REVISION,
            'flash'         => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ]);
    }

    public function storeRapido(Request $request)
    {
        $data = $request->validate([
            'controles' => 'required|array',
            'controles.*.PLAG_trampa_id'      => 'required|exists:PLAG_trampas,id',
            'controles.*.tipo_revision'       => 'required|string|in:' . implode(',', ControlTrampa::TIPOS_REVISION),
            'controles.*.observacion'         => 'required|string|in:' . implode(',', ControlTrampa::OBSERVACIONES_GLOSAS),
            'controles.*.observacion_detalle' => 'nullable|string|max:500',
            'controles.*.correcion'           => 'nullable|string|max:500',
            'controles.*.responsable_correcion' => 'nullable|string|max:255',
            'controles.*.deterioro'           => 'required|boolean',
            'controles.*.responsable_cambio'  => 'nullable|string|max:255',
        ]);

        $inspector = auth()->user();
        $now = now();

        DB::transaction(function () use ($data, $inspector, $now) {
            foreach ($data['controles'] as $control) {
                ControlTrampa::create([
                    'PLAG_trampa_id'        => $control['PLAG_trampa_id'],
                    'user_id'               => $inspector->id,
                    'fecha'                 => $now,
                    'tipo_revision'         => $control['tipo_revision'],
                    'observacion'           => $control['observacion'],
                    'observacion_detalle'   => $control['observacion_detalle'] ?? null,
                    'correcion'             => $control['correcion'] ?? null,
                    'responsable_correcion' => $control['responsable_correcion'] ?? null,
                    'deterioro'             => $control['deterioro'],
                    'responsable_cambio'    => $control['responsable_cambio'] ?? null,
                ]);
            }
        });

        return redirect()->route('plagas.control-trampas.index')
            ->with('success', 'Inspecciones registradas exitosamente.');
    }

    public function pdf(Request $request)
    {
        $query = ControlTrampa::with(['trampa.sector', 'inspector'])->orderBy('fecha', 'desc');

        if ($request->filled('filtro_trampa'))  $query->porTrampa($request->filtro_trampa);
        if ($request->filled('filtro_tipo'))    $query->porTipoRevision($request->filtro_tipo);
        if ($request->has('filtro_deterioro') && $request->filtro_deterioro !== '') {
            $query->where('deterioro', $request->filtro_deterioro);
        }
        if ($request->filled('filtro_fecha')) {
            $query->porFecha($request->filtro_fecha, $request->filtro_fecha);
        } elseif ($request->filled('filtro_fecha_desde') || $request->filled('filtro_fecha_hasta')) {
            $query->porFecha($request->filtro_fecha_desde, $request->filtro_fecha_hasta);
        }

        $datos = $query->get();
        $resumen = [
            'conDeterioro' => $datos->where('deterioro', true)->count(),
            'sinNovedad'   => $datos->where('observacion', 'Sin novedad')->count(),
        ];

        return response()->json([
            'datos'    => $datos,
            'resumen'  => $resumen,
            'filtros'  => $request->only(['filtro_trampa', 'filtro_tipo', 'filtro_deterioro', 'filtro_fecha', 'filtro_fecha_desde', 'filtro_fecha_hasta']),
        ]);
    }
}
