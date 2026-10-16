<?php

namespace App\Domain\ModulosComunes\Orp\Http\Controllers;

use App\Domain\ModulosComunes\Orp\Models\Orp;
use App\Domain\ModulosComunes\Orp\Models\OrpEstado;
use App\Domain\PlantaLacteos\Models\EstadoDetalle;
use App\Domain\PlantaLacteos\Models\EstadoPlanta;
use App\Domain\PlantaLacteos\Models\AnalisisLinea;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\PlantaLacteos\Models\Origen;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OrpReporteController extends Controller
{
    public function show($orpId): Response
    {
        // 1. Cargar ORP básica
        $orp = Orp::with(['productoTerminado.linea', 'productoTerminado.destino', 'ubicacion', 'unidad'])
            ->findOrFail($orpId);

        $orpParaReporte = $this->mapOrpParaReporte($orp);

        // 2. Obtener resultados agrupados
        $resultadosAgrupados = $this->obtenerResultadosAgrupados($orpId);

        // 3. Obtener usuarios involucrados
        $usuariosInvolucrados = $this->obtenerUsuariosInvolucrados($orpId);

        // 4. Calcular cantidad total
        $cantidadTotal = EstadoDetalle::where('orp_id', $orpId)->sum('cantidad');

        // 5. Obtener preparaciones únicas
        $preparaciones = $this->obtenerPreparacionesProcesadas($orpId);

        // 6. Obtener análisis por etapa
        $analisisPorEtapa = $this->obtenerAnalisisPorEtapa($orpId);

        // 7. Obtener tiempos por etapa
        $tiemposPorEtapa = $this->obtenerTiemposPorEtapa($orpId);

        // 8. Obtener análisis cronológico (NUEVO)
        $analisisCronologico = $this->obtenerAnalisisCronologico($orpId);

        // 9. Obtener orígenes utilizados (NUEVO)
        $origenesUtilizados = $this->obtenerOrigenesUtilizados($orpId);

        // 10. Obtener resumen por preparación (NUEVO)
        $resumenPreparaciones = $this->obtenerResumenPreparaciones($orpId);
        // 11. Obtener últimos análisis agrupados (NUEVO)
        $ultimosAnalisisAgrupados = $this->obtenerUltimosAnalisisAgrupados($orpId);

        // 12. Obtener estadísticas de análisis (NUEVO)
        $estadisticasAnalisis = $this->obtenerEstadisticasAnalisis($orpId);

        return Inertia::render('comunes/orp/reporte', [
            'orp' => $orpParaReporte,
            'resultados_agrupados' => $resultadosAgrupados,
            'usuarios_involucrados' => $usuariosInvolucrados,
            'cantidad_total' => $cantidadTotal,
            'preparaciones_procesadas' => $preparaciones,
            'analisis_por_etapa' => $analisisPorEtapa,
            'tiempos_por_etapa' => $tiemposPorEtapa,
            'observaciones' => $orp->observaciones,
            'analisis_cronologico' => $analisisCronologico,
            'origenes_utilizados' => $origenesUtilizados,
            'resumen_preparaciones' => $resumenPreparaciones,
            'ultimos_analisis_agrupados' => $ultimosAnalisisAgrupados,
            'estadisticas_analisis' => $estadisticasAnalisis,
            'pasteurizador' => $this->obtenerPasteurizadores($orpId)->first(), 
        ]);
    }

    private function obtenerResultadosAgrupados($orpId)
    {
        $detalles = EstadoDetalle::where('orp_id', $orpId)
            ->with([
                'estadoPlanta.etapa',
                'estadoPlanta.origen',
                'estadoPlanta.user',
                'estadoPlanta.analisisLinea.analista',
                'estadoPlanta.analisisLinea.solicitante'
            ])
            ->orderBy('created_at')
            ->get();

        // Si no hay detalles, retornar array vacío
        if ($detalles->isEmpty()) {
            return [];
        }

        // 🔥 FORZAR la serialización de relaciones
        $detalles = $detalles->map(function ($detalle) {
            // Asegurar que estadoPlanta se serialice completamente
            if ($detalle->estadoPlanta) {
                // Cargar explícitamente si no está cargado
                $detalle->estadoPlanta->loadMissing(['etapa', 'origen', 'user', 'analisisLinea']);

                // Serializar manualmente
                $detalle->estadoPlanta = [
                    'id' => $detalle->estadoPlanta->id,
                    'tiempo' => $detalle->estadoPlanta->tiempo,
                    'user_id' => $detalle->estadoPlanta->user_id,
                    'origen_id' => $detalle->estadoPlanta->origen_id,
                    'etapa_id' => $detalle->estadoPlanta->etapa_id,
                    'proceso_id' => $detalle->estadoPlanta->proceso_id,
                    'observaciones' => $detalle->estadoPlanta->observaciones,
                    'created_at' => $detalle->estadoPlanta->created_at,
                    'updated_at' => $detalle->estadoPlanta->updated_at,
                    'etapa' => $detalle->estadoPlanta->etapa ? [
                        'id' => $detalle->estadoPlanta->etapa->id,
                        'nombre' => $detalle->estadoPlanta->etapa->nombre,
                        'descripcion' => $detalle->estadoPlanta->etapa->descripcion,
                        'color' => $detalle->estadoPlanta->etapa->color,
                    ] : null,
                    'origen' => $detalle->estadoPlanta->origen ? [
                        'id' => $detalle->estadoPlanta->origen->id,
                        'alias' => $detalle->estadoPlanta->origen->alias,
                        'descripcion' => $detalle->estadoPlanta->origen->descripcion,
                    ] : null,
                    'user' => $detalle->estadoPlanta->user ? [
                        'id' => $detalle->estadoPlanta->user->id,
                        'name' => $detalle->estadoPlanta->user->name,
                        'apellido' => $detalle->estadoPlanta->user->apellido,
                    ] : null,
                    'analisis_linea' => $detalle->estadoPlanta->analisisLinea ? [
                        'id' => $detalle->estadoPlanta->analisisLinea->id,
                        'temperatura' => $detalle->estadoPlanta->analisisLinea->temperatura,
                        'ph' => $detalle->estadoPlanta->analisisLinea->ph,
                        'acidez' => $detalle->estadoPlanta->analisisLinea->acidez,
                        'brix' => $detalle->estadoPlanta->analisisLinea->brix,
                        'viscosidad' => $detalle->estadoPlanta->analisisLinea->viscosidad,
                        'densidad' => $detalle->estadoPlanta->analisisLinea->densidad,
                        'peso' => $detalle->estadoPlanta->analisisLinea->peso,
                        'volumen' => $detalle->estadoPlanta->analisisLinea->volumen,
                        'tempUHT' => $detalle->estadoPlanta->analisisLinea->tempUHT,
                        'observaciones' => $detalle->estadoPlanta->analisisLinea->observaciones,
                        'analista' => $detalle->estadoPlanta->analisisLinea->analista ? [
                            'id' => $detalle->estadoPlanta->analisisLinea->analista->id,
                            'name' => $detalle->estadoPlanta->analisisLinea->analista->name,
                            'apellido' => $detalle->estadoPlanta->analisisLinea->analista->apellido,
                        ] : null,
                        'solicitante' => $detalle->estadoPlanta->analisisLinea->solicitante ? [
                            'id' => $detalle->estadoPlanta->analisisLinea->solicitante->id,
                            'name' => $detalle->estadoPlanta->analisisLinea->solicitante->name,
                            'apellido' => $detalle->estadoPlanta->analisisLinea->solicitante->apellido,
                        ] : null,
                    ] : null,
                ];
            }

            return $detalle;
        });

        // Agrupar por preparación
        $agrupados = [];

        foreach ($detalles as $detalle) {
            $preparacion = $detalle->preparacion;

            // Si no tiene preparación, usar "general"
            if (empty($preparacion)) {
                $preparacion = 'general';
            }

            // Procesar la preparación (agrupar por pares)
            $preparacionesProcesadas = $this->procesarPreparacion($preparacion);

            foreach ($preparacionesProcesadas as $prepProcesada) {
                if (!isset($agrupados[$prepProcesada])) {
                    $agrupados[$prepProcesada] = [];
                }

                $agrupados[$prepProcesada][] = $detalle;
            }
        }

        return $agrupados;
    }

    private function procesarPreparacion($preparacion)
    {
        if (empty($preparacion) || $preparacion === 'general') {
            return ['general'];
        }

        // Si no tiene guiones, devolver tal cual
        if (strpos($preparacion, '-') === false) {
            return [$preparacion];
        }

        $partes = explode('-', $preparacion);
        $resultado = [];

        // Agrupar de dos en dos
        for ($i = 0; $i < count($partes); $i += 2) {
            if (isset($partes[$i + 1])) {
                $resultado[] = $partes[$i] . '-' . $partes[$i + 1];
            } else {
                $resultado[] = $partes[$i];
            }
        }

        return $resultado;
    }

    private function obtenerPreparacionesProcesadas($orpId)
    {
        $preparaciones = EstadoDetalle::where('orp_id', $orpId)
            ->distinct()
            ->pluck('preparacion')
            ->filter() // Remover valores nulos o vacíos
            ->values();

        $procesadas = [];

        foreach ($preparaciones as $prep) {
            $grupos = $this->procesarPreparacion($prep);
            $procesadas = array_merge($procesadas, $grupos);
        }

        return array_values(array_unique($procesadas));
    }

    private function obtenerUsuariosInvolucrados($orpId)
    {
        // Obtener IDs de usuarios de todas las fuentes
        $usuariosIds = [];

        // 1. Usuarios de EstadoDetalle
        $usuariosIds = array_merge(
            $usuariosIds,
            EstadoDetalle::where('orp_id', $orpId)
                ->pluck('user_id')
                ->toArray()
        );

        // 2. Usuarios de EstadoPlanta
        $estadosPlantaIds = EstadoDetalle::where('orp_id', $orpId)
            ->pluck('estado_planta_id')
            ->filter()
            ->toArray();

        if (!empty($estadosPlantaIds)) {
            $usuariosIds = array_merge(
                $usuariosIds,
                EstadoPlanta::whereIn('id', $estadosPlantaIds)
                    ->pluck('user_id')
                    ->toArray()
            );
        }

        // 3. Usuarios de Análisis (analistas y solicitantes)
        $analisis = AnalisisLinea::whereHas('estadoPlanta.detalles', function ($q) use ($orpId) {
            $q->where('orp_id', $orpId);
        })
            ->select('analista_id', 'solicitante_id')
            ->get();

        foreach ($analisis as $item) {
            if ($item->analista_id) $usuariosIds[] = $item->analista_id;
            if ($item->solicitante_id) $usuariosIds[] = $item->solicitante_id;
        }

        // Limpiar y obtener usuarios únicos
        $usuariosIds = array_filter(array_unique($usuariosIds));

        if (empty($usuariosIds)) {
            return [];
        }

        return User::whereIn('id', $usuariosIds)
            ->select(['id', 'codigo', 'name', 'apellido', 'email'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'codigo' => $user->codigo ?? null,
                    'nombre' => $user->name,
                    'apellido' => $user->apellido,
                    'nombre_completo' => trim(($user->name ?? '') . ' ' . ($user->apellido ?? '')),
                    'email' => $user->email,
                    'iniciales' => strtoupper(
                        (substr($user->name, 0, 1) ?: '') .
                            (substr($user->apellido, 0, 1) ?: '')
                    )
                ];
            })
            ->toArray();
    }

    private function obtenerAnalisisPorEtapa($orpId)
    {
        $analisis = AnalisisLinea::whereHas('estadoPlanta.detalles', function ($q) use ($orpId) {
            $q->where('orp_id', $orpId);
        })
            ->with([
                'estadoPlanta.etapa',
                'estadoPlanta.origen',
                'estadoPlanta.detalles' => function ($q) use ($orpId) {
                    $q->where('orp_id', $orpId);
                },
                'analista',
                'solicitante'
            ])
            ->orderBy('tiempo_solicitud', 'asc')
            ->get();

        $resultado = [];

        foreach ($analisis as $item) {
            $etapaNombre = $item->estadoPlanta->etapa->nombre ?? 'Sin etapa';
            
            // Obtener TODAS las preparaciones relacionadas a este estadoPlanta
            $preparacionesRelacionadas = $item->estadoPlanta->detalles
                ->pluck('preparacion')
                ->filter()
                ->unique()
                ->values()
                ->toArray();

            // Si no hay preparaciones, usar "general"
            if (empty($preparacionesRelacionadas)) {
                $preparacionesRelacionadas = ['general'];
            }

            if (!isset($resultado[$etapaNombre])) {
                $resultado[$etapaNombre] = [];
            }

            // Crear una entrada para CADA preparación
            foreach ($preparacionesRelacionadas as $preparacion) {
                // Procesar la preparación (agrupar por pares si es necesario)
                $preparacionesProcesadas = $this->procesarPreparacion($preparacion);

                foreach ($preparacionesProcesadas as $prepProcesada) {
                    $resultado[$etapaNombre][] = [
                        'id' => $item->id,
                        'cabezal' => $item->estadoPlanta->origen->alias ?? null,
                        'lote' => $prepProcesada,
                        'origen' => $item->estadoPlanta->origen->alias ?? null,
                        'preparacion' => $prepProcesada,
                        'horaS' => $item->tiempo_solicitud ?? null,
                        'horaR' => $item->tiempo_analisis ?? null,
                        'tiempo_solicitud' => $item->tiempo_solicitud ?? null,
                        'tiempo_analisis' => $item->tiempo_analisis ?? null,
                        'temperatura' => $item->temperatura,
                        'ph' => $item->ph,
                        'acidez' => $item->acidez,
                        'brix' => $item->brix,
                        'viscosidad' => $item->viscosidad,
                        'densidad' => $item->densidad,
                        'peso' => $item->peso,
                        'volumen' => $item->volumen,
                        'tempUHT' => $item->tempUHT,
                        'color' => $item->color ?? null,
                        'olor' => $item->olor ?? null,
                        'sabor' => $item->sabor ?? null,
                        'cond' => $item->cond ?? null,
                        'observaciones' => $item->observaciones,
                        'analista' => $item->analista ? [
                            'id' => $item->analista->id,
                            'codigo' => $item->analista->codigo,
                            'nombre' => $item->analista->name,
                            'apellido' => $item->analista->apellido,
                        ] : null,
                        'solicitante' => $item->solicitante ? [
                            'id' => $item->solicitante->id,
                            'codigo' => $item->solicitante->codigo,
                            'nombre' => $item->solicitante->name,
                            'apellido' => $item->solicitante->apellido,
                        ] : null,
                    ];
                }
            }
        }

        // Ordenar cada etapa por preparación (número ascendente: 1-2, 3-4, 5-6, etc)
        foreach ($resultado as &$items) {
            usort($items, function ($a, $b) {
                // Extraer el primer número de la preparación (1 de "1-2", 3 de "3-4", etc)
                preg_match('/^(\d+)/', $a['preparacion'] ?? '', $matchA);
                preg_match('/^(\d+)/', $b['preparacion'] ?? '', $matchB);
                
                $numA = isset($matchA[1]) ? intval($matchA[1]) : 999;
                $numB = isset($matchB[1]) ? intval($matchB[1]) : 999;
                
                return $numA <=> $numB;
            });
        }

        return $resultado;
    }

    private function obtenerFechaProduccion($orpId)
    {
        return OrpEstado::where('orp_id', $orpId)
            ->whereHas('estado', function ($q) {
                $q->where('nombre', 'En Proceso');
            })
            ->orderBy('fecha_hora', 'asc')
            ->value('fecha_hora');
    }

    private function mapOrpParaReporte(Orp $orp)
    {
        $orpArray = $orp->toArray();
        $orpArray['destino_nombre'] = optional(optional($orp->productoTerminado)->destino)->nombre ?? null;
        $orpArray['preparacion'] = $orp->lote;
        $orpArray['fecha_produccion'] = $this->obtenerFechaProduccion($orp->id);

        return $orpArray;
    }

    private function obtenerTiemposPorEtapa($orpId)
    {
        // Obtener todos los estados de planta relacionados con la ORP
        $estados = EstadoPlanta::whereHas('detalles', function ($q) use ($orpId) {
            $q->where('orp_id', $orpId);
        })
            ->with('etapa')
            ->orderBy('tiempo')
            ->get();

        if ($estados->isEmpty()) {
            return [];
        }

        $tiempos = [];

        foreach ($estados as $estado) {
            $etapaNombre = $estado->etapa->nombre ?? 'Sin etapa';
            $etapaId = $estado->etapa->id ?? 0;

            if ($etapaId === 0) {
                continue; // Saltar si no tiene etapa
            }

            if (!isset($tiempos[$etapaId])) {
                $tiempos[$etapaId] = [
                    'nombre' => $etapaNombre,
                    'inicio' => $estado->tiempo,
                    'fin' => $estado->tiempo,
                    'duracion_minutos' => 0,
                    'registros' => 0
                ];
            }

            // Actualizar inicio si es más temprano
            $inicioActual = Carbon::parse($tiempos[$etapaId]['inicio']);
            $nuevoTiempo = Carbon::parse($estado->tiempo);

            if ($nuevoTiempo->lt($inicioActual)) {
                $tiempos[$etapaId]['inicio'] = $estado->tiempo;
            }

            // Actualizar fin si es más tarde
            $finActual = Carbon::parse($tiempos[$etapaId]['fin']);
            if ($nuevoTiempo->gt($finActual)) {
                $tiempos[$etapaId]['fin'] = $estado->tiempo;
            }

            $tiempos[$etapaId]['registros']++;
        }

        // Calcular duraciones
        foreach ($tiempos as $etapaId => &$datos) {
            try {
                $inicio = Carbon::parse($datos['inicio']);
                $fin = Carbon::parse($datos['fin']);

                if ($inicio->isValid() && $fin->isValid()) {
                    $duracion = $fin->diffInMinutes($inicio);
                    $datos['duracion_minutos'] = $duracion > 0 ? $duracion : 0;
                }
            } catch (\Exception $e) {
                $datos['duracion_minutos'] = 0;
            }
        }

        // Ordenar por ID de etapa
        ksort($tiempos);

        return $tiempos;
    }

    // Método para obtener un solo detalle de prueba
    public function testDetalle($orpId, $detalleId = null)
    {
        if (!$detalleId) {
            // Tomar el primer detalle
            $detalle = EstadoDetalle::where('orp_id', $orpId)->first();
            if (!$detalle) {
                return response()->json(['error' => 'No hay detalles']);
            }
            $detalleId = $detalle->id;
        }

        $detalle = EstadoDetalle::with([
            'estadoPlanta.etapa',
            'estadoPlanta.origen',
            'estadoPlanta.user',
            'estadoPlanta.analisisLinea.analista',
            'estadoPlanta.analisisLinea.solicitante'
        ])->find($detalleId);

        if (!$detalle) {
            return response()->json(['error' => 'Detalle no encontrado']);
        }

        return response()->json([
            'detalle' => $detalle,
            'estado_planta' => $detalle->estadoPlanta,
            'etapa' => $detalle->estadoPlanta->etapa,
            'origen' => $detalle->estadoPlanta->origen,
            'user' => $detalle->estadoPlanta->user,
            'analisis' => $detalle->estadoPlanta->analisisLinea,
        ]);
    }
    private function obtenerAnalisisCronologico($orpId)
    {
        $analisis = AnalisisLinea::whereHas('estadoPlanta.detalles', function ($q) use ($orpId) {
            $q->where('orp_id', $orpId);
        })
            ->with([
                'estadoPlanta.etapa',
                'estadoPlanta.origen',
                'estadoPlanta.detalles' => function ($q) use ($orpId) {
                    $q->where('orp_id', $orpId);
                },
                'analista',
                'solicitante'
            ])
            ->orderBy('tiempo_solicitud')
            ->get();

        $agrupados = [];

        foreach ($analisis as $item) {
            // Obtener la preparación del primer detalle relacionado
            $preparacion = 'general';
            if ($item->estadoPlanta && $item->estadoPlanta->detalles->isNotEmpty()) {
                $preparacion = $item->estadoPlanta->detalles->first()->preparacion ?? 'general';
            }

            // Procesar la preparación (agrupar por pares)
            $preparacionesProcesadas = $this->procesarPreparacion($preparacion);

            foreach ($preparacionesProcesadas as $prepProcesada) {
                if (!isset($agrupados[$prepProcesada])) {
                    $agrupados[$prepProcesada] = [];
                }

                $agrupados[$prepProcesada][] = [
                    'id' => $item->id,
                    'origen' => $item->estadoPlanta->origen->alias ?? 'N/A',
                    'etapa' => $item->estadoPlanta->etapa->nombre ?? 'N/A',
                    'hora_solicitud' => $item->tiempo_solicitud,
                    'hora_respuesta' => $item->tiempo_analisis,
                    'temperatura' => $item->temperatura,
                    'ph' => $item->ph,
                    'acidez' => $item->acidez,
                    'brix' => $item->brix,
                    'viscosidad' => $item->viscosidad,
                    'peso' => $item->peso,
                    'volumen' => $item->volumen,
                    'tempUHT' => $item->tempUHT,
                    'solicitante' => $item->solicitante ? [
                        'nombre' => $item->solicitante->name,
                        'apellido' => $item->solicitante->apellido,
                    ] : null,
                    'analista' => $item->analista ? [
                        'nombre' => $item->analista->name,
                        'apellido' => $item->analista->apellido,
                    ] : null,
                ];
            }
        }

        return $agrupados;
    }

    /**
     * Obtener todos los orígenes utilizados en la ORP
     */
    private function obtenerOrigenesUtilizados($orpId)
    {
        $origenes = EstadoPlanta::whereHas('detalles', function ($q) use ($orpId) {
            $q->where('orp_id', $orpId);
        })
            ->with('origen')
            ->get()
            ->pluck('origen')
            ->unique('id')
            ->values();

        return $origenes->map(function ($origen) {
            return [
                'id' => $origen->id,
                'alias' => $origen->alias,
                'descripcion' => $origen->descripcion,
                'total_uso' => 0, // Podrías calcular cuántas veces se usó
            ];
        })->toArray();
    }

    /**
     * Obtener resumen por preparación con estado de cada etapa
     */
    private function obtenerResumenPreparaciones($orpId)
    {
        $detalles = EstadoDetalle::where('orp_id', $orpId)
            ->with([
                'estadoPlanta.etapa',
                'estadoPlanta.origen',
                'estadoPlanta.analisisLinea'
            ])
            ->get();

        $agrupados = [];

        foreach ($detalles as $detalle) {
            $preparacion = $detalle->preparacion ?: 'general';
            $etapaNombre = $detalle->estadoPlanta->etapa->nombre ?? 'Sin etapa';
            $etapaId = $detalle->estadoPlanta->etapa->id ?? 0;

            // Procesar la preparación (agrupar por pares)
            $preparacionesProcesadas = $this->procesarPreparacion($preparacion);

            foreach ($preparacionesProcesadas as $prepProcesada) {
                if (!isset($agrupados[$prepProcesada])) {
                    $agrupados[$prepProcesada] = [];
                }

                if (!isset($agrupados[$prepProcesada][$etapaId])) {
                    $agrupados[$prepProcesada][$etapaId] = [
                        'nombre' => $etapaNombre,
                        'detalles' => [],
                        'tiene_analisis' => false,
                        'estado' => 'pendiente'
                    ];
                }

                $agrupados[$prepProcesada][$etapaId]['detalles'][] = [
                    'id' => $detalle->id,
                    'origen' => $detalle->estadoPlanta->origen->alias ?? 'N/A',
                    'tiempo' => $detalle->estadoPlanta->tiempo ?? null,
                    'analisis' => $detalle->estadoPlanta->analisisLinea ? true : false,
                ];

                // Si tiene análisis, marcar como completado
                if ($detalle->estadoPlanta->analisisLinea) {
                    $agrupados[$prepProcesada][$etapaId]['tiene_analisis'] = true;
                    $agrupados[$prepProcesada][$etapaId]['estado'] = 'completado';
                } else {
                    // Si tiene registro pero sin análisis, está en proceso
                    $agrupados[$prepProcesada][$etapaId]['estado'] = 'en_proceso';
                }
            }
        }

        return $agrupados;
    }
    /**
     * Obtener últimos análisis válidos agrupados por preparación, origen y etapa
     * Solo muestra el último análisis de cada combinación (ignora pruebas intermedias)
     * AHORA: Incluye TODAS las preparaciones de un estadoPlanta (1-2, 3-4, etc)
     */
    private function obtenerUltimosAnalisisAgrupados($orpId)
    {
        // Obtener todos los análisis de la ORP
        $analisis = AnalisisLinea::whereHas('estadoPlanta.detalles', function ($q) use ($orpId) {
            $q->where('orp_id', $orpId);
        })
            ->with([
                'estadoPlanta.etapa',
                'estadoPlanta.origen',
                'estadoPlanta.detalles' => function ($q) use ($orpId) {
                    $q->where('orp_id', $orpId);
                },
                'analista',
                'solicitante'
            ])
            ->whereNotNull('tiempo_analisis') // Solo análisis completados
            ->whereNotNull('analista_id') // Con analista asignado
            ->orderBy('tiempo_analisis', 'desc')
            ->get();

        // Agrupar por preparación, origen y etapa, tomando solo el más reciente
        $agrupadosPorCombinacion = [];

        foreach ($analisis as $item) {
            // Obtener TODAS las preparaciones relacionadas a este estadoPlanta
            $preparacionesRelacionadas = $item->estadoPlanta->detalles
                ->pluck('preparacion')
                ->filter()
                ->unique()
                ->values()
                ->toArray();

            // Si no hay preparaciones, usar "general"
            if (empty($preparacionesRelacionadas)) {
                $preparacionesRelacionadas = ['general'];
            }

            // Crear una entrada para CADA preparación
            foreach ($preparacionesRelacionadas as $preparacion) {
                // Procesar la preparación (agrupar por pares)
                $preparacionesProcesadas = $this->procesarPreparacion($preparacion);

                foreach ($preparacionesProcesadas as $prepProcesada) {
                    // Crear clave única: preparación|origen|etapa
                    $clave = $prepProcesada . '|' .
                        ($item->estadoPlanta->origen->alias ?? 'N/A') . '|' .
                        ($item->estadoPlanta->etapa->nombre ?? 'N/A');

                    // Si ya existe un análisis para esta combinación y es más reciente, omitir
                    // (porque ordenamos descendente, el primero que encontremos es el más reciente)
                    if (!isset($agrupadosPorCombinacion[$clave])) {
                        $agrupadosPorCombinacion[$clave] = [
                            'preparacion' => $prepProcesada,
                            'origen' => $item->estadoPlanta->origen->alias ?? 'N/A',
                            'origen_id' => $item->estadoPlanta->origen->id ?? null,
                            'etapa' => $item->estadoPlanta->etapa->nombre ?? 'N/A',
                            'etapa_id' => $item->estadoPlanta->etapa->id ?? null,
                            'analisis' => [
                                'id' => $item->id,
                                'tiempo_solicitud' => $item->tiempo_solicitud,
                                'tiempo_analisis' => $item->tiempo_analisis,
                                'temperatura' => $item->temperatura,
                                'ph' => $item->ph,
                                'acidez' => $item->acidez,
                                'brix' => $item->brix,
                                'viscosidad' => $item->viscosidad,
                                'densidad' => $item->densidad,
                                'peso' => $item->peso,
                                'volumen' => $item->volumen,
                                'tempUHT' => $item->tempUHT,
                                'color' => $item->color,
                                'olor' => $item->olor,
                                'sabor' => $item->sabor,
                                'aspecto' => $item->aspecto,
                                'observaciones' => $item->observaciones,
                                'solicitante' => $item->solicitante ? [
                                    'id' => $item->solicitante->id,
                                    'nombre' => $item->solicitante->name,
                                    'apellido' => $item->solicitante->apellido,
                                ] : null,
                                'analista' => $item->analista ? [
                                    'id' => $item->analista->id,
                                    'nombre' => $item->analista->name,
                                    'apellido' => $item->analista->apellido,
                                ] : null,
                            ],
                            'estado_planta' => [
                                'tiempo' => $item->estadoPlanta->tiempo ?? null,
                                'user' => $item->estadoPlanta->user ? [
                                    'id' => $item->estadoPlanta->user->id,
                                    'nombre' => $item->estadoPlanta->user->name,
                                    'apellido' => $item->estadoPlanta->user->apellido,
                                ] : null,
                            ]
                        ];
                    }
                }
            }
        }

        // Reorganizar por preparación para la vista
        $resultado = [];
        foreach ($agrupadosPorCombinacion as $item) {
            $prep = $item['preparacion'];
            if (!isset($resultado[$prep])) {
                $resultado[$prep] = [];
            }
            $resultado[$prep][] = $item;
        }

        // Ordenar cada preparación por etapa_id y origen
        foreach ($resultado as &$items) {
            usort($items, function ($a, $b) {
                // Primero por etapa_id
                if ($a['etapa_id'] != $b['etapa_id']) {
                    return $a['etapa_id'] <=> $b['etapa_id'];
                }
                // Luego por origen
                return strcmp($a['origen'], $b['origen']);
            });
        }

        // Ordenar las preparaciones mismas (1-2, 3-4, 5-6, etc) de forma ascendente
        uksort($resultado, function ($prepA, $prepB) {
            // Extraer el primer número de cada preparación
            preg_match('/^(\d+)/', $prepA, $matchA);
            preg_match('/^(\d+)/', $prepB, $matchB);
            
            $numA = isset($matchA[1]) ? intval($matchA[1]) : 999;
            $numB = isset($matchB[1]) ? intval($matchB[1]) : 999;
            
            return $numA <=> $numB;
        });

        return $resultado;
    }

    /**
     * Método para obtener conteo de análisis vs pruebas (para estadísticas)
     */
    private function obtenerEstadisticasAnalisis($orpId)
    {
        $totalAnalisis = AnalisisLinea::whereHas('estadoPlanta.detalles', function ($q) use ($orpId) {
            $q->where('orp_id', $orpId);
        })
            ->count();

        $analisisCompletos = AnalisisLinea::whereHas('estadoPlanta.detalles', function ($q) use ($orpId) {
            $q->where('orp_id', $orpId);
        })
            ->whereNotNull('tiempo_analisis')
            ->whereNotNull('analista_id')
            ->count();

        // Agrupar por preparación para estadísticas más detalladas
        $analisisPorPreparacion = AnalisisLinea::whereHas('estadoPlanta.detalles', function ($q) use ($orpId) {
            $q->where('orp_id', $orpId);
        })
            ->with(['estadoPlanta.detalles' => function ($q) use ($orpId) {
                $q->where('orp_id', $orpId);
            }])
            ->get()
            ->groupBy(function ($item) {
                if ($item->estadoPlanta && $item->estadoPlanta->detalles->isNotEmpty()) {
                    $prep = $item->estadoPlanta->detalles->first()->preparacion ?? 'general';
                    // Procesar la preparación
                    return $this->procesarPreparacion($prep)[0] ?? 'general';
                }
                return 'general';
            });

        $estadisticasPorPreparacion = [];
        foreach ($analisisPorPreparacion as $prep => $analisis) {
            $completos = $analisis->whereNotNull('tiempo_analisis')->whereNotNull('analista_id')->count();
            $estadisticasPorPreparacion[$prep] = [
                'total' => $analisis->count(),
                'completos' => $completos,
                'pruebas_intermedias' => $analisis->count() - $completos
            ];
        }

        return [
            'total_analisis' => $totalAnalisis,
            'analisis_completos' => $analisisCompletos,
            'pruebas_intermedias' => $totalAnalisis - $analisisCompletos,
            'por_preparacion' => $estadisticasPorPreparacion,
            'porcentaje_completos' => $totalAnalisis > 0 ? round(($analisisCompletos / $totalAnalisis) * 100, 2) : 0,
        ];
    }

    /**
     * Método para obtener datos del reporte HTST (Últimos Análisis)
     */
    public function reporteHtst($orpId)
    {
        $orp = Orp::with(['productoTerminado.linea', 'productoTerminado.destino', 'ubicacion', 'unidad'])
            ->findOrFail($orpId);
        $orpParaReporte = $this->mapOrpParaReporte($orp);
        $estadisticasAnalisis = $this->obtenerEstadisticasAnalisis($orpId);
        $ultimosAnalisisAgrupados = $this->obtenerUltimosAnalisisAgrupados($orpId);
        $analisisPorEtapa = $this->obtenerAnalisisPorEtapa($orpId);
        $usuariosInvolucrados = $this->obtenerUsuariosInvolucrados($orpId);

        // 👇 NUEVO: obtener pasteurizador
        $pasteurizadores = $this->obtenerPasteurizadores($orpId);
        $pasteurizador = $pasteurizadores->isNotEmpty() ? $pasteurizadores->first() : null;

        return response()->json([
            'orp' => $orpParaReporte,
            'estadisticas_analisis' => $estadisticasAnalisis,
            'ultimos_analisis_agrupados' => $ultimosAnalisisAgrupados,
            'analisis_por_etapa' => $analisisPorEtapa,
            'usuarios_involucrados' => $usuariosInvolucrados,
            'observaciones' => $orp->observaciones,
            'pasteurizador' => $pasteurizador,   // ✅ nuevo
        ]);
    }

    /**
     * Método para obtener datos del reporte UHT (Análisis por Etapa)
     */
    public function reporteUht($orpId)
    {
        $orp = Orp::with(['productoTerminado.linea', 'productoTerminado.destino', 'ubicacion', 'unidad'])
            ->findOrFail($orpId);

        $orpParaReporte = $this->mapOrpParaReporte($orp);
        $analisisPorEtapa = $this->obtenerAnalisisPorEtapa($orpId);
        $usuariosInvolucrados = $this->obtenerUsuariosInvolucrados($orpId);

        return response()->json([
            'pasteurizadores' => $this->obtenerPasteurizadores($orpId),
            'orp' => $orpParaReporte,
            'analisis_por_etapa' => $analisisPorEtapa,
            'usuarios_involucrados' => $usuariosInvolucrados,
            'observaciones' => $orp->observaciones,
        ]);
    }
    private function obtenerPasteurizadores($orpId)
    {
        $detalles = EstadoDetalle::with([
            'estadoPlanta.origen',
            'estadoPlanta.etapa',
        ])
            ->where('orp_id', $orpId)
            ->whereHas('estadoPlanta', function ($q) {
                $q->where('etapa_id', 31);
            })
            ->orderBy('created_at')
            ->get();

        return $detalles->map(function ($detalle) {

            $estado = $detalle->estadoPlanta;

            return [
                'preparacion' => $detalle->preparacion,

                'alias' => optional($estado->origen)->alias,

                'hora' => $estado->tiempo,

                'created_at' => $estado->created_at,

                'observacion' => $estado->observaciones,

                'estado_planta_id' => $estado->id,
            ];
        })->values();
    }
}
