<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Http\Controllers;

use App\Domain\ModulosComunes\HigienePersonal\Http\Requests\StoreDotacionGuanteRequest;
use App\Domain\ModulosComunes\HigienePersonal\Http\Requests\UpdateDotacionGuanteRequest;
use App\Http\Controllers\Controller;
use App\Domain\ModulosComunes\HigienePersonal\Services\DotacionGuanteService;
use App\Domain\ModulosComunes\HigienePersonal\Models\DotacionGuante;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DotacionGuanteController extends Controller
{
    protected DotacionGuanteService $service;

    public function __construct(DotacionGuanteService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {


        $query = DotacionGuante::with(['user', 'encargado', 'estado'])
            ->orderBy('tiempo', 'desc');

        if ($request->filled('filtro_fecha_desde')) {
            $query->whereDate('tiempo', '>=', $request->filtro_fecha_desde);
        }

        if ($request->filled('filtro_fecha_hasta')) {
            $query->whereDate('tiempo', '<=', $request->filtro_fecha_hasta);
        }

        if ($request->filled('filtro_empleado')) {
        $query->where('user_id', $request->filtro_empleado);
    }

        $perPage = $request->get('per_page', 10);
        $registros = $query->paginate($perPage);

        // Total de registros que tienen fecha de devolución (pendientes)

        $now = now(); // fecha y hora actual
        $totalPendientesDevolucion = DotacionGuante::whereNotNull('tiempo_devolucion')
            ->where('tiempo_devolucion', '<=', $now)
            ->count();


            // Usuarios con devoluciones vencidas (fecha de devolución ya pasó)
$usuariosPendientes = DotacionGuante::whereNotNull('tiempo_devolucion')
    ->where('tiempo_devolucion', '<=', $now)
    ->with('user:id,name,apellido,codigo')
    ->get()
    ->pluck('user')
    ->unique('id')
    ->values(); // Devuelve una colección de usuarios

        $ubicacionId = auth()->user()->ubicacion_id;

        $empleados = User::where('ubicacion_id', $ubicacionId)
            ->select('id', 'name', 'apellido', 'codigo', 'cargo', 'turno', 'area_id')
            ->get();

        return Inertia::render('comunes/guantes/index', [
            'registros' => $registros,
            'empleados' => $empleados,
            'filters'   => $request->only([
                'filtro_fecha_desde',
                'filtro_fecha_hasta',
                'filtro_empleado',
                'per_page',
            ]),
            'total_pendientes_devolucion' => $totalPendientesDevolucion,
            'usuarios_pendientes' => $usuariosPendientes,
            'flash' => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ]);
    }

    public function store(StoreDotacionGuanteRequest $request)
    {
        $encargado = auth()->user();

        try {
            $this->service->crearRegistro($request->validated(), $encargado);

            return redirect()->route('dotacion-guantes.index')
                ->with('success', 'Dotación de guantes registrada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al registrar la dotación: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function update(UpdateDotacionGuanteRequest $request, DotacionGuante $dotacionGuante)
    {
        try {
            $this->service->actualizarRegistro($dotacionGuante, $request->validated());

            return redirect()->route('dotacion-guantes.index')
                ->with('success', 'Dotación de guantes actualizada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al actualizar la dotación: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(DotacionGuante $dotacionGuante)
    {
        $dotacionGuante->delete();

        return redirect()->route('dotacion-guantes.index')
            ->with('success', 'Dotación de guantes eliminada exitosamente.');
    }



    public function devolver(Request $request, DotacionGuante $dotacionGuante)
{
    $estadoCompletado = Estado::where('nombre', 'Completado')->first();
    $dotacionGuante->update([
        'tiempo_devolucion' => null,
        'estado_id' => $estadoCompletado ? $estadoCompletado->id : null,
    ]);

    return redirect()->back()->with('success', 'Devolución registrada correctamente.');
}



public function pdf(Request $request)
{
    try {
        $query = DotacionGuante::with(['user', 'encargado', 'estado']);

        if ($request->filled('fecha_desde')) {
            $desde = Carbon::parse($request->fecha_desde)->startOfDay();
            $query->where('tiempo', '>=', $desde);
        }
        if ($request->filled('fecha_hasta')) {
            $hasta = Carbon::parse($request->fecha_hasta)->endOfDay();
            $query->where('tiempo', '<=', $hasta);
        }
        if ($request->filled('empleado_id')) {
            $query->where('user_id', $request->empleado_id);
        }

        $registros = $query->orderBy('tiempo', 'asc')->get();

        if ($registros->isEmpty()) {
            return response()->json(['error' => 'No hay registros para los filtros seleccionados'], 404);
        }

        // Agrupar por usuario
        $usuarios = [];
        $fechasSet = [];

        foreach ($registros as $r) {
            $userId = $r->user_id;
            $fechaKey = $r->tiempo->format('Y-m-d');
            $fechasSet[$fechaKey] = $fechaKey; // para colección de fechas

            if (!isset($usuarios[$userId])) {
                $usuarios[$userId] = [
                    'id' => $r->user->id,
                    'codigo' => $r->user->codigo ?? '',
                    'nombre' => $r->user->name . ' ' . $r->user->apellido,
                    'dotaciones' => []
                ];
            }

            // Resumen de colores
            $colores = [];
            if ($r->amarillo_naranja) $colores[] = 'A/R';
            if ($r->azul) $colores[] = 'Azul';
            if ($r->naranja) $colores[] = 'Naranja';
            if ($r->alta_temperatura) $colores[] = 'A.T.';
            $colorStr = implode(', ', $colores) ?: '—';

            $estado = $r->estado ? $r->estado->name : ($r->tiempo_devolucion ? 'Pendiente' : 'Completado');

            // Guardar en la fecha correspondiente
            $usuarios[$userId]['dotaciones'][$fechaKey] = [
                'fecha' => $r->tiempo->format('d/m/Y'),
                'hora' => $r->tiempo->format('H:i'),
                'tipo' => $r->tipo,
                'colores' => $colorStr,
                'devolucion' => $r->tiempo_devolucion ? Carbon::parse($r->tiempo_devolucion)->format('d/m/Y') : null,
                'estado' => $estado,
            ];
        }

        // Ordenar fechas
        $fechas = array_keys($fechasSet);
        sort($fechas);

        // Recolectar encargados (usuarios involucrados)
        $encargadosMap = [];
        foreach ($registros as $r) {
            if ($r->encargado && $r->encargado->codigo) {
                $codigo = $r->encargado->codigo;
                if (!isset($encargadosMap[$codigo])) {
                    $encargadosMap[$codigo] = [
                        'codigo' => $codigo,
                        'nombre' => trim(($r->encargado->name ?? '') . ' ' . ($r->encargado->apellido ?? '')),
                    ];
                }
            }
        }
        $usuariosInvolucrados = array_values($encargadosMap);

        // Convertir usuarios a array indexado
        $usuariosList = array_values($usuarios);

        return response()->json([
            'usuarios' => $usuariosList,
            'fechas' => $fechas,
            'usuarios_involucrados' => $usuariosInvolucrados,
            'filtros' => [
                'fecha_desde' => $request->fecha_desde,
                'fecha_hasta' => $request->fecha_hasta,
                'empleado_id' => $request->empleado_id,
            ]
        ]);
    } catch (\Exception $e) {
        Log::error('Error en pdf dotacion guantes: ' . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}
