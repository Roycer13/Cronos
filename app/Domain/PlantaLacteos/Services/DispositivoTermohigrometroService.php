<?php
namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\DispositivoTermohigrometro;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class DispositivoTermohigrometroService
{
    public function listar(array $filtros = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = DispositivoTermohigrometro::with(['dispositivoMedicion', 'usuario', 'estado']);

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

    public function crear(array $data): DispositivoTermohigrometro
    {
        $data['user_id'] = auth()->id();
        if (empty($data['fecha_hora'])) {
            $data['fecha_hora'] = now()->format('Y-m-d H:i:s');
        } else {
            $data['fecha_hora'] = \Carbon\Carbon::parse($data['fecha_hora'])->format('Y-m-d H:i:s');
        }

        return DB::transaction(function () use ($data) {
            return DispositivoTermohigrometro::create($data);
        });
    }

    public function actualizar(DispositivoTermohigrometro $termohigrometro, array $data): DispositivoTermohigrometro
    {
        if (!empty($data['fecha_hora'])) {
            $data['fecha_hora'] = \Carbon\Carbon::parse($data['fecha_hora'])->format('Y-m-d H:i:s');
        }

        return DB::transaction(function () use ($termohigrometro, $data) {
            $termohigrometro->update($data);
            return $termohigrometro->fresh()->load(['dispositivoMedicion', 'usuario', 'estado']);
        });
    }

    public function eliminar(DispositivoTermohigrometro $termohigrometro): bool
    {
        return DB::transaction(function () use ($termohigrometro) {
            return $termohigrometro->delete();
        });
    }

    public function obtenerPorId(int $id): ?DispositivoTermohigrometro
    {
        return DispositivoTermohigrometro::with(['dispositivoMedicion', 'usuario', 'estado'])->find($id);
    }
}