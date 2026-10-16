<?php

namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\DispositivoRefractometro;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class DispositivoRefractometroService
{
    public function listar(array $filtros = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = DispositivoRefractometro::with(['dispositivoMedicion', 'usuario', 'estado']);

        // Aplicar filtros
        if (!empty($filtros['fecha_inicio']) || !empty($filtros['fecha_fin'])) {
            $query->filtrarPorFechas($filtros['fecha_inicio'] ?? null, $filtros['fecha_fin'] ?? null);
        }

        if (!empty($filtros['dispositivos_medicion_id'])) {
            $query->filtrarPorDispositivo($filtros['dispositivos_medicion_id']);
        }

        if (!empty($filtros['estado_id'])) {
            $query->filtrarPorEstado($filtros['estado_id']);
        }

        if (!empty($filtros['user_id'])) {
            $query->filtrarPorUsuario($filtros['user_id']);
        }

        if (!empty($filtros['requiere_ajuste'])) {
            $query->conAjusteRequerido();
        }

        // Ordenar por fecha más reciente por defecto
        $query->ordenarPorFecha($filtros['orden'] ?? 'desc');

        return $query->paginate($perPage);
    }

    public function crear(array $data): DispositivoRefractometro
    {
        $data['user_id'] = auth()->id();

        if (!empty($data['fecha_hora'])) {
            $data['fecha_hora'] = \Carbon\Carbon::parse($data['fecha_hora'])->format('Y-m-d H:i:s');
        } else {
            $data['fecha_hora'] = now()->format('Y-m-d H:i:s');
        }

        return DB::transaction(function () use ($data) {
            return DispositivoRefractometro::create($data);
        });
    }

    public function actualizar(DispositivoRefractometro $refractometro, array $data): DispositivoRefractometro
    {
        if (array_key_exists('fecha_hora', $data) && !empty($data['fecha_hora'])) {
            $data['fecha_hora'] = \Carbon\Carbon::parse($data['fecha_hora'])->format('Y-m-d H:i:s');
        }

        return DB::transaction(function () use ($refractometro, $data) {
            $refractometro->update($data);
            return $refractometro->fresh()->load(['dispositivoMedicion', 'usuario', 'estado']);
        });
    }

    public function eliminar(DispositivoRefractometro $refractometro): bool
    {
        return DB::transaction(function () use ($refractometro) {
            return $refractometro->delete();
        });
    }

    public function obtenerPorId(int $id): ?DispositivoRefractometro
    {
        return DispositivoRefractometro::with(['dispositivoMedicion', 'usuario', 'estado'])->find($id);
    }

    public function obtenerEstadisticas(?string $fechaInicio, ?string $fechaFin): array
    {
        $query = DispositivoRefractometro::query();

        if ($fechaInicio || $fechaFin) {
            $query->filtrarPorFechas($fechaInicio, $fechaFin);
        }

        $total = $query->count();
        $conAjuste = $query->clone()->conAjusteRequerido()->count();
        $sinAjuste = $total - $conAjuste;

        return [
            'total_registros' => $total,
            'con_ajuste_requerido' => $conAjuste,
            'sin_ajuste_requerido' => $sinAjuste,
            'porcentaje_ajuste' => $total > 0 ? round(($conAjuste / $total) * 100, 2) : 0,
        ];
    }
}