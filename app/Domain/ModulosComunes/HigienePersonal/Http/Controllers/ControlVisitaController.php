<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Http\Controllers;

use App\Domain\ModulosComunes\HigienePersonal\Http\Requests\StoreControlVisitaRequest;
use App\Domain\ModulosComunes\HigienePersonal\Http\Requests\UpdateControlVisitaRequest;
use App\Http\Controllers\Controller;

use App\Domain\ModulosComunes\HigienePersonal\Services\ControlVisitaService;

use App\Domain\ModulosComunes\HigienePersonal\Models\ControlVisita;
use Illuminate\Http\Request;
use Inertia\Inertia;

    use Carbon\Carbon;


class ControlVisitaController extends Controller
{
    protected ControlVisitaService $service;

    public function __construct(ControlVisitaService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $user        = auth()->user();
        $ubicacionId = $user->ubicacion_id;

        $query = ControlVisita::porUbicacion($ubicacionId)
            ->with(['supervisor', 'ubicacion'])
            ->orderBy('fecha_entrada', 'desc');

        if ($request->filled('filtro_fecha_desde')) {
            $query->whereDate('fecha_entrada', '>=', $request->filtro_fecha_desde);
        }

        if ($request->filled('filtro_fecha_hasta')) {
            $query->whereDate('fecha_entrada', '<=', $request->filtro_fecha_hasta);
        }

        if ($request->filled('filtro_nombre')) {
            $query->where('nombre_visita', 'like', '%' . $request->filtro_nombre . '%');
        }

        if ($request->filled('filtro_empresa')) {
            $query->where('empresa_area_trabajo', 'like', '%' . $request->filtro_empresa . '%');
        }

        if ($request->has('filtro_conforme') && $request->filtro_conforme !== '') {
            $query->where('conforme', $request->filtro_conforme);
        }

        if ($request->has('filtro_estado') && $request->filtro_estado !== '') {
            if ($request->filtro_estado === 'activa') {
                $query->visitasActivas();
            } elseif ($request->filtro_estado === 'finalizada') {
                $query->visitasFinalizadas();
            }
        }

        $perPage  = $request->get('per_page', 10);
        $registros = $query->paginate($perPage);

        return Inertia::render('comunes/controlVisitas/index', [
            'registros' => $registros,
            'filters'   => $request->only([
                'filtro_fecha_desde',
                'filtro_fecha_hasta',
                'filtro_nombre',
                'filtro_empresa',
                'filtro_conforme',
                'filtro_estado',
                'per_page',
            ]),
            'flash' => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ]);
    }

    public function store(StoreControlVisitaRequest $request)
    {
        $supervisor = auth()->user();

        try {
            $this->service->crearRegistro($request->validated(), $supervisor);

            return redirect()->route('control-visitas.index')
                ->with('success', 'Visita registrada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al registrar la visita: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function update(UpdateControlVisitaRequest $request, ControlVisita $controlVisita)
    {
        $user = auth()->user();

        if ($controlVisita->ubicacion_id !== $user->ubicacion_id) {
            abort(403, 'No autorizado.');
        }

        try {
            $this->service->actualizarRegistro($controlVisita, $request->validated());

            return redirect()->route('control-visitas.index')
                ->with('success', 'Visita actualizada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al actualizar la visita: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(ControlVisita $controlVisita)
    {
        $user = auth()->user();

        if ($controlVisita->ubicacion_id !== $user->ubicacion_id) {
            abort(403, 'No autorizado.');
        }

        $controlVisita->delete();

        return redirect()->route('control-visitas.index')
            ->with('success', 'Visita eliminada exitosamente.');
    }

    public function registrarSalida(ControlVisita $controlVisita)
    {
        $user = auth()->user();

        if ($controlVisita->ubicacion_id !== $user->ubicacion_id) {
            abort(403, 'No autorizado.');
        }

        if (!$controlVisita->estaActiva()) {
            return redirect()->back()
                ->with('error', 'Esta visita ya tiene registrada una salida.');
        }

        $this->service->registrarSalida($controlVisita);

        return redirect()->route('control-visitas.index')
            ->with('success', 'Salida registrada exitosamente.');
    }


    
public function pdf(Request $request)
{
    try {
        $user = auth()->user();
        $ubicacionId = $user->ubicacion_id;

        $query = ControlVisita::with(['supervisor', 'ubicacion'])
            ->porUbicacion($ubicacionId)
            ->orderBy('fecha_entrada', 'desc');

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_entrada', '>=', $request->fecha_desde);
        }
        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_entrada', '<=', $request->fecha_hasta);
        }

        $registros = $query->get();

        if ($registros->isEmpty()) {
            return response()->json(['error' => 'No hay visitas en el rango de fechas seleccionado'], 404);
        }

        // Transformar datos (igual que antes)
        $datos = [];
        $supervisoresMap = [];

        foreach ($registros as $v) {
            $fecha = $v->fecha_entrada ? Carbon::parse($v->fecha_entrada)->format('d/m/Y') : '-';
            $horaIngreso = $v->fecha_entrada ? Carbon::parse($v->fecha_entrada)->format('H:i') : '-';
            $horaSalida = $v->fecha_salida ? Carbon::parse($v->fecha_salida)->format('H:i') : 'En instalaciones';

            $datos[] = [
                'fecha' => $fecha,
                'hora_ingreso' => $horaIngreso,
                'nombre' => $v->nombre_visita,
                'cedula' => $v->area_empresa ?? '-',
                'institucion' => $v->empresa_area_trabajo,
                'firma' => $v->supervisor ? trim($v->supervisor->name . ' ' . $v->supervisor->apellido) : '-',
                'hora_salida' => $horaSalida,
                'motivo' => $v->motivo,
                'observaciones' => $v->observaciones ?? '-',
                'conforme' => $v->conforme,
            ];

            if ($v->supervisor && $v->supervisor->codigo) {
                $codigo = $v->supervisor->codigo;
                if (!isset($supervisoresMap[$codigo])) {
                    $supervisoresMap[$codigo] = [
                        'codigo' => $codigo,
                        'nombre' => trim($v->supervisor->name . ' ' . $v->supervisor->apellido),
                    ];
                }
            }
        }

        $usuariosInvolucrados = array_values($supervisoresMap);

        $total = count($datos);
        $conformes = collect($datos)->filter(fn($d) => $d['conforme'])->count();
        $activas = collect($datos)->filter(fn($d) => $d['hora_salida'] === 'En instalaciones')->count();

        return response()->json([
            'datos' => $datos,
            'usuarios_involucrados' => $usuariosInvolucrados,
            'resumen' => [
                'total' => $total,
                'conformes' => $conformes,
                'activas' => $activas,
                'porcentaje' => $total > 0 ? round(($conformes / $total) * 100) : 0,
            ],
            'filtros' => [
                'fecha_desde' => $request->fecha_desde,
                'fecha_hasta' => $request->fecha_hasta,
            ]
        ]);
    } catch (\Exception $e) {
        Log::error('Error en pdf control visitas: ' . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

private function formatearDuracion($minutos): string
{
    if ($minutos < 60) {
        return $minutos . ' min';
    }
    $horas = floor($minutos / 60);
    $mins = $minutos % 60;
    return $horas . 'h ' . $mins . 'min';
}
}