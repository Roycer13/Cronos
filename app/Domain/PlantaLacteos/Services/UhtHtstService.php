<?php

namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\AnalisisLinea;
use App\Domain\ModulosComunes\Orp\Models\Orp;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class UhtHtstService
{
    /**
     * Obtener datos para tabla de pesos según tipo (UHT/HTST)
     */
    public function getPesosData(string $tipo): Collection
    {
        return AnalisisLinea::query()
            ->join('PLL_estado_plantas as ep', 'PLL_analisis_linea.estado_planta_id', '=', 'ep.id')
            ->join('PLL_origenes as o', 'ep.origen_id', '=', 'o.id')
            ->join('PLL_estado_detalles as ed', 'ep.id', '=', 'ed.estado_planta_id')
            ->join('orps as orp', 'ed.orp_id', '=', 'orp.id')
            ->join('producto_terminados as pt', 'orp.producto_terminado_id', '=', 'pt.id')
            ->join('lineas as l', 'pt.linea_id', '=', 'l.id')
            ->where('l.nombre', $tipo)
            ->where('o.descripcion', 'like', '%ENVASADORA%')
            ->where(function ($query) {
                $query->whereNull('PLL_analisis_linea.peso')
                    ->orWhere('PLL_analisis_linea.updated_at', '>=', now()->subMinutes(15));
            })
            ->where('PLL_analisis_linea.created_at', '>=', now()->subHours(3))
            ->select(
                'PLL_analisis_linea.id',
                'orp.codigo as orp_codigo',
                'pt.nombre_comercial as producto_nombre',
                'ed.preparacion',
                'o.alias as cabezal',
                'PLL_analisis_linea.peso'
            )
            ->get();
    }

    /**
     * Obtener datos para tabla de temperaturas (solo UHT)
     */
    public function getTemperaturasData(string $tipo): Collection
    {
        if ($tipo !== 'UHT') {
            return collect();
        }

        return AnalisisLinea::query()
            ->join('PLL_estado_plantas as ep', 'PLL_analisis_linea.estado_planta_id', '=', 'ep.id')
            ->join('PLL_origenes as o', 'ep.origen_id', '=', 'o.id')
            ->join('PLL_estado_detalles as ed', 'ep.id', '=', 'ed.estado_planta_id')
            ->join('orps as orp', 'ed.orp_id', '=', 'orp.id')
            ->join('producto_terminados as pt', 'orp.producto_terminado_id', '=', 'pt.id')
            ->join('lineas as l', 'pt.linea_id', '=', 'l.id')
            ->join('destinos as d', 'pt.destino_id', '=', 'd.id') // Ajusta si la tabla se llama diferente
            ->where('l.nombre', $tipo)
            ->where('o.descripcion', 'like', '%ENVASADORA%')
            ->where('d.nombre', 'DE - La Paz')
            ->whereNull('PLL_analisis_linea.tempUHT')
            ->where('PLL_analisis_linea.created_at', '>=', now()->subHours(3))
            ->select(
                'PLL_analisis_linea.id',
                'orp.codigo as orp_codigo',
                'pt.nombre_comercial as producto_nombre',
                'ed.preparacion',
                'o.alias as cabezal',
                'PLL_analisis_linea.tempUHT'
            )
            ->get();
    }

    /**
     * Obtener datos para tabla de vencimientos según tipo
     */
    public function getVencimientosData(string $tipo): Collection
    {
        return Orp::where(function ($query) {
            $query->whereNull('fecha_vencimiento1')
                ->orWhere('updated_at', '>=', now()->subMinutes(120));
        })
            ->whereHas('productoTerminado.linea', function ($query) use ($tipo) {
                $query->where('nombre', $tipo);
            })
            ->enProceso()
            ->with(['productoTerminado:id,nombre_comercial,nombre_sap']) // solo columnas necesarias
            ->get()
            ->map(function ($orp) {
                return [
                    'id' => $orp->id,
                    'codigo' => $orp->codigo,
                    'producto_nombre' => $orp->productoTerminado?->nombre_comercial ?? $orp->productoTerminado?->nombre_sap,
                    'preparacion' => $orp->lote,
                    'fecha_vencimiento1' => $orp->fecha_vencimiento1,
                ];
            });
    }
}
