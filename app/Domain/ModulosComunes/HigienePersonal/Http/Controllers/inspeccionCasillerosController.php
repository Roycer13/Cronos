<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Http\Controllers;

use App\Domain\ModulosComunes\HigienePersonal\Models\InspeccionCasillero;
use App\Domain\ModulosComunes\HigienePersonal\Services\InspeccionCasilleroService;
use App\Domain\ModulosComunes\HigienePersonal\Http\Requests\StoreInspeccionCasilleroRequest;
use App\Domain\ModulosComunes\HigienePersonal\Http\Requests\UpdateInspeccionCasilleroRequest;
use App\Domain\Sistema\Configuracion\Models\Area;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class inspeccionCasillerosController extends Controller
{
    protected InspeccionCasilleroService $service;

    public function __construct(InspeccionCasilleroService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $ubicacionId = $user->ubicacion_id;

        $query = InspeccionCasillero::porUbicacion($ubicacionId)
            ->with(['user', 'inspector1', 'inspector2', 'inspector3', 'ubicacion'])
            ->orderBy('fecha', 'desc');

        // Filtro por fechas
        if ($request->filled('filtro_fecha_desde')) {
            $query->whereDate('fecha', '>=', $request->filtro_fecha_desde);
        }
        if ($request->filled('filtro_fecha_hasta')) {
            $query->whereDate('fecha', '<=', $request->filtro_fecha_hasta);
        }

        // Filtro por empleado (user_id)
        if ($request->filled('filtro_empleado')) {
            $query->where('user_id', $request->filtro_empleado);
        }

        // Filtro por conformidad (calculado en base a los tres booleanos)
        if ($request->has('filtro_conforme') && $request->filtro_conforme !== '') {
            $conforme = filter_var($request->filtro_conforme, FILTER_VALIDATE_BOOLEAN);
            if ($conforme) {
                $query->where('orden', true)
                    ->where('limpieza', true)
                    ->where('implementos_aseo', true);
            } else {
                $query->where(function ($q) {
                    $q->where('orden', false)
                        ->orWhere('limpieza', false)
                        ->orWhere('implementos_aseo', false);
                });
            }
        }

        // Filtro por inspector
        if ($request->filled('filtro_inspector')) {
            $query->where(function ($q) use ($request) {
                $q->where('inspector1_id', $request->filtro_inspector)
                    ->orWhere('inspector2_id', $request->filtro_inspector)
                    ->orWhere('inspector3_id', $request->filtro_inspector);
            });
        }

        $perPage = $request->get('per_page', 10);
        $registros = $query->paginate($perPage);

        // Opcional: lista de empleados e inspectores para los filtros del frontend
        $empleados = \App\Domain\Sistema\Configuracion\Models\User::where('ubicacion_id', $ubicacionId)
            ->orderBy('name')
            ->get(['id', 'name', 'apellido']);

        $inspectores = \App\Domain\Sistema\Configuracion\Models\User::where('ubicacion_id', $ubicacionId)
            ->whereHas('roles', fn($q) => $q->whereIn('name', ['inspector', 'admin']))
            ->orderBy('name')
            ->get(['id', 'name', 'apellido']);
        $turnos = \App\Domain\Sistema\Configuracion\Models\User::where('ubicacion_id', $ubicacionId)
            ->whereNotNull('turno')
            ->distinct()
            ->pluck('turno')
            ->values();

        return Inertia::render('comunes/inspeccionCasilleros/index', [
            'registros'   => $registros,
            'empleados'   => $empleados,
            'inspectores' => $inspectores,
            'turnos'      => $turnos,
            'filters'     => $request->only([
                'filtro_fecha_desde',
                'filtro_fecha_hasta',
                'filtro_empleado',
                'filtro_conforme',
                'filtro_inspector',
                'per_page',
            ]),
            'flash' => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ]);
    }

    public function store(StoreInspeccionCasilleroRequest $request)
    {
        $supervisor = auth()->user();
        // dd($request->validated());

        try {
            $this->service->crearRegistro($request->validated(), $supervisor);

            return redirect()->back()
                ->with('success', 'Registro guardado exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al registrar la inspección: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function update(UpdateInspeccionCasilleroRequest $request, InspeccionCasillero $inspeccionCasillero)
    {

        $user = auth()->user();

        if ($inspeccionCasillero->ubicacion_id !== $user->ubicacion_id) {
            abort(403, 'No autorizado.');
        }

        try {
            $this->service->actualizarRegistro($inspeccionCasillero, $request->validated());
            return redirect()->route('inspeccion-casilleros.index')
                ->with('success', 'Inspección actualizada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al actualizar la inspección: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(InspeccionCasillero $inspeccionCasillero)
    {
        $user = auth()->user();

        if ($inspeccionCasillero->ubicacion_id !== $user->ubicacion_id) {
            abort(403, 'No autorizado.');
        }

        $this->service->eliminarRegistro($inspeccionCasillero);

        return redirect()->route('inspeccion-casilleros.index')
            ->with('success', 'Inspección eliminada exitosamente.');
    }
    public function registroRapido()
    {
        $user = auth()->user();
        $ubicacionId = $user->ubicacion_id;

        $query = User::with(['area'])
            ->select('id', 'name', 'apellido', 'codigo', 'cargo', 'turno', 'area_id', 'ubicacion_id')
            ->orderBy('name');
        $empleados = $query->whereDoesntHave('inspeccionCasillero', function ($q) {
            $q->where('fecha', '>=', now()->subDays(24));
        })->get();

        $inspectores = User::orderBy('name')
            ->get(['id', 'name', 'apellido']);

        $areas = Area::where('ubicacion_id', $ubicacionId)->get(['id', 'nombre']);

        $turnos = $empleados->whereNotNull('turno')->pluck('turno')->unique()->values();
        return Inertia::render('comunes/inspeccionCasilleros/registro-rapido', [
            'empleados' => $empleados,
            'inspectores' => $inspectores,
            'areas' => $areas,
            'turnos' => $turnos,
        ]);
    }
    public function pdf(Request $request)
    {
        $fechaDesde = $request->input('fecha_desde');
        $fechaHasta = $request->input('fecha_hasta');

        if (!$fechaDesde || !$fechaHasta) {
            return response()->json(['error' => 'Se requieren ambas fechas'], 400);
        }

        $inicio = Carbon::parse($fechaDesde)->startOfDay();
        $fin = Carbon::parse($fechaHasta)->endOfDay();

        $query = InspeccionCasillero::with(['user', 'inspector1', 'inspector2', 'inspector3'])
            ->whereBetween('fecha', [$inicio, $fin])
            ->orderBy('fecha');

        // Filtro por ubicación del usuario autenticado (si no es admin)
        $user = auth()->user();
        if (!$user->hasRole('admin')) {
            $query->where('ubicacion_id', $user->ubicacion_id);
        }

        $inspecciones = $query->get();

        // Construir datos planos para la tabla
        $datos = $inspecciones->map(function ($inspeccion) {
            $inspectores = collect([$inspeccion->inspector1, $inspeccion->inspector2, $inspeccion->inspector3])
                ->filter()
                ->map(fn($u) => $u->codigo ?? $u->id)
                ->join(', ');

            return [
                'empleado' => trim($inspeccion->user->name . ' ' . $inspeccion->user->apellido),
                'fecha' => $inspeccion->fecha->format('d/m/Y'),
                'orden' => $inspeccion->orden ? 'C' : 'N',
                'limpieza' => $inspeccion->limpieza ? 'C' : 'N',
                'implementos_aseo' => $inspeccion->implementos_aseo ? 'C' : 'N',
                'inspectores' => $inspectores ?: '—',
                'observacion' => $inspeccion->observacion ?: '—',
                'correccion' => $inspeccion->correcion ?: '—',
            ];
        });

        // Recolectar inspectores involucrados para la firma (opcional)
        $usuariosInvolucrados = [];
        foreach ($inspecciones as $inspeccion) {
            foreach (['inspector1', 'inspector2', 'inspector3'] as $rel) {
                if ($inspeccion->$rel) {
                    $codigo = $inspeccion->$rel->codigo ?? $inspeccion->$rel->id;
                    $nombre = trim($inspeccion->$rel->name . ' ' . $inspeccion->$rel->apellido);
                    if (!isset($usuariosInvolucrados[$codigo])) {
                        $usuariosInvolucrados[$codigo] = [
                            'codigo' => $codigo,
                            'nombre' => $nombre,
                        ];
                    }
                }
            }
        }

        return response()->json([
            'datos' => $datos,
            'fecha_desde' => $fechaDesde,
            'fecha_hasta' => $fechaHasta,
            'usuarios_involucrados' => array_values($usuariosInvolucrados),
        ]);
    }
}
