<?php

namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\DispositivoCrioscopo;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class DispositivoCrioscopoService
{
    public function listar(array $filtros = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = DispositivoCrioscopo::with(['dispositivoMedicion', 'usuario', 'estado']);

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

        if (!empty($filtros['punto_ajuste_a'])) {
            $query->conPuntoAjusteA();
        }

        if (!empty($filtros['punto_ajuste_b'])) {
            $query->conPuntoAjusteB();
        }

        $query->ordenarPorFecha($filtros['orden'] ?? 'desc');

        return $query->paginate($perPage);
    }

    public function crear(array $data): DispositivoCrioscopo
    {
        $data['user_id'] = auth()->id();

        if (!empty($data['fecha_hora'])) {
            $data['fecha_hora'] = \Carbon\Carbon::parse($data['fecha_hora'])->format('Y-m-d H:i:s');
        } else {
            $data['fecha_hora'] = now()->format('Y-m-d H:i:s');
        }

        return DB::transaction(function () use ($data) {
            return DispositivoCrioscopo::create($data);
        });
    }

    public function actualizar(DispositivoCrioscopo $crioscopo, array $data): bool
    {
        if (array_key_exists('fecha_hora', $data) && !empty($data['fecha_hora'])) {
            $data['fecha_hora'] = \Carbon\Carbon::parse($data['fecha_hora'])->format('Y-m-d H:i:s');
        }

        return DB::transaction(function () use ($crioscopo, $data) {
            return $crioscopo->update($data);
        });
    }

    public function eliminar(DispositivoCrioscopo $crioscopo): ?bool
    {
        return DB::transaction(function () use ($crioscopo) {
            return $crioscopo->delete();
        });
    }

    public function obtenerPorId(int $id): ?DispositivoCrioscopo
    {
        return DispositivoCrioscopo::with(['dispositivoMedicion', 'usuario', 'estado'])->find($id);
    }

    public function obtenerEstadisticasAjustes(?string $fechaInicio, ?string $fechaFin): array
    {
        $query = DispositivoCrioscopo::query();

        if ($fechaInicio || $fechaFin) {
            $query->filtrarPorFechas($fechaInicio, $fechaFin);
        }

        $total = $query->count();
        $conAjusteA = $query->clone()->conPuntoAjusteA()->count();
        $conAjusteB = $query->clone()->conPuntoAjusteB()->count();

        return [
            'total_registros' => $total,
            'con_punto_ajuste_a' => $conAjusteA,
            'con_punto_ajuste_b' => $conAjusteB,
            'porcentaje_ajuste_a' => $total > 0 ? round(($conAjusteA / $total) * 100, 2) : 0,
            'porcentaje_ajuste_b' => $total > 0 ? round(($conAjusteB / $total) * 100, 2) : 0,
        ];
    }
}