<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\Infraestructura;
use App\Domain\PlantaLacteos\Models\InspeccionInfraestructura;
use App\Domain\PlantaLacteos\Services\InspeccionInfraestructuraService;
use App\Domain\Sistema\Configuracion\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InspeccionInfraestructuraController extends Controller
{
    protected $service;

    public function __construct(InspeccionInfraestructuraService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        /** @var User|null $user */
        $user = Auth::user();
        $filters = $request->only(['infraestructura_id', 'user_id', 'fecha_desde', 'fecha_hasta', 'per_page']);

        $query = InspeccionInfraestructura::with(['infraestructura', 'usuario'])
            ->filter($filters)
            ->orderBy('fecha', 'desc');


        $query->where('ubicacion_id', $user->ubicacion_id);


        $inspecciones = $query->paginate($request->get('per_page', 10))->withQueryString();

        $infraestructuras = Infraestructura::where('activo', true)->where('ubicacion_id', $user->ubicacion_id)->get();
        $usuarios = User::all();

        return Inertia::render('planta_lacteos/inspecciones/index', [
            'inspecciones' => $inspecciones,
            'filters' => $filters,
            'infraestructuras' => $infraestructuras,
            'usuarios' => $usuarios,
            'flash' => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function create()
    {
        /** @var User|null $user */
        $user = Auth::user();
        $infraestructuras = Infraestructura::where('activo', true)
            ->where('ubicacion_id', $user->ubicacion_id)
            ->with('inspecciones')
            ->get();

        return Inertia::render('planta_lacteos/inspecciones/crear', [
            'infraestructuras' => $infraestructuras,
        ]);
    }

    public function masivo()
    {
        /** @var User|null $user */
        $user = Auth::user();
        $infraestructuras = Infraestructura::where('activo', true)
            ->where('ubicacion_id', $user->ubicacion_id)
            ->get();

        return Inertia::render('planta_lacteos/inspecciones/masivo', [
            'infraestructuras' => $infraestructuras,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'infraestructura_id' => 'required|exists:infraestructuras,id',
            'fecha' => 'nullable|date', // si no se envía se usa now en el servicio
            'maquina_equipo_ok' => 'nullable|boolean',
            'maquina_equipo_observacion' => 'nullable|string',
            'extra_ok' => 'nullable|boolean',
            'extra_observacion' => 'nullable|string',
            'observacion_general' => 'nullable|string',
            // Criterios dinámicos: se validarán en el servicio según el área
            // Acciones
            'acciones' => 'nullable|array',
            'acciones.*.criterio' => 'required|string',
            'acciones.*.descripcion' => 'required|string',
            'acciones.*.tipo_accion' => 'nullable|string',
            'acciones.*.responsable' => 'nullable|string',
            'acciones.*.fecha_ejecucion' => 'nullable|date',
            'acciones.*.estado' => 'nullable|string',
            'acciones.*.referencia' => 'nullable|string',
            'acciones.*.observaciones' => 'nullable|string',
        ]);

        // El servicio se encarga de validar que infraestructura pertenezca a la ubicación del usuario
        $this->service->crearInspeccionConAcciones($validated);
        return redirect()->route('inspecciones.index')->with('success', 'Inspección registrada.');
    }

    public function show(InspeccionInfraestructura $inspeccione)
    {
        $inspeccione->load(['infraestructura', 'usuario', 'acciones']);
        return Inertia::render('planta_lacteos/inspecciones/show', [
            'inspeccion' => $inspeccione,
        ]);
    }

    public function destroy(InspeccionInfraestructura $inspeccione)
    {
        $this->service->deleteInspeccion($inspeccione);
        return redirect()->route('inspecciones.index')->with('success', 'Inspección eliminada.');
    }

    public function storeMasivo(Request $request)
    {
        $validated = $request->validate([
            'infraestructuras' => 'nullable|array|min:1',
            'infraestructuras.*' => 'nullable|integer|exists:infraestructuras,id',
            'fecha' => 'nullable|date',
            'observacion_general' => 'nullable|string',
            'criterios' => 'nullable|array',
            'criterios.*.criterio' => 'required|string',
            'criterios.*.ok' => 'nullable|boolean',
            'criterios.*.observacion' => 'nullable|string',
            'acciones' => 'nullable|array',
            'acciones.*.criterio' => 'required|string',
            'acciones.*.descripcion' => 'required|string',
            'acciones.*.tipo_accion' => 'nullable|string',
            'acciones.*.responsable' => 'nullable|string',
            'acciones.*.fecha_ejecucion' => 'nullable|date',
            'acciones.*.estado' => 'nullable|string',
            'acciones.*.referencia' => 'nullable|string',
            'acciones.*.observaciones' => 'nullable|string',
            'areas' => 'nullable|array',
            'areas.*.infraestructura_id' => 'required|integer|exists:infraestructuras,id',
            'areas.*.fecha' => 'nullable|date',
            'areas.*.observacion_general' => 'nullable|string',
            'areas.*.criterios' => 'nullable|array',
            'areas.*.criterios.*.criterio' => 'required|string',
            'areas.*.criterios.*.ok' => 'nullable|boolean',
            'areas.*.criterios.*.observacion' => 'nullable|string',
            'areas.*.acciones' => 'nullable|array',
            'areas.*.acciones.*.criterio' => 'required|string',
            'areas.*.acciones.*.descripcion' => 'required|string',
            'areas.*.acciones.*.tipo_accion' => 'nullable|string',
            'areas.*.acciones.*.responsable' => 'nullable|string',
            'areas.*.acciones.*.fecha_ejecucion' => 'nullable|date',
            'areas.*.acciones.*.estado' => 'nullable|string',
            'areas.*.acciones.*.referencia' => 'nullable|string',
            'areas.*.acciones.*.observaciones' => 'nullable|string',
        ]);

        $areas = $validated['areas'] ?? null;

        if (is_array($areas) && !empty($areas)) {
            foreach ($areas as $areaData) {
                $infra = Infraestructura::find($areaData['infraestructura_id']);
                if (!$infra) {
                    continue;
                }

                $data = [
                    'infraestructura_id' => $areaData['infraestructura_id'],
                    'fecha' => $areaData['fecha'] ?? $validated['fecha'] ?? now(),
                    'observacion_general' => $areaData['observacion_general'] ?? $validated['observacion_general'] ?? null,
                    'criterios' => $areaData['criterios'] ?? [],
                    'acciones' => $areaData['acciones'] ?? [],
                ];

                $this->service->crearInspeccionConAcciones($data);
            }
        } else {
            $baseData = [
                'fecha' => $validated['fecha'] ?? now(),
                'observacion_general' => $validated['observacion_general'] ?? null,
                'criterios' => $validated['criterios'] ?? [],
                'acciones' => $validated['acciones'] ?? [],
            ];

            foreach ($validated['infraestructuras'] ?? [] as $infraId) {
                $infra = Infraestructura::find($infraId);
                if (!$infra) {
                    continue;
                }

                $data = array_merge($baseData, [
                    'infraestructura_id' => $infraId,
                ]);

                $this->service->crearInspeccionConAcciones($data);
            }
        }

        return redirect()->route('inspecciones.index')->with('success', 'Inspecciones creadas correctamente.');
    }

    public function pdf(Request $request)
    {
        try {
            $user = auth()->user();
            $isAdmin = $user->hasRole('admin');
            $ubicacionId = $user->ubicacion_id;

            $query = InspeccionInfraestructura::with([
                'infraestructura.ubicacion',
                'usuario',
                'acciones'
            ]);

            // Filtros de fecha
            if ($request->filled('fecha_desde')) {
                $fechaDesde = Carbon::parse($request->fecha_desde)->startOfDay();
                $query->where('fecha', '>=', $fechaDesde);
            }
            if ($request->filled('fecha_hasta')) {
                $fechaHasta = Carbon::parse($request->fecha_hasta)->endOfDay();
                $query->where('fecha', '<=', $fechaHasta);
            }

            // Filtrar por infraestructura si se especifica
            if ($request->filled('infraestructura_id')) {
                $query->where('infraestructura_id', $request->infraestructura_id);
            }

            // Filtrar por ubicación si no es admin
            if (!$isAdmin && $ubicacionId) {
                $query->where('ubicacion_id', $ubicacionId);
            }

            $inspecciones = $query->orderBy('fecha', 'asc')->get();

            // Recolectar usuarios involucrados
            $usuariosMap = [];
            foreach ($inspecciones as $inspeccion) {
                if ($inspeccion->usuario && $inspeccion->usuario->codigo) {
                    $codigo = $inspeccion->usuario->codigo;
                    if (!isset($usuariosMap[$codigo])) {
                        $usuariosMap[$codigo] = [
                            'codigo' => $codigo,
                            'nombre' => trim(($inspeccion->usuario->name ?? '') . ' ' . ($inspeccion->usuario->apellido ?? '')),
                        ];
                    }
                }

                // También recolectar responsables de acciones
                foreach ($inspeccion->acciones as $accion) {
                    if ($accion->responsable) {
                        $responsable = $accion->responsable;
                        if (!isset($usuariosMap[$responsable])) {
                            $usuariosMap[$responsable] = [
                                'codigo' => $responsable,
                                'nombre' => $responsable,
                            ];
                        }
                    }
                }
            }

            $usuariosInvolucrados = array_values($usuariosMap);

            // Preparar datos para el PDF
            $datosPdf = $inspecciones->map(function ($inspeccion) {
                return [
                    'id' => $inspeccion->id,
                    'fecha' => $inspeccion->fecha,
                    'infraestructura' => $inspeccion->infraestructura?->nombre ?? '-',
                    'nivel' => $inspeccion->infraestructura?->nivel ?? '-',
                    'ubicacion' => $inspeccion->infraestructura?->ubicacion?->nombre ?? $inspeccion->ubicacion?->nombre ?? '-',
                    'usuario' => trim(($inspeccion->usuario?->name ?? '') . ' ' . ($inspeccion->usuario?->apellido ?? '')),
                    'codigo_usuario' => $inspeccion->usuario?->codigo ?? '',
                    'observacion_general' => $inspeccion->observacion_general ?? '-',
                    'criterios' => $this->obtenerCriteriosEvaluados($inspeccion),
                    'acciones' => $inspeccion->acciones->map(function ($accion) {
                        return [
                            'criterio' => $accion->criterio,
                            'descripcion' => $accion->descripcion,
                            'tipo_accion' => $accion->tipo_accion,
                            'responsable' => $accion->responsable,
                            'fecha_ejecucion' => $accion->fecha_ejecucion,
                            'estado' => $accion->estado,
                            'referencia' => $accion->referencia,
                            'observaciones' => $accion->observaciones,
                        ];
                    })->toArray(),
                ];
            });

            return response()->json([
                'inspecciones' => $datosPdf,
                'usuarios_involucrados' => $usuariosInvolucrados,
                'filtros' => [
                    'fecha_desde' => $request->fecha_desde,
                    'fecha_hasta' => $request->fecha_hasta,
                    'infraestructura_id' => $request->infraestructura_id,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function obtenerCriteriosEvaluados($inspeccion, $acciones = null)
    {
        $criterios = [];
        $campos = [
            'pisos' => 'Pisos',
            'paredes' => 'Paredes',
            'techos' => 'Techos',
            'puertas' => 'Puertas',
            'ventanas' => 'Ventanas',
            'drenajes' => 'Drenajes',
            'iluminacion' => 'Iluminación',
            'ventilacion' => 'Ventilación',
            'lavamanos' => 'Lavamanos',
            'servicios_sanitarios' => 'Servicios Sanitarios',
            'almacenamiento' => 'Almacenamiento',
            'senalizacion' => 'Señalización',
            'maquina_equipo' => 'Máquina/Equipo',
            'extra' => 'Extra',
        ];

        foreach ($campos as $campo => $etiqueta) {
            $campoOk = $campo . '_ok';
            if ($inspeccion->$campoOk !== null) {
                $tieneAccion = false;
                if ($acciones) {
                    $tieneAccion = $acciones->contains(function ($accion) use ($etiqueta, $campo) {
                        return $accion->criterio === $etiqueta || $accion->criterio === $campo;
                    });
                }
                $criterios[] = [
                    'nombre' => $etiqueta,
                    'ok' => (bool) $inspeccion->$campoOk,
                    'observacion' => $inspeccion->{$campo . '_observacion'} ?? '',
                    'tiene_accion' => $tieneAccion,
                ];
            }
        }

        return $criterios;
    }
}
