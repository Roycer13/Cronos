<?php

namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\RecepcionMateriaPrima;

class InformeMateriaPrimaService
{
    private const FILTROS = [
        'fecha_desde',
        'fecha_hasta',
        'item_materia_prima_id',
        'proveedor_materia_prima_id',
        'almacen_materia_prima_id',
        'estado_id',
        'liberacion_id',
    ];

    /** Agregados comunes: recepciones, kg y recepciones sin kg registrados. */
    private const AGREGADOS = 'COUNT(*) as recepciones, '
        . 'COALESCE(SUM(cantidad_recepcionada_total_kg), 0) as total_kg, '
        . 'SUM(CASE WHEN cantidad_recepcionada_total_kg IS NULL THEN 1 ELSE 0 END) as sin_kg';

    /**
     * Consulta base: misma regla de alcance que el resto del módulo
     * (no admin => solo su ubicación) más los filtros del modelo.
     */
    public function base(array $filtros, ?int $ubicacionId)
    {
        return RecepcionMateriaPrima::query()
            ->when($ubicacionId, fn ($q) => $q->where('ubicacion_id', $ubicacionId))
            ->filter(array_intersect_key($filtros, array_flip(self::FILTROS)));
    }

    public function resumen(array $filtros, ?int $ubicacionId): array
    {
        $agregar = fn (string $columna, array $relaciones) => $this->base($filtros, $ubicacionId)
            ->selectRaw($columna . ', ' . self::AGREGADOS)
            ->groupBy($columna)
            ->with($relaciones)
            ->orderByDesc('total_kg')
            ->get();

        return [
            'general' => $this->base($filtros, $ubicacionId)->selectRaw(self::AGREGADOS)->first(),
            'por_item' => $agregar('item_materia_prima_id', ['itemMateriaPrima:id,nombre']),
            'por_proveedor' => $agregar('proveedor_materia_prima_id', ['proveedorMateriaPrima:id,nombre']),
            'por_estado' => $agregar('estado_id', ['estado:id,nombre']),
        ];
    }

    private function consultaDetalle(array $filtros, ?int $ubicacionId)
    {
        return $this->base($filtros, $ubicacionId)
            ->with([
                'itemMateriaPrima:id,nombre',
                'proveedorMateriaPrima:id,nombre',
                'estado:id,nombre',
                'liberacion:id,nombre',
                'recepcionLotes:id,recepcion_materia_prima_id,lote,fecha_vencimiento,cantidad_recepcionada_total_kg',
            ])
            ->orderByDesc('tiempo');
    }

    public function detalle(array $filtros, ?int $ubicacionId, int $perPage = 10)
    {
        return $this->consultaDetalle($filtros, $ubicacionId)
            ->paginate($perPage)
            ->withQueryString();
    }

    /** Todas las filas del filtro (para el reporte impreso), con tope de seguridad. */
    public function detalleCompleto(array $filtros, ?int $ubicacionId, int $limite = 3000)
    {
        return $this->consultaDetalle($filtros, $ubicacionId)->limit($limite)->get();
    }
}
