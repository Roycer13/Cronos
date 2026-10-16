<?php

namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\DispositivoTemperatura;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class DispositivoTemperaturaService
{
    public function listar(array $filtros = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = DispositivoTemperatura::with(['dispositivoMedicion', 'usuario', 'estado']);

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

        if (!empty($filtros['error_mayor_a'])) {
            $query->conErrorMayorA((float) $filtros['error_mayor_a']);
        }

        $query->ordenarPorFecha($filtros['orden'] ?? 'desc');

        return $query->paginate($perPage);
    }

    public function crear(array $data): DispositivoTemperatura
    {
        $data['user_id'] = auth()->id();

        if (!empty($data['fecha_hora'])) {
            $data['fecha_hora'] = \Carbon\Carbon::parse($data['fecha_hora'])->format('Y-m-d H:i:s');
        } else {
            $data['fecha_hora'] = now()->format('Y-m-d H:i:s');
        }

        return DB::transaction(function () use ($data) {
            return DispositivoTemperatura::create($data);
        });
    }

    public function actualizar(DispositivoTemperatura $temperatura, array $data): bool
    {
        if (array_key_exists('fecha_hora', $data) && !empty($data['fecha_hora'])) {
            $data['fecha_hora'] = \Carbon\Carbon::parse($data['fecha_hora'])->format('Y-m-d H:i:s');
        }

        return DB::transaction(function () use ($temperatura, $data) {
            return $temperatura->update($data);
        });
    }

    public function eliminar(DispositivoTemperatura $temperatura): ?bool
    {
        return DB::transaction(function () use ($temperatura) {
            return $temperatura->delete();
        });
    }

    public function obtenerPorId(int $id): ?DispositivoTemperatura
    {
        return DispositivoTemperatura::with(['dispositivoMedicion', 'usuario', 'estado'])->find($id);
    }

    public function calcularEstadisticasErrores(?string $fechaInicio, ?string $fechaFin): array
    {
        $query = DispositivoTemperatura::query();

        if ($fechaInicio || $fechaFin) {
            $query->filtrarPorFechas($fechaInicio, $fechaFin);
        }

        return [
            'error_1_promedio' => $query->average('error_1'),
            'error_1_maximo' => $query->max('error_1'),
            'error_2_promedio' => $query->average('error_2'),
            'error_2_maximo' => $query->max('error_2'),
            'error_3_promedio' => $query->average('error_3'),
            'error_3_maximo' => $query->max('error_3'),
            'total_registros' => $query->count(),
        ];
    }
}