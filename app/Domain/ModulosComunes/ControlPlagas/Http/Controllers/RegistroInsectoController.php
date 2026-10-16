<?php

namespace App\Domain\ModulosComunes\ControlPlagas\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Domain\ModulosComunes\ControlPlagas\Models\{
    Insectocaptor,
    RegistroInsecto
};
use App\Domain\ModulosComunes\ControlPlagas\Services\{
    RegistroInsectoService
};
use App\Domain\ModulosComunes\ControlPlagas\Http\Requests\{
    RegistroInsectoRequest
};
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RegistroInsectoController extends Controller
{
    public function __construct(protected RegistroInsectoService $service) {}

    public function index(Request $request)
    {
        $query = RegistroInsecto::with(['insectocaptor.sector', 'inspector'])->orderBy('fecha', 'desc');

        if ($request->filled('filtro_equipo')) $query->where('PLAG_insectocaptor_id', $request->filtro_equipo);
        if ($request->filled('filtro_fecha_desde') || $request->filled('filtro_fecha_hasta')) {
            $query->porFecha($request->filtro_fecha_desde, $request->filtro_fecha_hasta);
        }
        if ($request->has('filtro_estado_equipo') && $request->filtro_estado_equipo !== '') {
            $query->where('estado_equipo', $request->filtro_estado_equipo);
        }

        return Inertia::render('comunes/plagas/registroInsectos/index', [
            'registros'    => $query->paginate($request->get('per_page', 10)),
            'equipos'      => Insectocaptor::activos()->with('sector')->get(),
            'filters'      => $request->only(['filtro_equipo', 'filtro_fecha_desde', 'filtro_fecha_hasta', 'filtro_estado_equipo', 'per_page']),
            'flash'        => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function store(RegistroInsectoRequest $request)
    {
        $this->service->crear($request->validated(), auth()->user());
        return redirect()->route('plagas.registro-insectos.index')->with('success', 'Registro de conteo guardado correctamente.');
    }

    public function update(RegistroInsectoRequest $request, RegistroInsecto $registroInsecto)
    {
        $this->service->actualizar($registroInsecto, $request->validated());
        return redirect()->route('plagas.registro-insectos.index')->with('success', 'Registro actualizado.');
    }

    public function destroy(RegistroInsecto $registroInsecto)
    {
        $registroInsecto->delete();
        return redirect()->route('plagas.registro-insectos.index')->with('success', 'Registro eliminado.');
    }
    public function pdf(Request $request)
    {
        try {
            $query = RegistroInsecto::with(['insectocaptor.sector', 'inspector'])
                ->orderBy('fecha', 'asc');

            // Filtros de fecha
            if ($request->filled('fecha_desde')) {
                $fechaDesde = Carbon::parse($request->fecha_desde)->startOfDay();
                $query->where('fecha', '>=', $fechaDesde);
            }
            if ($request->filled('fecha_hasta')) {
                $fechaHasta = Carbon::parse($request->fecha_hasta)->endOfDay();
                $query->where('fecha', '<=', $fechaHasta);
            }

            // Filtro por equipo (opcional)
            if ($request->filled('filtro_equipo')) {
                $query->where('PLAG_insectocaptor_id', $request->filtro_equipo);
            }

            $registros = $query->get();

            // Recolectar usuarios involucrados (inspectores)
            $usuariosMap = [];
            foreach ($registros as $r) {
                if ($r->inspector) {
                    $codigo = $r->inspector->codigo ?? 'S/C';
                    $clave = $codigo !== 'S/C' ? $codigo : 'user_' . $r->inspector->id;
                    if (!isset($usuariosMap[$clave])) {
                        $usuariosMap[$clave] = [
                            'codigo' => $codigo,
                            'nombre' => trim(($r->inspector->name ?? '') . ' ' . ($r->inspector->apellido ?? '')),
                        ];
                    }
                }
            }

            // Preparar datos para el PDF
            $datosPdf = $registros->map(function ($r) {
                return [
                    'id' => $r->id,
                    'fecha' => $r->fecha,
                    'equipo_codigo' => $r->insectocaptor?->codigo_interno ?? '-',
                    'equipo_tipo' => $r->insectocaptor?->tipo ?? '-',
                    'sector' => $r->insectocaptor?->sector?->nombre ?? '-',
                    'mosca' => $r->mosca ?? 0,
                    'mosquito' => $r->mosquito ?? 0,
                    'abeja' => $r->abeja ?? 0,
                    'mariposa' => $r->mariposa ?? 0,
                    'otros' => $r->otros ?? 0,
                    'total' => $r->total_insectos,
                    'cambio_adhesivo' => $r->cambio_adhesivo,
                    'estado_equipo' => $r->estado_equipo,
                    'inspector' => trim(($r->inspector?->name ?? '') . ' ' . ($r->inspector?->apellido ?? '')),
                    'observacion' => $r->observacion,
                    'correcion' => $r->correcion,
                ];
            });

            return response()->json([
                'registros' => $datosPdf,
                'usuarios_involucrados' => array_values($usuariosMap),
                'filtros' => [
                    'fecha_desde' => $request->fecha_desde,
                    'fecha_hasta' => $request->fecha_hasta,
                    'filtro_equipo' => $request->filtro_equipo,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error en PDF de registro insectos: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
