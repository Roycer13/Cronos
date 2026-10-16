<?php

namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\EstadoPlanta;
use App\Domain\PlantaLacteos\Models\EstadoDetalle;
use App\Domain\PlantaLacteos\Models\Origen;
use App\Domain\ModulosComunes\Orp\Models\Orp;
use App\Domain\PlantaLacteos\Models\AnalisisLinea;
use App\Domain\PlantaLacteos\Models\SolicitudAnalisisLinea;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EstadoPlantaService
{
   public function createEstadoPlanta(array $data): EstadoPlanta
    {
        return DB::transaction(function () use ($data) {
            // Verificar si es operación de pasteurización
            $esPasteurizacion = isset($data['pasteurizador_id']) && isset($data['origen_id_pasteurizacion']);

            if ($esPasteurizacion) {
                return $this->createPasteurizacion($data);
            }

            // Crear el estado_planta normal
            $estadoPlanta = EstadoPlanta::create([
                'tiempo' => now(),
                'user_id' => auth()->id(),
                'origen_id' => $data['origen_id'],
                'proceso_id' => $data['proceso_id'],
                'etapa_id' => $data['etapa_id'],
                'observaciones' => $data['observaciones'] ?? null,
            ]);

            // Si hay detalles, crearlos
            if (isset($data['detalles']) && is_array($data['detalles']) && count($data['detalles']) > 0) {
                foreach ($data['detalles'] as $detalle) {
                    EstadoDetalle::create([
                        'orp_id' => $detalle['orp_id'],
                        'preparacion' => $detalle['preparacion'] ?? 'Producción',
                        'estado_planta_id' => $estadoPlanta->id,
                        'user_id' => auth()->id(),
                        'cantidad' => $detalle['cantidad'] ?? 0,
                    ]);
                }
            }

            return $estadoPlanta->load('detalles.orp');
        });
    }

     /**
     * Crear registros de pasteurización (entrada y salida)
     */
    protected function createPasteurizacion(array $data): EstadoPlanta
    {
        // Validar que los IDs necesarios existan
        if (!isset($data['pasteurizador_id']) || !isset($data['origen_id_pasteurizacion'])) {
            throw new \Exception('ID de pasteurizador o destino faltante');
        }

        // Buscar el estado "Producción"
        $produccionId = Estado::where('nombre', 'Produccion')->value('id');

        if (!$produccionId) {
            throw new \Exception('No se encontró el estado "Producción"');
        }

        // Obtener información de los orígenes para observaciones descriptivas
        $pasteurizador = Origen::find($data['pasteurizador_id']);
        $origenDestino = Origen::find($data['origen_id_pasteurizacion']);

        if (!$pasteurizador || !$origenDestino) {
            throw new \Exception('No se encontraron los orígenes especificados');
        }

        // Crear el registro del pasteurizador (origen = pasteurizador)
        // Este registra la ENTRADA al pasteurizador
        $estadoPasteurizador = EstadoPlanta::create([
            'tiempo' => now(),
            'user_id' => auth()->id(),
            'origen_id' => $data['pasteurizador_id'], // El pasteurizador como origen
            'proceso_id' => $produccionId,
            'etapa_id' => 31,
            'observaciones' => "Pasteurización - Entrada: Producto entra a {$pasteurizador->alias}",
        ]);

        // Crear los detalles para el pasteurizador (misma ORP)
        if (isset($data['detalles']) && is_array($data['detalles']) && count($data['detalles']) > 0) {
            foreach ($data['detalles'] as $detalle) {
                EstadoDetalle::create([
                    'orp_id' => $detalle['orp_id'],
                    'preparacion' => $detalle['preparacion'] ?? 'Producción',
                    'estado_planta_id' => $estadoPasteurizador->id,
                    'user_id' => auth()->id(),
                    'cantidad' => $detalle['cantidad'] ?? 0,
                ]);
            }
        }

        // Crear el registro del tanque destino (origen = tanque destino)
        // Este registra la SALIDA del pasteurizador
        $estadoDestino = EstadoPlanta::create([
            'tiempo' => now(),
            'user_id' => auth()->id(),
            'origen_id' => $data['origen_id_pasteurizacion'], // El tanque destino
            'proceso_id' => $produccionId,
            'etapa_id' => $data['etapa_id'],
            'observaciones' => "Pasteurización - Salida: Producto va de {$pasteurizador->alias} a {$origenDestino->alias}",
        ]);

        // Crear los detalles para el tanque destino (misma ORP)
        if (isset($data['detalles']) && is_array($data['detalles']) && count($data['detalles']) > 0) {
            foreach ($data['detalles'] as $detalle) {
                EstadoDetalle::create([
                    'orp_id' => $detalle['orp_id'],
                    'preparacion' => $detalle['preparacion'] ?? 'Producción',
                    'estado_planta_id' => $estadoDestino->id,
                    'user_id' => auth()->id(),
                    'cantidad' => $detalle['cantidad'] ?? 0,
                ]);
            }
        }

        Log::info('Pasteurización creada exitosamente', [
            'pasteurizador_id' => $data['pasteurizador_id'],
            'pasteurizador_alias' => $pasteurizador->alias,
            'destino_id' => $data['origen_id_pasteurizacion'],
            'destino_alias' => $origenDestino->alias,
            'estado_planta_entrada_id' => $estadoPasteurizador->id,
            'estado_planta_salida_id' => $estadoDestino->id,
            'user_id' => auth()->id(),
        ]);

        // Devolver el registro del destino como principal (o el que prefieras)
        return $estadoDestino->load('detalles.orp');
    }

    public function updateEstadoPlanta(EstadoPlanta $estadoPlanta, array $data): EstadoPlanta
    {
        return DB::transaction(function () use ($estadoPlanta, $data) {
            // Actualizar el estado_planta
            $estadoPlanta->update([
                'origen_id' => $data['origen_id'],
                'proceso_id' => $data['proceso_id'],
                'etapa_id' => $data['etapa_id'],
                'observaciones' => $data['observaciones'] ?? null,
            ]);

            // Si hay detalles, actualizarlos (eliminar antiguos y crear nuevos)
            if (isset($data['detalles']) && is_array($data['detalles'])) {
                // Eliminar los detalles antiguos
                $estadoPlanta->detalles()->delete();

                foreach ($data['detalles'] as $detalle) {
                    EstadoDetalle::create([
                        'orp_id' => $detalle['orp_id'],
                        'preparacion' => $detalle['preparacion'] ?? 'Producción',
                        'estado_planta_id' => $estadoPlanta->id, // ✅ USAR EL ID EXISTENTE
                        'user_id' => auth()->id(),
                        'cantidad' => $detalle['cantidad'] ?? 0,
                    ]);
                }
            } else {
                // Si no hay detalles, eliminarlos
                $estadoPlanta->detalles()->delete();
            }

            return $estadoPlanta->load('detalles.orp');
        });
    }

    // ... el resto de tus métodos permanecen igual
    public function deleteEstadoPlanta(EstadoPlanta $estadoPlanta): void
    {
        DB::transaction(function () use ($estadoPlanta) {
            $estadoPlanta->detalles()->delete();
            $estadoPlanta->delete();
        });
    }

    public function getProduccionId(): int
    {
        return Estado::where('nombre', 'Produccion')->value('id') ?? 7;
    }

    public function solicitarAnalisis(EstadoPlanta $estadoPlanta, $peso = null): bool
    {
        return DB::transaction(function () use ($estadoPlanta, $peso) {

            $estadoPendiente = Estado::where('nombre', 'Pendiente')->firstOrFail();

            $existePendiente = AnalisisLinea::where('estado_planta_id', $estadoPlanta->id)
                ->where('estado_id', $estadoPendiente->id)
                ->exists();


            AnalisisLinea::create([
                'tiempo_solicitud' => now(),
                'solicitante_id' => auth()->id(),
                'estado_planta_id' => $estadoPlanta->id,
                'estado_id' => $estadoPendiente->id,
                'peso' => $peso,
            ]);

            return true; // 🟢 SI se creó
        });
    }
}
