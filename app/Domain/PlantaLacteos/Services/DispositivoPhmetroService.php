<?php

namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\DispositivoPhmetro;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class DispositivoPhmetroService
{
    public function listar(array $filtros = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = DispositivoPhmetro::with(['dispositivoMedicion', 'usuario', 'estado']);

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

        $query->ordenarPorFecha($filtros['orden'] ?? 'desc');

        return $query->paginate($perPage);
    }

    public function crear(array $data): DispositivoPhmetro
    {
        $data['user_id'] = auth()->id();

        if (!empty($data['fecha_hora'])) {
            $data['fecha_hora'] = \Carbon\Carbon::parse($data['fecha_hora'])->format('Y-m-d H:i:s');
        } else {
            $data['fecha_hora'] = now()->format('Y-m-d H:i:s');
        }

        return DB::transaction(function () use ($data) {
            return DispositivoPhmetro::create($data);
        });
    }

    public function actualizar(DispositivoPhmetro $phmetro, array $data): DispositivoPhmetro
    {
        if (array_key_exists('fecha_hora', $data) && !empty($data['fecha_hora'])) {
            $data['fecha_hora'] = \Carbon\Carbon::parse($data['fecha_hora'])->format('Y-m-d H:i:s');
        }

        return DB::transaction(function () use ($phmetro, $data) {
            $phmetro->update($data);
            return $phmetro->fresh()->load(['dispositivoMedicion', 'usuario', 'estado']);
        });
    }

    public function eliminar(DispositivoPhmetro $phmetro): bool
    {
        return DB::transaction(function () use ($phmetro) {
            return $phmetro->delete();
        });
    }

    public function obtenerPorId(int $id): ?DispositivoPhmetro
    {
        return DispositivoPhmetro::with(['dispositivoMedicion', 'usuario', 'estado'])->find($id);
    }

    public function obtenerPromedioTemperaturas(?string $fechaInicio, ?string $fechaFin): array
    {
        $query = DispositivoPhmetro::query();

        if ($fechaInicio || $fechaFin) {
            $query->filtrarPorFechas($fechaInicio, $fechaFin);
        }

        return [
            'temperatura1_promedio' => $query->average('verificacion_temperatura1'),
            'temperatura2_promedio' => $query->average('verificacion_temperatura2'),
            'temperatura3_promedio' => $query->average('verificacion_temperatura3'),
            'ph_4_promedio' => $query->average('verificacion_4'),
            'ph_7_promedio' => $query->average('verificacion_7'),
            'ph_10_promedio' => $query->average('verificacion_10'),
        ];
    }
}