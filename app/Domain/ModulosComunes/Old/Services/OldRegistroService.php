<?php

namespace App\Domain\ModulosComunes\Old\Services;


use App\Domain\ModulosComunes\Old\Models\OldRegistro;
use Illuminate\Database\Eloquent\Builder;

class OldRegistroService
{
    /**
     * Crear registro
     */
    public function create(array $data, $user): OldRegistro
    {
        return OldRegistro::create([
            ...$data,
            'user_id' => $user->id,
            'tiempo_realizado' => now(),
        ]);
    }

    /**
     * Aplicar filtros dinámicos
     */
    public function aplicarFiltros(Builder $query, array $filtros): Builder
    {
        if (!empty($filtros['fecha_desde'])) {
            $query->whereDate('tiempo_realizado', '>=', $filtros['fecha_desde']);
        }

        if (!empty($filtros['fecha_hasta'])) {
            $query->whereDate('tiempo_realizado', '<=', $filtros['fecha_hasta']);
        }

        if (!empty($filtros['item_id'])) {
            $query->where('old_item_id', $filtros['item_id']);
        }

        if (!empty($filtros['user_id'])) {
            $query->where('user_id', $filtros['user_id']);
        }

        // 🔥 filtro por tipo dinámico
        if (!empty($filtros['tipo'])) {
            $query->where($filtros['tipo'], true);
        }

        return $query;
    }

    /**
     * Estadísticas básicas
     */
    public function estadisticas(Builder $query): array
    {
        return [
            'total' => $query->count(),
            'orden' => (clone $query)->where('orden', true)->count(),
            'limpieza' => (clone $query)->where('limpieza', true)->count(),
            'desinfeccion' => (clone $query)->where('desinfeccion', true)->count(),
        ];
    }
    public function createMasivo(array $items, $user)
    {
        foreach ($items as $item) {

            OldRegistro::create([
                'old_item_id' => $item['id'],
                'user_id' => $item['user_id'],
                'revisor_id' => $user->id,

                'orden' => $item['orden'] ?? false,
                'limpieza' => $item['limpieza'] ?? false,
                'desinfeccion' => $item['desinfeccion'] ?? false,

                'observacion' => $item['observacion'] ?? null,
                'correcion' => $item['correcion'] ?? null,

                'tiempo_realizado' => $item['fecha'] ?? now(),
            ]);
        }
    }
}
