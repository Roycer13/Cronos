<?php

namespace App\Domain\ModulosComunes\Old\Http\Controllers;

use App\Domain\ModulosComunes\Old\Http\Requests\ReporteRegistroRequest as RequestsReporteRegistroRequest;
use App\Domain\ModulosComunes\Old\Http\Requests\StoreOldRegistroRequest;
use App\Domain\ModulosComunes\Old\Models\OldItem;
use App\Domain\ModulosComunes\Old\Models\OldRegistro;
use App\Domain\ModulosComunes\Old\Services\OldRegistroService;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReporteRegistroRequest;
use Carbon\Carbon;

class OldRegistroController extends Controller
{
    protected $service;

    public function __construct(OldRegistroService $service)
    {
        $this->service = $service;
    }

    private function obtenerEtiquetaFrecuencia(OldItem $item): string
    {
        if ($item->anual) {
            return 'Cada 1 año';
        }
        if ($item->semestral) {
            return 'Cada 6 meses';
        }
        if ($item->trimestral) {
            return 'Cada 3 meses';
        }
        if ($item->bimensual) {
            return 'Cada 2 meses';
        }
        if ($item->mensual) {
            return 'Cada 30 días';
        }
        if ($item->quincenal) {
            return 'Cada 15 días';
        }
        return 'Sin prioridad';
    }

    private function buildReporteResumidoPayload(Request $request, Carbon $fechaDesde, Carbon $fechaHasta): array
    {
        $areaId = $request->area_id;
        $subareaId = $request->subarea_id;
        $turnoFiltro = $request->turno;
        $nivel = $request->nivel;

        $itemsQuery = OldItem::with('subarea.area');
        if ($subareaId) {
            $itemsQuery->where('old_subarea_id', $subareaId);
        } elseif ($areaId) {
            $itemsQuery->whereHas('subarea', fn($q) => $q->where('old_area_id', $areaId));
        }

        $items = $itemsQuery->get();
        $turnos = $turnoFiltro ? [$turnoFiltro] : [1, 2, 3];
        $map = ['Mon' => 'lun', 'Tue' => 'mar', 'Wed' => 'mie', 'Thu' => 'jue', 'Fri' => 'vie', 'Sat' => 'sab', 'Sun' => 'dom'];

        $areasAgrupadas = [];
        $totales = ['esperadas' => 0, 'realizadas' => 0, 'incumplidas' => 0, 'no_incumplimientos' => 0];
        $gruposPrioridad = [];

        // Generar todas las fechas del rango
        $fechas = collect();
        $cursor = $fechaDesde->copy();
        while ($cursor->lte($fechaHasta)) {
            $fechas->push($cursor->copy());
            $cursor->addDay();
        }

        foreach ($items as $item) {
            $areaNombre = $item->subarea->area->nombre ?? 'Sin área';
            $subareaNombre = $item->subarea->nombre ?? 'Sin subárea';
            $areaIdDb = $item->subarea->area->id ?? 0;
            $subareaIdDb = $item->subarea->id ?? 0;
            $frecuencia = $this->obtenerEtiquetaFrecuencia($item);

            if (!isset($areasAgrupadas[$areaIdDb])) {
                $areasAgrupadas[$areaIdDb] = ['nombre' => $areaNombre, 'subareas' => []];
            }
            if (!isset($areasAgrupadas[$areaIdDb]['subareas'][$subareaIdDb])) {
                $areasAgrupadas[$areaIdDb]['subareas'][$subareaIdDb] = ['nombre' => $subareaNombre, 'items' => []];
            }

            // --- NUEVA ESTRUCTURA: dias ---
            $diasDelItem = [];
            $itemEsperadas = 0;
            $itemRealizadas = 0;
            $itemIncumplidas = 0;
            $itemCumplio = true; // se recalcula por día

            foreach ($fechas as $fecha) {
                $prefijoDia = $map[$fecha->format('D')] ?? null;
                if (!$prefijoDia) {
                    continue;
                }

                // Armar turnos para este día específico
                $turnosDelDia = [];
                $diaCumplio = true;

                foreach ($turnos as $t) {
                    $esperado = [
                        'orden' => (bool)($item->{$prefijoDia . '_' . $t . '_o'} ?? false),
                        'limpieza' => (bool)($item->{$prefijoDia . '_' . $t . '_l'} ?? false),
                        'desinfeccion' => (bool)($item->{$prefijoDia . '_' . $t . '_d'} ?? false),
                    ];

                    // Si no espera nada, no guardamos el turno (se mostrará como vacío)
                    if (!$esperado['orden'] && !$esperado['limpieza'] && !$esperado['desinfeccion']) {
                        continue;
                    }

                    // Obtener registros de este día junto con los responsables
                    $registros = OldRegistro::with([
                        'usuario:id,name,apellido,codigo',
                        'revisor:id,name,apellido,codigo',
                    ])->where('old_item_id', $item->id)
                        ->whereDate('tiempo_realizado', $fecha->toDateString())
                        ->get();

                    $registrosLimpieza = $registros->where('limpieza', true);
                    $datosUsuario = static function ($usuario): ?array {
                        if (!$usuario) {
                            return null;
                        }

                        $nombre = trim($usuario->name . ' ' . ($usuario->apellido ?? ''));

                        return $nombre ? [
                            'codigo' => $usuario->codigo ?? (string) $usuario->id,
                            'nombre' => $nombre,
                        ] : null;
                    };
                    $responsablesLimpieza = $registrosLimpieza->map(fn ($registro) => $datosUsuario($registro->usuario))
                        ->filter()
                        ->unique('codigo')
                        ->values()
                        ->all();
                    $supervisores = $registrosLimpieza->map(fn ($registro) => $datosUsuario($registro->revisor))
                        ->filter()
                        ->unique('codigo')
                        ->values()
                        ->all();

                    $realizado = ['orden' => false, 'limpieza' => false, 'desinfeccion' => false];
                    foreach ($registros as $reg) {
                        if ($reg->orden) $realizado['orden'] = true;
                        if ($reg->limpieza) $realizado['limpieza'] = true;
                        if ($reg->desinfeccion) $realizado['desinfeccion'] = true;
                    }

                    // Calcular incumplimientos de este turno
                    $actEsperadas = ($esperado['orden'] ? 1 : 0) + ($esperado['limpieza'] ? 1 : 0) + ($esperado['desinfeccion'] ? 1 : 0);
                    $actRealizadas = ($realizado['orden'] ? 1 : 0) + ($realizado['limpieza'] ? 1 : 0) + ($realizado['desinfeccion'] ? 1 : 0);
                    $actIncumplidas = max($actEsperadas - $actRealizadas, 0);

                    // Sumar a totales del día
                    $itemEsperadas += $actEsperadas;
                    $itemRealizadas += $actRealizadas;
                    $itemIncumplidas += $actIncumplidas;
                    $totales['esperadas'] += $actEsperadas;
                    $totales['realizadas'] += $actRealizadas;
                    $totales['incumplidas'] += $actIncumplidas;

                    // Si hay incumplimiento, el día no cumple
                    if ($actIncumplidas > 0) {
                        $diaCumplio = false;
                    }

                    $turnosDelDia[$t] = [
                        'esperado' => $esperado,
                        'realizado' => $realizado,
                    ];
                }

                // Solo agregar el día si tiene al menos un turno esperado
                if (!empty($turnosDelDia)) {
                    $diasDelItem[] = [
                        'fecha' => $fecha->toDateString(),
                        'turnos' => $turnosDelDia,
                        'cumplio' => $diaCumplio,
                        'responsables_limpieza' => $responsablesLimpieza,
                        'supervisores' => $supervisores,
                    ];
                }
            } // fin foreach fechas

            // Si el item no tiene días, no lo agregamos (o podríamos agregarlo con días vacíos)
            if (empty($diasDelItem)) {
                continue;
            }

            // Calcular no incumplimientos del item (global)
            $noIncumplimientos = max($itemEsperadas - $itemIncumplidas, 0);
            $totales['no_incumplimientos'] += $noIncumplimientos;

            // Agregar item con sus días
            $areasAgrupadas[$areaIdDb]['subareas'][$subareaIdDb]['items'][] = [
                'id' => $item->id,
                'nombre' => $item->nombre,
                'frecuencia' => $frecuencia,
                'dias' => $diasDelItem,  // <--- NUEVO: array de días
                'cumplio' => $itemCumplio, // Se podría recalcular globalmente, pero lo dejamos por compatibilidad
                'esperadas' => $itemEsperadas,
                'realizadas' => $itemRealizadas,
                'incumplidas' => $itemIncumplidas,
                'no_incumplimientos' => $noIncumplimientos,
            ];

            $gruposPrioridad[$frecuencia] ??= [];
            $gruposPrioridad[$frecuencia][] = [
                'id' => $item->id,
                'nombre' => $item->nombre,
                'esperadas' => $itemEsperadas,
                'realizadas' => $itemRealizadas,
                'incumplidas' => $itemIncumplidas,
                'no_incumplimientos' => $noIncumplimientos,
            ];
        } // fin foreach items

        $areasParaVista = array_map(function ($area) {
            $area['subareas'] = array_values($area['subareas']);
            return $area;
        }, array_values($areasAgrupadas));

        $porcentaje = $totales['esperadas'] > 0
            ? round(($totales['realizadas'] / $totales['esperadas']) * 100, 2)
            : 0;

        $prioridadesParaVista = collect($gruposPrioridad)->map(function ($items, $nombre) {
            return ['nombre' => $nombre, 'items' => $items];
        })->values()->all();

        return [
            'areas' => $areasParaVista,
            'totales' => $totales,
            'porcentaje' => $porcentaje,
            'fecha' => $fechaHasta->toDateString(),
            'fecha_desde' => $fechaDesde->toDateString(),
            'fecha_hasta' => $fechaHasta->toDateString(),
            'filtros' => $request->only('area_id', 'subarea_id', 'turno', 'nivel'),
            'gruposPrioridad' => $prioridadesParaVista,
            'listaAreas' => \App\Domain\ModulosComunes\Old\Models\OldArea::select('id', 'nombre')->get(),
            'listaSubareas' => \App\Domain\ModulosComunes\Old\Models\OldSubarea::select('id', 'nombre', 'old_area_id')->get(),
        ];
    }

    /**
     * 📋 LISTADO + FILTROS
     */
    public function index(Request $request)
    {
        $query = OldRegistro::with(['item.subarea.area', 'usuario', 'revisor'])
            ->latest();

        $query = $this->service->aplicarFiltros($query, $request->all());

        return Inertia::render('comunes/old/registros/index', [
            'registros' => $query->paginate(20)->withQueryString(),
            'items'     => OldItem::select('id', 'nombre')->get(),
            'users'     => User::select('id', 'name')->get(),
            'filtros'   => $request->all(),
        ]);
    }
    /**
     * ➕ FORM CREATE
     */
    public function create()
    {
        return Inertia::render('comunes/old/registros/create', [
            'areas' => \App\Domain\ModulosComunes\Old\Models\OldArea::select('id', 'nombre')->get(),
            'subareas' => \App\Domain\ModulosComunes\Old\Models\OldSubarea::select('id', 'nombre', 'old_area_id')->get(),
            'users' => User::select('id', 'name', 'apellido')->get(),
            'authUser' => auth()->user(),
        ]);
    }

    /**
     * 💾 GUARDAR
     */
    public function store(StoreOldRegistroRequest $request)
    {
        $data = $request->validated();

        // Validar que responsable de limpieza y supervisor sean diferentes
        if ($data['user_id'] == $data['revisor_id']) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'user_id' => 'El Responsable de Limpieza y el Supervisor deben ser diferentes.',
            ]);
        }

        $tiempo = $data['tiempo_realizado'];
        if ($tiempo) {
            $tiempo = Carbon::parse($tiempo)->format('Y-m-d H:i:s');
        } else {
            $tiempo = now();
        }

        foreach ($data['registros'] as $r) {
            OldRegistro::create([
                'old_item_id'       => $r['old_item_id'],
                'orden'             => $r['orden'] ?? false,
                'limpieza'          => $r['limpieza'] ?? false,
                'desinfeccion'      => $r['desinfeccion'] ?? false,
                'observacion'       => $r['observacion'] ?? null,
                'correcion'         => $r['correcion'] ?? null,
                'user_id'           => $data['user_id'],
                'revisor_id'        => $data['revisor_id'],
                'tiempo_realizado'  => $tiempo,
            ]);
        }

        return redirect()->route('old-registros.index')
            ->with('success', 'Registros guardados');
    }

    /**
     * 📊 REPORTE
     */
    public function reporte(RequestsReporteRegistroRequest $request)
    {
        $fechaDesde = $request->fecha_desde
            ? \Carbon\Carbon::parse($request->fecha_desde)->startOfDay()
            : now()->startOfDay();  // antes: now()->subMonth()->startOfDay()

        $fechaHasta = $request->fecha_hasta
            ? \Carbon\Carbon::parse($request->fecha_hasta)->endOfDay()
            : now()->endOfDay();

        $areaId    = $request->area_id;
        $subareaId = $request->subarea_id;
        $turnoFiltro = $request->turno; // null = todos

        // Obtener ítems según filtros de área/subárea
        $itemsQuery = OldItem::with('subarea.area');

        if ($subareaId) {
            $itemsQuery->where('old_subarea_id', $subareaId);
        } elseif ($areaId) {
            $itemsQuery->whereHas('subarea', function ($q) use ($areaId) {
                $q->where('old_area_id', $areaId);
            });
        }

        $items = $itemsQuery->get();

        // Mapeo días de la semana inglés -> prefijo BD
        $diasMap = ['Mon' => 'lun', 'Tue' => 'mar', 'Wed' => 'mie', 'Thu' => 'jue', 'Fri' => 'vie', 'Sat' => 'sab', 'Sun' => 'dom'];

        // Generar días del período
        $periodo = \Carbon\CarbonPeriod::create($fechaDesde, $fechaHasta);
        $resultado = [];
        $totales = [
            'actividades_esperadas' => 0,
            'actividades_cumplidas' => 0,
            'actividades_incumplidas' => 0,
            'actividades_parciales' => 0,
        ];

        foreach ($periodo as $fecha) {
            $diaSemanaIngles = $fecha->format('D');
            $prefijoDia = $diasMap[$diaSemanaIngles] ?? null;
            if (!$prefijoDia) continue;

            $turnos = $turnoFiltro ? [$turnoFiltro] : [1, 2, 3];

            foreach ($turnos as $turno) {
                foreach ($items as $item) {
                    // Determinar si el ítem tiene algo esperado hoy
                    $esperado = [
                        'orden'        => (bool) ($item->{"{$prefijoDia}_{$turno}_o"} ?? false),
                        'limpieza'     => (bool) ($item->{"{$prefijoDia}_{$turno}_l"} ?? false),
                        'desinfeccion' => (bool) ($item->{"{$prefijoDia}_{$turno}_d"} ?? false),
                    ];

                    // Si no espera nada, omitir (ahorramos filas)
                    if (!$esperado['orden'] && !$esperado['limpieza'] && !$esperado['desinfeccion']) {
                        continue;
                    }

                    // Buscar registros para este ítem, fecha y turno? 
                    // Nota: No tenemos campo turno en registros, asumimos que cualquier registro del día cuenta.
                    // Ajustar si almacenás turno.
                    $registrosDelDia = OldRegistro::where('old_item_id', $item->id)
                        ->whereDate('tiempo_realizado', $fecha->toDateString())
                        ->get();

                    $realizado = ['orden' => false, 'limpieza' => false, 'desinfeccion' => false];
                    foreach ($registrosDelDia as $reg) {
                        if ($reg->orden) $realizado['orden'] = true;
                        if ($reg->limpieza) $realizado['limpieza'] = true;
                        if ($reg->desinfeccion) $realizado['desinfeccion'] = true;
                    }

                    // Evaluar cumplimiento por tipo
                    $cumplioO = $esperado['orden'] && $realizado['orden'];
                    $cumplioL = $esperado['limpieza'] && $realizado['limpieza'];
                    $cumplioD = $esperado['desinfeccion'] && $realizado['desinfeccion'];

                    $estado = 'cumplido';
                    if ($esperado['orden'] && !$realizado['orden']) $estado = 'incumplido';
                    if ($esperado['limpieza'] && !$realizado['limpieza']) $estado = 'incumplido';
                    if ($esperado['desinfeccion'] && !$realizado['desinfeccion']) $estado = 'incumplido';
                    // Parcial se podría definir pero lo dejamos simple: si falta al menos uno, incumplido.

                    $resultado[] = [
                        'item'      => $item->nombre,
                        'area'      => $item->subarea->area->nombre ?? 'Sin área',
                        'subarea'   => $item->subarea->nombre ?? 'Sin subárea',
                        'fecha'     => $fecha->toDateString(),
                        'dia'       => $fecha->isoFormat('dddd D/M'),
                        'turno'     => $turno,
                        'esperado'  => $esperado,
                        'realizado' => $realizado,
                        'estado'    => $estado,
                        'observacion' => $registrosDelDia->pluck('observacion')->filter()->first() ?? '',
                        'correcion'   => $registrosDelDia->pluck('correcion')->filter()->first() ?? '',
                    ];

                    // Estadísticas
                    $actividadesEsperadas = ($esperado['orden'] ? 1 : 0) + ($esperado['limpieza'] ? 1 : 0) + ($esperado['desinfeccion'] ? 1 : 0);
                    $actividadesRealizadas = ($realizado['orden'] ? 1 : 0) + ($realizado['limpieza'] ? 1 : 0) + ($realizado['desinfeccion'] ? 1 : 0);

                    $totales['actividades_esperadas'] += $actividadesEsperadas;
                    if ($estado == 'cumplido') {
                        $totales['actividades_cumplidas'] += $actividadesRealizadas;
                    } elseif ($estado == 'incumplido') {
                        $totales['actividades_incumplidas'] += ($actividadesEsperadas - $actividadesRealizadas);
                    }
                }
            }
        }

        $porcentajeCumplimiento = $totales['actividades_esperadas'] > 0
            ? round(($totales['actividades_cumplidas'] / $totales['actividades_esperadas']) * 100, 2)
            : 0;

        return Inertia::render('comunes/old/registros/reporte', [
            'resultado'  => $resultado,
            'totales'    => $totales,
            'porcentaje' => $porcentajeCumplimiento,
            'filtros'    => [
                'fechas'   => $request->only('fecha_desde', 'fecha_hasta'),
                'area_id'  => $areaId,
                'subarea_id' => $subareaId,
                'turno'    => $turnoFiltro,
            ],
            'areas'      => \App\Domain\ModulosComunes\Old\Models\OldArea::select('id', 'nombre')->get(),
            'subareas'   => \App\Domain\ModulosComunes\Old\Models\OldSubarea::select('id', 'nombre', 'old_area_id')->get(),
            'fechaDesde' => $fechaDesde->toDateString(),
            'fechaHasta' => $fechaHasta->toDateString(),
        ]);
    }
    public function reporteResumido(Request $request)
    {
        $fechaDesde = $request->fecha_desde
            ? Carbon::parse($request->fecha_desde)->startOfDay()
            : now()->startOfDay();

        $fechaHasta = $request->fecha_hasta
            ? Carbon::parse($request->fecha_hasta)->endOfDay()
            : now()->endOfDay();

        $payload = $this->buildReporteResumidoPayload($request, $fechaDesde, $fechaHasta);

        return Inertia::render('comunes/old/registros/reporte-resumido', $payload);
    }

    public function reporteResumidoData(Request $request)
    {
        $fechaDesde = $request->fecha_desde
            ? Carbon::parse($request->fecha_desde)->startOfDay()
            : now()->startOfDay();

        $fechaHasta = $request->fecha_hasta
            ? Carbon::parse($request->fecha_hasta)->endOfDay()
            : now()->endOfDay();

        $payload = $this->buildReporteResumidoPayload($request, $fechaDesde, $fechaHasta);

        return response()->json($payload);
    }
    /**
     * ❌ ELIMINAR
     */
    public function destroy(OldRegistro $oldRegistro)
    {
        $oldRegistro->delete();

        return redirect()->back()
            ->with('success', 'Registro eliminado');
    }

    /**
     * 🔍 DEBUG: Ver estado de datos
     */
    public function debug()
    {
        $areas = \App\Domain\ModulosComunes\Old\Models\OldArea::all()->count();
        $subareas = \App\Domain\ModulosComunes\Old\Models\OldSubarea::all()->count();
        $items = OldItem::all()->count();
        $itemsConSubarea = OldItem::whereNotNull('old_subarea_id')->count();
        $itemsSinSubarea = OldItem::whereNull('old_subarea_id')->count();

        $itemsPorArea = \DB::table('old_items')
            ->leftJoin('old_subareas', 'old_items.old_subarea_id', '=', 'old_subareas.id')
            ->leftJoin('old_areas', 'old_subareas.old_area_id', '=', 'old_areas.id')
            ->select('old_areas.nombre', \DB::raw('COUNT(old_items.id) as count'))
            ->groupBy('old_areas.id', 'old_areas.nombre')
            ->get();

        return response()->json([
            'status' => 'ok',
            'totales' => [
                'areas' => $areas,
                'subareas' => $subareas,
                'items' => $items,
                'items_con_subarea' => $itemsConSubarea,
                'items_sin_subarea' => $itemsSinSubarea,
            ],
            'items_por_area' => $itemsPorArea,
            'sample_items' => OldItem::with('subarea.area')->limit(5)->get(),
            'sample_subareas' => \App\Domain\ModulosComunes\Old\Models\OldSubarea::with('area')->limit(5)->get(),
        ]);
    }

    /**
     * 📅 ITEMS POR DIA (legacy helper)
     */
    public static function porDiaActual()
    {
        $dia = strtolower(now()->format('D'));

        $map = [
            'mon' => 'lun',
            'tue' => 'mar',
            'wed' => 'mie',
            'thu' => 'jue',
            'fri' => 'vie',
            'sat' => 'sab',
            'sun' => 'dom',
        ];

        $dia = $map[$dia];

        return self::with('subarea.area')->get()->map(function ($item) use ($dia) {
            $turnos = [1, 2, 3];
            $data = [];

            foreach ($turnos as $t) {
                $data[$t] = [
                    'orden' => $item->{"{$dia}_{$t}_o"},
                    'limpieza' => $item->{"{$dia}_{$t}_l"},
                    'desinfeccion' => $item->{"{$dia}_{$t}_d"},
                ];
            }

            return [
                'id' => $item->id,
                'nombre' => $item->nombre,
                'subarea' => $item->subarea?->nombre,
                'area' => $item->subarea?->area?->nombre,
                'turnos' => $data
            ];
        });
    }

    /**
     * 🔥 API PARA FRONT - ITEMS DEL DÍA CON FILTROS
     */
    public function itemsPorDia(Request $request)
    {
        $map = [
            'Mon' => 'lun',
            'Tue' => 'mar',
            'Wed' => 'mie',
            'Thu' => 'jue',
            'Fri' => 'vie',
            'Sat' => 'sab',
            'Sun' => 'dom',
        ];

        // ✅ Obtener la fecha desde el request (o usar hoy)
        $fecha = $request->input('fecha')
            ? Carbon::parse($request->input('fecha'))
            : now();

        // Día de la semana en inglés (ej: 'Mon')
        $diaSemanaIngles = $fecha->format('D');
        $diaKey = $map[$diaSemanaIngles] ?? 'lun';

        $query = OldItem::with('subarea.area');

        if ($request->filled('subarea_id')) {
            $subareaIds = (array) $request->input('subarea_id');
            $query->whereIn('old_subarea_id', $subareaIds);
        } elseif ($request->filled('area_id')) {
            $query->whereHas('subarea', function ($q) use ($request) {
                $q->where('old_area_id', $request->area_id);
            });
        }

        \Log::channel('single')->info('itemsPorDia', [
            'dia'      => $diaKey,
            'fecha_utilizada' => $fecha->toDateString(),
            'area_id'  => $request->input('area_id'),
            'subarea_id' => $request->input('subarea_id'),
            'items_count' => $query->count(),
        ]);

        $resultado = $query->get()->map(function ($item) use ($diaKey) {
            $turnos = [];
            foreach ([1, 2, 3] as $t) {
                $columnKey = "{$diaKey}_{$t}";
                $turnos[$t] = [
                    'orden'        => (bool) ($item->{$columnKey . '_o'} ?? false),
                    'limpieza'     => (bool) ($item->{$columnKey . '_l'} ?? false),
                    'desinfeccion' => (bool) ($item->{$columnKey . '_d'} ?? false),
                ];
            }
            return [
                'id'           => $item->id,
                'nombre'       => $item->nombre,
                'subarea_id'   => $item->old_subarea_id,
                'subarea'      => $item->subarea?->nombre,
                'area'         => $item->subarea?->area?->nombre,
                'turnos'       => $turnos,
            ];
        })->values();

        return response()->json([
            'items'   => $resultado,
            'dia'     => $diaKey,
            'fecha'   => $fecha->toDateString(),
            'count'   => count($resultado),
            'filters' => [
                'area_id'    => $request->input('area_id'),
                'subarea_id' => $request->input('subarea_id'),
                'fecha'      => $fecha->toDateString(),
            ],
        ]);
    }
}
