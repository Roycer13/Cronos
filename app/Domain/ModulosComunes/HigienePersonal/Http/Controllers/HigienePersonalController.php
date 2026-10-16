<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\ModulosComunes\HigienePersonal\Models\HigienePersonal;
use App\Domain\ModulosComunes\HigienePersonal\Services\HigienePersonalService;
use App\Domain\ModulosComunes\HigienePersonal\Http\Requests\StoreHigienePersonalRequest;
use App\Domain\ModulosComunes\HigienePersonal\Http\Requests\UpdateHigienePersonalRequest;
use App\Domain\ModulosComunes\HigienePersonal\Http\Requests\ReporteRequest;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\Sistema\Configuracion\Models\Area;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PDF;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class HigienePersonalController extends Controller
{
    protected $service;

    public function __construct(HigienePersonalService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $ubicacionId = $user->ubicacion_id;

        $query = HigienePersonal::porUbicacion($ubicacionId)
            ->with(['empleado', 'supervisor', 'ubicacion'])
            ->orderBy('fecha', 'desc');

        // Aplicar filtros
        if ($request->filled('filtro_fecha_desde')) {
            $query->whereDate('fecha', '>=', $request->filtro_fecha_desde);
        }

        if ($request->filled('filtro_fecha_hasta')) {
            $query->whereDate('fecha', '<=', $request->filtro_fecha_hasta);
        }

        if ($request->filled('filtro_empleado')) {
            $query->where('empleado_id', $request->filtro_empleado);
        }

        if ($request->has('filtro_conforme') && $request->filtro_conforme !== '') {
            $query->where('conforme', $request->filtro_conforme);
        }

        if ($request->filled('filtro_area')) {
            $query->whereHas('empleado', function ($q) use ($request) {
                $q->where('area_id', $request->filtro_area);
            });
        }

        // *** FILTRO TURNO MODIFICADO: usar columna turno del registro ***
        if ($request->filled('filtro_turno')) {
            $query->where('turno', $request->filtro_turno);
        }

        $registros = $query->paginate(20);

        // Datos para formularios
        $empleados = User::where('ubicacion_id', $ubicacionId)
            ->select('id', 'name', 'apellido', 'codigo', 'area_id', 'turno', 'cargo')
            ->get();

        $areas = Area::all();
        // Obtener turnos disponibles desde los registros (para mostrar solo turnos con datos)
        $turnos = HigienePersonal::where('ubicacion_id', $ubicacionId)
            ->whereNotNull('turno')
            ->distinct('turno')
            ->pluck('turno');

        return Inertia::render('comunes/higienePersonal/index', [
            'registros' => $registros,
            'empleados' => $empleados,
            'areas' => $areas,
            'turnos' => $turnos,
            'filtros' => $request->only([
                'filtro_fecha_desde',
                'filtro_fecha_hasta',
                'filtro_empleado',
                'filtro_conforme',
                'filtro_area',
                'filtro_turno'
            ]),
        ]);
    }

    public function store(StoreHigienePersonalRequest $request)
    {
        $supervisor = auth()->user();
        try {
            $this->service->crearRegistro($request->validated(), $supervisor);
            return redirect()->route('higiene-personal.index')
                ->with('success', 'Registro de higiene personal creado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al crear el registro: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(HigienePersonal $higienePersonal)
    {
        $user = auth()->user();
        if ($higienePersonal->ubicacion_id !== $user->ubicacion_id) {
            abort(403, 'No autorizado.');
        }
        return response()->json($higienePersonal->load(['empleado', 'supervisor', 'ubicacion']));
    }

    public function update(UpdateHigienePersonalRequest $request, HigienePersonal $higienePersonal)
    {
        $user = auth()->user();
        if ($higienePersonal->ubicacion_id !== $user->ubicacion_id) {
            abort(403, 'No autorizado.');
        }

        try {
            $this->service->actualizarRegistro($higienePersonal, $request->validated());
            return redirect()->route('higiene-personal.index')
                ->with('success', 'Registro de higiene personal actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al actualizar el registro: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(HigienePersonal $higienePersonal)
    {
        $user = auth()->user();
        if ($higienePersonal->ubicacion_id !== $user->ubicacion_id) {
            abort(403, 'No autorizado.');
        }
        $higienePersonal->delete();
        return redirect()->route('higiene-personal.index')
            ->with('success', 'Registro de higiene personal eliminado exitosamente.');
    }

    public function buscarEmpleados(Request $request)
    {
        $user = auth()->user();
        $ubicacionId = $user->ubicacion_id;
        $empleados = $this->service->buscarEmpleados($request->all(), $ubicacionId);
        return response()->json($empleados);
    }

    public function reporte(ReporteRequest $request)
    {
        $user = auth()->user();
        $ubicacionId = $user->ubicacion_id;

        $query = HigienePersonal::porUbicacion($ubicacionId)
            ->with(['empleado', 'supervisor', 'ubicacion', 'empleado.area'])
            ->orderBy('fecha', 'desc');

        $filtros = $request->validated();

        if (!empty($filtros['fecha_desde'])) {
            $query->whereDate('fecha', '>=', $filtros['fecha_desde']);
        }
        if (!empty($filtros['fecha_hasta'])) {
            $query->whereDate('fecha', '<=', $filtros['fecha_hasta']);
        }
        if (!empty($filtros['empleado_id'])) {
            $query->where('empleado_id', $filtros['empleado_id']);
        }
        if (!empty($filtros['area_id'])) {
            $query->whereHas('empleado', function ($q) use ($filtros) {
                $q->where('area_id', $filtros['area_id']);
            });
        }
        // *** FILTRO TURNO MODIFICADO ***
        if (!empty($filtros['turno'])) {
            $query->where('turno', $filtros['turno']);
        }
        if (isset($filtros['conforme'])) {
            $query->where('conforme', $filtros['conforme']);
        }

        $registros = $query->get();
        $estadisticas = $this->service->generarEstadisticas($query);
        $porTurno = $this->service->obtenerDistribucionPorTurno($query);
        $porArea = $this->service->obtenerDistribucionPorArea($query);

        if ($request->wantsJson()) {
            return response()->json([
                'registros' => $registros,
                'estadisticas' => $estadisticas,
                'distribucion_turno' => $porTurno,
                'distribucion_area' => $porArea,
            ]);
        }

        // Para la vista, obtenemos turnos disponibles desde los registros
        $turnosDisponibles = HigienePersonal::where('ubicacion_id', $ubicacionId)
            ->whereNotNull('turno')
            ->distinct('turno')
            ->pluck('turno');

        return Inertia::render('comunes/higienePersonal/reporte', [
            'registros' => $registros,
            'estadisticas' => $estadisticas,
            'distribucion_turno' => $porTurno,
            'distribucion_area' => $porArea,
            'filtros' => $filtros,
            'areas' => Area::all(),
            'turnos' => $turnosDisponibles,
            'empleados' => User::where('ubicacion_id', $ubicacionId)
                ->select('id', 'name', 'apellido', 'codigo')
                ->get(),
        ]);
    }

    public function exportar(ReporteRequest $request)
    {
        $user = auth()->user();
        $ubicacionId = $user->ubicacion_id;

        $query = HigienePersonal::porUbicacion($ubicacionId)
            ->with(['empleado', 'supervisor', 'ubicacion', 'empleado.area'])
            ->orderBy('fecha', 'desc');

        $filtros = $request->validated();

        if (!empty($filtros['fecha_desde'])) {
            $query->whereDate('fecha', '>=', $filtros['fecha_desde']);
        }
        if (!empty($filtros['fecha_hasta'])) {
            $query->whereDate('fecha', '<=', $filtros['fecha_hasta']);
        }
        if (!empty($filtros['empleado_id'])) {
            $query->where('empleado_id', $filtros['empleado_id']);
        }
        if (!empty($filtros['area_id'])) {
            $query->whereHas('empleado', function ($q) use ($filtros) {
                $q->where('area_id', $filtros['area_id']);
            });
        }
        // *** FILTRO TURNO MODIFICADO ***
        if (!empty($filtros['turno'])) {
            $query->where('turno', $filtros['turno']);
        }
        if (isset($filtros['conforme'])) {
            $query->where('conforme', $filtros['conforme']);
        }

        $registros = $query->get();
        $estadisticas = $this->service->generarEstadisticas($query);
        $porTurno = $this->service->obtenerDistribucionPorTurno($query);
        $porArea = $this->service->obtenerDistribucionPorArea($query);

        $data = [
            'registros' => $registros,
            'estadisticas' => $estadisticas,
            'distribucion_turno' => $porTurno,
            'distribucion_area' => $porArea,
            'fecha_generacion' => now()->format('d/m/Y H:i:s'),
            'usuario' => auth()->user()->name,
        ];

        $pdf = PDF::loadView('modulos_comunes.higiene_personal.reporte_pdf', $data);
        return $pdf->download('reporte-higiene-personal-' . now()->format('Y-m-d') . '.pdf');
    }

    // Método para registro rápido (modificado para asignar turno)
    public function storeRapido(Request $request)
    {
        $supervisor = auth()->user();
        $ubicacionId = $supervisor->ubicacion_id;

        $request->validate([
            'empleado_id'   => 'required|exists:users,id',
            'no_asistio'    => 'sometimes|boolean',
            'uniforme'      => 'nullable|boolean',
            'limpieza'      => 'nullable|boolean',
            'lavado_manos'  => 'nullable|boolean',
            'salud'         => 'nullable|boolean',
            'epp'           => 'nullable|boolean',
            'objetos'       => 'nullable|boolean',
            'material_equipo' => 'nullable|boolean',
            'observaciones' => 'nullable|string',
            'correccion'    => 'nullable|string',
        ]);

        // Obtener empleado para asignar su turno
        $empleado = User::find($request->empleado_id);
        if (!$empleado) {
            return redirect()->back()->with('error', 'Empleado no encontrado');
        }

        $data = [
            'ubicacion_id'   => $ubicacionId,
            'empleado_id'    => $request->empleado_id,
            'supervisor_id'  => $supervisor->id,
            'fecha'          => now(),
            'turno'          => $empleado->turno, // <- ASIGNADO
            'observaciones'  => $request->observaciones,
            'correccion'     => $request->correccion,
        ];

        if ($request->input('no_asistio')) {
            $data['uniforme']        = null;
            $data['limpieza']        = null;
            $data['lavado_manos']    = null;
            $data['salud']           = null;
            $data['epp']             = null;
            $data['objetos']         = null;
            $data['material_equipo'] = null;
            $data['conforme']        = null;
        } else {
            $data['uniforme']        = $request->input('uniforme', true);
            $data['limpieza']        = $request->input('limpieza', true);
            $data['lavado_manos']    = $request->input('lavado_manos', true);
            $data['salud']           = $request->input('salud', true);
            $data['epp']             = $request->input('epp', true);
            $data['objetos']         = $request->input('objetos', true);
            $data['material_equipo'] = $request->input('material_equipo', true);
            $data['conforme']        = $data['uniforme'] && $data['limpieza'] && $data['lavado_manos'] && $data['salud'] && $data['epp'] && $data['objetos'] && $data['material_equipo'];
        }

        HigienePersonal::create($data);

        return redirect()->back()->with('success', 'Registro guardado exitosamente');
    }

    private function getRegistroRapidoData()
    {
        $user = auth()->user();
        $ubicacionId = $user->ubicacion_id;

        $idMantenimiento = Ubicacion::where('nombre', 'Mantenimiento')->first()?->id;

        $query = User::with(['area'])
            ->select('id', 'name', 'apellido', 'codigo', 'cargo', 'turno', 'area_id', 'ubicacion_id')
            ->orderBy('name');

        if (!$user->hasRole('admin')) {
            $ubicacionesPermitidas = [$ubicacionId];
            if ($idMantenimiento) {
                $ubicacionesPermitidas[] = $idMantenimiento;
            }
            $query->whereIn('ubicacion_id', $ubicacionesPermitidas);
        }

        $empleados = $query->whereDoesntHave('higienePersonal', function ($q) {
            $q->where('fecha', '>=', now()->subHours(6));
        })->get();

        $areas = Area::all()->values();
        $turnos = $empleados->whereNotNull('turno')->pluck('turno')->unique()->values();

        return [
            'empleados' => $empleados,
            'areas' => $areas,
            'turnos' => $turnos,
        ];
    }

    public function registroRapido()
    {
        return Inertia::render('comunes/higienePersonal/registroRapido', $this->getRegistroRapidoData());
    }

    // PDF reescrito completamente
    public function pdf(Request $request)
    {
        try {
            $request->validate([
                'semana_inicio' => 'required|date',
                'turno' => 'required|string',
            ]);

            $semanaInicio = Carbon::parse($request->semana_inicio)->startOfDay();
            $semanaFin = $semanaInicio->copy()->endOfWeek(Carbon::SUNDAY)->endOfDay();
            $turno = $request->turno;

            // Obtener todos los registros de la semana para el turno dado (usando columna turno)
            $registros = HigienePersonal::with(['empleado', 'supervisor'])
                ->where('turno', $turno)
                ->whereBetween('fecha', [$semanaInicio, $semanaFin])
                ->get();

            if ($registros->isEmpty()) {
                return response()->json(['error' => 'No hay registros para el turno y semana seleccionados'], 404);
            }

            $registrosPorEmpleado = $registros->groupBy('empleado_id');

            $dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
            $datos = [];

            foreach ($registrosPorEmpleado as $empleadoId => $items) {
                $empleado = $items->first()->empleado;
                $fila = [
                    'empleado_nombre' => trim($empleado->name . ' ' . $empleado->apellido),
                    'empleado_codigo' => $empleado->codigo,
                    'registros_dia' => [],
                ];

                foreach ($dias as $dia) {
                    $fila['registros_dia'][$dia] = null;
                }

                foreach ($items as $reg) {
                    $nombreDia = Carbon::parse($reg->fecha)->locale('es')->isoFormat('dddd');
                    $nombreDia = ucfirst($nombreDia);
                    if (in_array($nombreDia, $dias)) {
                        $fila['registros_dia'][$nombreDia] = [
                            'conforme' => $reg->conforme,
                            'uniforme' => $reg->uniforme,
                            'limpieza' => $reg->limpieza,
                            'salud' => $reg->salud,
                            'lavado_manos' => $reg->lavado_manos,
                            'observaciones' => $reg->observaciones,
                            'correccion' => $reg->correccion,
                        ];
                    }
                }

                $datos[] = $fila;
            }

            $supervisoresMap = [];
            foreach ($registros as $reg) {
                $sup = $reg->supervisor;
                if ($sup && $sup->codigo) {
                    $codigo = $sup->codigo;
                    if (!isset($supervisoresMap[$codigo])) {
                        $supervisoresMap[$codigo] = [
                            'codigo' => $codigo,
                            'nombre' => trim(($sup->name ?? '') . ' ' . ($sup->apellido ?? '')),
                        ];
                    }
                }
            }
            $usuariosInvolucrados = array_values($supervisoresMap);

            return response()->json([
                'datos' => $datos,
                'dias' => $dias,
                'turno' => $turno,
                'semana_inicio' => $semanaInicio->format('d/m/Y'),
                'semana_fin' => $semanaFin->format('d/m/Y'),
                'usuarios_involucrados' => $usuariosInvolucrados,
            ]);
        } catch (\Exception $e) {
            Log::error('Error en pdf higiene personal: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}