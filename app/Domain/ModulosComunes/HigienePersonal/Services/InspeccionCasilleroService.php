<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Services;

use App\Domain\ModulosComunes\HigienePersonal\Models\InspeccionCasillero;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Support\Facades\DB;

class InspeccionCasilleroService
{
    /**
     * Crear una nueva inspección de casillero.
     */
    public function crearRegistro(array $data, $supervisor): InspeccionCasillero
{
    // Obtener empleado
    $empleado = User::find($data['user_id']);
    if (!$empleado) {
        throw new \Exception('Empleado no encontrado');
    }

    return DB::transaction(function () use ($data, $supervisor, $empleado) {
        return InspeccionCasillero::create([
            'ubicacion_id'      => $supervisor->ubicacion_id,
            'user_id'           => $data['user_id'],
            'turno'             => $empleado->turno, // ← asignado
            'fecha'             => $data['fecha'],
            'orden'             => $data['orden'],
            'limpieza'          => $data['limpieza'],
            'implementos_aseo'  => $data['implementos_aseo'],
            'observacion'       => $data['observacion'] ?? null,
            'correcion'         => $data['correccion'] ?? null,
            'inspector1_id'     => $data['inspector1_id'] ?? null,
            'inspector2_id'     => $data['inspector2_id'] ?? null,
            'inspector3_id'     => $data['inspector3_id'] ?? null,
        ]);
    });
}

    /**
     * Actualizar una inspección existente.
     */
    public function actualizarRegistro(InspeccionCasillero $inspeccion, array $data): InspeccionCasillero
    {
        return DB::transaction(function () use ($inspeccion, $data) {
            $inspeccion->update([
                'fecha'             => $data['fecha'] ?? $inspeccion->fecha,
                'orden'             => $data['orden'] ?? $inspeccion->orden,
                'limpieza'          => $data['limpieza'] ?? $inspeccion->limpieza,
                'implementos_aseo'  => $data['implementos_aseo'] ?? $inspeccion->implementos_aseo,
                'observacion'       => $data['observacion'] ?? $inspeccion->observacion,
                'correcion'         => $data['correccion'] ?? $inspeccion->correcion,
                'inspector1_id'     => $data['inspector1_id'] ?? $inspeccion->inspector1_id,
                'inspector2_id'     => $data['inspector2_id'] ?? $inspeccion->inspector2_id,
                'inspector3_id'     => $data['inspector3_id'] ?? $inspeccion->inspector3_id,
            ]);
            return $inspeccion->fresh();
        });
    }

    /**
     * Eliminar una inspección (soft delete).
     */
    public function eliminarRegistro(InspeccionCasillero $inspeccion): void
    {
        $inspeccion->delete();
    }

    /**
     * Generar estadísticas para el dashboard o reportes.
     */
    public function generarEstadisticas($query): array
    {
        $registros = $query->get();

        $total      = $registros->count();
        $conformes  = $registros->filter(fn($r) => $r->conforme)->count();
        $noConformes = $total - $conformes;

        $porcentaje = $total > 0 ? round(($conformes / $total) * 100) : 0;

        return [
            'total'               => $total,
            'conformes'           => $conformes,
            'no_conformes'        => $noConformes,
            'porcentaje_conformidad' => $porcentaje,
        ];
    }
}
