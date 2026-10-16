<?php

namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\AnalisisLinea;
use App\Domain\PlantaLacteos\Models\EstadoDetalle;
use App\Domain\PlantaLacteos\Models\EstadoPlanta;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class DashboardPlantaService
{
    // En DashboardPlantaService.php - modifica esta parte:
    public function getDashboardData(): array
    {
        // 🔹 Obtiene el último registro de cada origen
        $ultimosEstados = EstadoPlanta::select([
            'id', 'tiempo', 'observaciones', 'origen_id', 'proceso_id', 'etapa_id', 'user_id',
        ])->with([
            'origen:id,alias,descripcion',
            'proceso:id,nombre',
            'etapa:id,nombre',
            'user:id,name',
            'detalles:id,orp_id,preparacion,cantidad,estado_planta_id',
            'detalles.orp:id,codigo,lote,producto_terminado_id',
            'detalles.orp.productoTerminado:id,codigo_sap,nombre_sap',
            'analisisLinea',
            'analisisLinea.solicitante:id,name,apellido',
            'analisisLinea.analista:id,name,apellido',
            'analisisLinea.estado:id,nombre',
        ])
            ->whereIn('id', function ($query) {
                $query->selectRaw('MAX(id)')
                    ->from('PLL_estado_plantas')
                    ->groupBy('origen_id');
            })
            ->get();

        // 🔹 Mapea los resultados, agrupando por ID real del origen
        $origenesConUltimoEstado = $ultimosEstados->mapWithKeys(function ($estado) {
            $alias = $estado->origen->alias ?? 'Origen ' . $estado->origen_id;

            return [
                // Usar el ID real del origen como clave
                $estado->origen_id => [
                    'id' => $estado->id,
                    'tiempo' => optional($estado->tiempo)->format('Y-m-d H:i'),
                    'observaciones' => $estado->observaciones,
                    'origen' => [
                        'id' => $estado->origen->id ?? null,
                        'alias' => $alias,
                        'descripcion' => $estado->origen->descripcion ?? null,
                    ],
                    'proceso' => [
                        'nombre' => $estado->proceso->nombre ?? null,
                    ],
                    'etapa' => [
                        'nombre' => $estado->etapa->nombre ?? null,
                    ],
                    'user' => [
                        'name' => $estado->user->name ?? null,
                    ],
                    // 🔽 AÑADIR LOS DETALLES AQUÍ 🔽
                    'detalles' => $estado->detalles->map(function ($detalle) {

                        return [
                            'id' => $detalle->id,
                            'orp_id' => $detalle->orp_id,
                            'preparacion' => $detalle->preparacion,
                            'cantidad' => $detalle->cantidad,
                            'orp' => $detalle->orp ? [
                                'id' => $detalle->orp->id,
                                'codigo' => $detalle->orp->codigo,
                                'nombre_sap' => $detalle->orp->productoTerminado->nombre_sap ?? 'Sin producto',
                                'lote' => $detalle->orp->lote ?? null,
                                'productoTerminado' => $detalle->orp->productoTerminado ? [
                                    'id' => $detalle->orp->productoTerminado->id,
                                    'codigo_sap' => $detalle->orp->productoTerminado->codigo_sap,
                                    'nombre_sap' => $detalle->orp->productoTerminado->nombre_sap, // 🔽 Usar nombre_sap

                                ] : null,
                            ] : null,
                        ];
                    })->toArray(),
                    'analisis_linea' => $estado->analisisLinea ? [
                        'id' => $estado->analisisLinea->id,
                        'tiempo' => optional($estado->analisisLinea->tiempo_solicitud)->format('Y-m-d H:i'),
                        'solicitante_id' => $estado->analisisLinea->solicitante_id,
                        'analista_id' => $estado->analisisLinea->analista_id,
                        'solicitante' => [
                            'name' => $estado->analisisLinea->solicitante->name ?? null,
                            'apellido' => $estado->analisisLinea->solicitante->apellido ?? null,
                        ],
                        'analista' => [
                            'name' => $estado->analisisLinea->analista->name ?? null,
                            'apellido' => $estado->analisisLinea->analista->apellido ?? null,
                        ],
                        'estado' => [
                            'nombre' => $estado->analisisLinea->estado->nombre ?? null,
                        ],
                        'temperatura' => $estado->analisisLinea->temperatura,
                        'ph' => $estado->analisisLinea->ph,
                        'acidez' => $estado->analisisLinea->acidez,
                        'brix' => $estado->analisisLinea->brix,
                        'viscosidad' => $estado->analisisLinea->viscosidad,
                        'densidad' => $estado->analisisLinea->densidad,

                    ] : null,
                ]
            ];
        });

        return [
            'origenes' => $origenesConUltimoEstado,
        ];
    }



    // 🔽 El resto de tus funciones se mantienen igual 🔽

    private function getUltimosEstadosPlantas(): Collection
    {
        return EstadoPlanta::with([
            'origen',
            'estadoDetalles.orp.productoTerminado',
            'analisisLinea.analisisLinea'
        ])
            ->whereIn('id', function ($query) {
                $query->select(DB::raw('MAX(id)'))
                    ->from('PLL_estado_plantas')
                    ->groupBy('origen_id');
            })
            ->get()
            ->keyBy('origen_id');
    }

    private function getEstadosIndividuales(Collection $ultimosEstados): array
    {
        return [
            'R1' => $ultimosEstados->get(1),
            'R2' => $ultimosEstados->get(2),
            // ...
        ];
    }

    private function getDatosAgrupados(): array
    {
        $gruposOrigenes = [
            'htst' => range(34, 48),
            'uht' => range(27, 33),
            'vasos' => range(50, 52),
            'soya' => range(57, 59),
            'aranas' => [53],
        ];

        $datosAgrupados = [];
        foreach ($gruposOrigenes as $grupo => $origenIds) {
            $datosAgrupados[$grupo] = $this->getEstadosDetalleAgrupados($origenIds);
        }

        return $datosAgrupados;
    }

    private function getEstadosDetalleAgrupados(array $origenIds): Collection
    {
        $latestEstadoPlantas = DB::table('PLL_estado_plantas')
            ->select('id', 'origen_id', DB::raw('MAX(created_at) as max_created_at'))
            ->whereIn('id', function ($query) {
                $query->select(DB::raw('MAX(id)'))
                    ->from('PLL_estado_plantas')
                    ->groupBy('origen_id');
            })
            ->groupBy('id', 'origen_id');

        return DB::table('PLL_estado_detalles as ed')
            ->joinSub($latestEstadoPlantas, 'latest_estado_plantas', function ($join) {
                $join->on('ed.estado_planta_id', '=', 'latest_estado_plantas.id');
            })
            ->join('PLL_origenes as o', 'latest_estado_plantas.origen_id', '=', 'o.id')
            ->whereIn('o.id', $origenIds)
            ->select('ed.orp_id', 'ed.preparacion', 'o.id as origen_id', 'o.alias')
            ->orderBy('o.alias')
            ->get()
            ->groupBy(function ($item) {
                return $item->orp_id . '|' . $item->preparacion;
            });
    }

    private function getOrpsRelacionados(): Collection
    {
        $orpIds = DB::table('PLL_estado_detalles as ed')
            ->join('PLL_estado_plantas as ep', 'ed.estado_planta_id', '=', 'ep.id')
            ->whereIn('ep.origen_id', $this->getTodosOrigenes())
            ->pluck('ed.orp_id')
            ->unique()
            ->filter();

        return Orp::with(['productoTerminado'])
            ->whereIn('id', $orpIds)
            ->get()
            ->keyBy('id');
    }

    private function getTodosOrigenes(): array
    {
        return array_merge(
            range(6, 26),
            range(27, 48),
            range(50, 53),
            range(54, 60)
        );
    }

    public function cambiarEstadoOrigen(int $origenId, string $proceso, ?int $etapaId = null): EstadoPlanta
    {
        return EstadoPlanta::create([
            'tiempo' => now(),
            'user_id' => auth()->id(),
            'origen_id' => $origenId,
            'proceso_id' => $proceso,
            'etapa_id' => $etapaId ?? self::ETAPA_PRODUCCION,
        ]);
    }

    public function solicitarAnalisis(int $estadoPlantaId): array
    {
        if (!EstadoDetalle::where('estado_planta_id', $estadoPlantaId)->exists()) {
            throw new \Exception('No se encontró ningún registro de EstadoPlanta con el ID proporcionado.');
        }

        DB::transaction(function () use ($estadoPlantaId) {
            // Obtener el ID del estado "Pendiente" de la tabla estados
            $estadoPendiente = \App\Domain\Sistema\Configuracion\Models\Estado::where('nombre', 'Pendiente')->first();

            if (!$estadoPendiente) {
                throw new \Exception('No se encontró el estado "Pendiente" en la tabla estados.');
            }

            $solicitud = AnalisisLinea::create([
                'tiempo_solicitud' => now(), // Cambiado de 'tiempo'
                'solicitante_id' => auth()->id(), // Cambiado de 'user_id'
                'estado_planta_id' => $estadoPlantaId,
                'estado_id' => $estadoPendiente->id, // Usar ID del estado
            ]);
        });

        return ['success' => 'Solicitud registrada exitosamente'];
    }

    public function completarOrp(int $orpId): void
    {
        DB::transaction(function () use ($orpId) {
            $orp = Orp::findOrFail($orpId);
            $orp->update(['estado' => 'Completado']);

            $estadosProduccion = EstadoPlanta::where('proceso_id', self::PROCESO_PRODUCCION)
                ->where('etapa_id', self::ETAPA_PRODUCCION)
                ->whereHas('estadoDetalles', function ($query) use ($orpId) {
                    $query->where('orp_id', $orpId);
                })
                ->whereIn('id', function ($query) {
                    $query->select(DB::raw('MAX(id)'))
                        ->from('PLL_estado_plantas')
                        ->groupBy('origen_id');
                })
                ->get();

            foreach ($estadosProduccion as $estado) {
                EstadoPlanta::create([
                    'tiempo' => now(),
                    'user_id' => auth()->id(),
                    'origen_id' => $estado->origen_id,
                    'proceso_id' => self::PROCESO_DETENIDO,
                    'etapa_id' => self::ETAPA_PRODUCCION,
                ]);
            }
        });
    }
}
