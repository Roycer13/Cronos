<?php

namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\EstadoPlanta;
use App\Domain\PlantaLacteos\Models\EstadoDetalle;
use Illuminate\Support\Facades\DB;

class EstadoPlantaCopiaService
{
    public function copiarConCambioEtapa(EstadoPlanta $estadoOriginal, int $nuevaEtapaId, ?string $observaciones = null): EstadoPlanta
    {
        return DB::transaction(function () use ($estadoOriginal, $nuevaEtapaId, $observaciones) {
            // Crear nuevo estado planta copiando los datos del original
            $nuevoEstado = EstadoPlanta::create([
                'tiempo' => now(),
                'user_id' => auth()->id(),
                'origen_id' => $estadoOriginal->origen_id,
                'proceso_id' => $estadoOriginal->proceso_id,
                'etapa_id' => $nuevaEtapaId,
                'observaciones' => $observaciones ?? $estadoOriginal->observaciones,
            ]);

            // Copiar todos los detalles del estado original
            foreach ($estadoOriginal->detalles as $detalleOriginal) {
                EstadoDetalle::create([
                    'orp_id' => $detalleOriginal->orp_id,
                    'preparacion' => $detalleOriginal->preparacion,
                    'estado_planta_id' => $nuevoEstado->id,
                    'user_id' => auth()->id(),
                    'cantidad' => $detalleOriginal->cantidad,
                ]);
            }

            return $nuevoEstado->load(['detalles.orp', 'origen', 'proceso', 'etapa', 'user']);
        });
    }

    public function copiarConCambioOrps(EstadoPlanta $estadoOriginal, array $nuevosDetalles, ?string $observaciones = null): EstadoPlanta
    {
        return DB::transaction(function () use ($estadoOriginal, $nuevosDetalles, $observaciones) {
            // Crear nuevo estado planta copiando los datos del original
            $nuevoEstado = EstadoPlanta::create([
                'tiempo' => now(),
                'user_id' => auth()->id(),
                'origen_id' => $estadoOriginal->origen_id,
                'proceso_id' => $estadoOriginal->proceso_id,
                'etapa_id' => $estadoOriginal->etapa_id,
                'observaciones' => $observaciones ?? $estadoOriginal->observaciones,
            ]);

            // Crear nuevos detalles con los ORPs actualizados
            foreach ($nuevosDetalles as $detalle) {
                EstadoDetalle::create([
                    'orp_id' => $detalle['orp_id'],
                    'preparacion' => $detalle['preparacion'] ?? 'Producción',
                    'estado_planta_id' => $nuevoEstado->id,
                    'user_id' => auth()->id(),
                    'cantidad' => $detalle['cantidad'] ?? 0,
                ]);
            }

            return $nuevoEstado->load(['detalles.orp', 'origen', 'proceso', 'etapa', 'user']);
        });
    }

    public function copiarConCambiosCompletos(EstadoPlanta $estadoOriginal, int $nuevaEtapaId, array $nuevosDetalles, ?string $observaciones = null): EstadoPlanta
    {
        return DB::transaction(function () use ($estadoOriginal, $nuevaEtapaId, $nuevosDetalles, $observaciones) {
            // Crear nuevo estado planta con todos los cambios
            $nuevoEstado = EstadoPlanta::create([
                'tiempo' => now(),
                'user_id' => auth()->id(),
                'origen_id' => $estadoOriginal->origen_id,
                'proceso_id' => $estadoOriginal->proceso_id,
                'etapa_id' => $nuevaEtapaId,
                'observaciones' => $observaciones ?? $estadoOriginal->observaciones,
            ]);

            // Crear nuevos detalles
            foreach ($nuevosDetalles as $detalle) {
                EstadoDetalle::create([
                    'orp_id' => $detalle['orp_id'],
                    'preparacion' => $detalle['preparacion'] ?? 'Producción',
                    'estado_planta_id' => $nuevoEstado->id,
                    'user_id' => auth()->id(),
                    'cantidad' => $detalle['cantidad'] ?? 0,
                ]);
            }

            return $nuevoEstado->load(['detalles.orp', 'origen', 'proceso', 'etapa', 'user']);
        });
    }
}