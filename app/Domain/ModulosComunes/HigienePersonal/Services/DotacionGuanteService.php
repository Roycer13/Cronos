<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Services;

use App\Domain\ModulosComunes\HigienePersonal\Models\DotacionGuante;
use App\Domain\Sistema\Configuracion\Models\Estado ;
use Illuminate\Support\Facades\DB;

class DotacionGuanteService
{
    /**
     * Obtiene el ID del estado según el nombre.
     * Puedes cachear estos IDs para mejorar rendimiento.
     */
    protected function getEstadoIdByName(string $nombre): ?int
    {
        $estado = Estado::where('nombre', $nombre)->first();
        return $estado ? $estado->id : null;
    }

    /**
     * Determina el estado_id automáticamente según tiempo_devolucion.
     */
    protected function determinarEstadoId(?string $tiempoDevolucion): ?int
    {
        if (empty($tiempoDevolucion)) {
            return $this->getEstadoIdByName('Completado');
        }
        return $this->getEstadoIdByName('Pendiente');
    }

    public function crearRegistro(array $data, $encargado): DotacionGuante
    {
        return DB::transaction(function () use ($data, $encargado) {
            // Determinar estado automáticamente si no viene enviado
            $estadoId = $data['estado_id'] ?? $this->determinarEstadoId($data['tiempo_devolucion'] ?? null);

            return DotacionGuante::create([
                'user_id'            => $data['user_id'],
                'user_encargado_id'  => $encargado->id,
                'tiempo'             => $data['tiempo'],
                'tipo'               => $data['tipo'],
                'amarillo_naranja'   => $data['amarillo_naranja'] ?? false,
                'azul'               => $data['azul'] ?? false,
                'naranja'            => $data['naranja'] ?? false,
                'alta_temperatura'   => $data['alta_temperatura'] ?? false,
                'observaciones'      => $data['observaciones'] ?? null,
                'tiempo_devolucion'  => $data['tiempo_devolucion'] ?? null,
                'estado_id'          => $estadoId,
            ]);
        });
    }

    public function actualizarRegistro(DotacionGuante $dotacion, array $data): DotacionGuante
    {
        return DB::transaction(function () use ($dotacion, $data) {
            // Determinar estado automáticamente si no viene enviado
            $estadoId = $data['estado_id'] ?? $this->determinarEstadoId($data['tiempo_devolucion'] ?? null);

            $dotacion->update([
                'user_id'            => $data['user_id'],
                'tiempo'             => $data['tiempo'],
                'tipo'               => $data['tipo'],
                'amarillo_naranja'   => $data['amarillo_naranja'] ?? false,
                'azul'               => $data['azul'] ?? false,
                'naranja'            => $data['naranja'] ?? false,
                'alta_temperatura'   => $data['alta_temperatura'] ?? false,
                'observaciones'      => $data['observaciones'] ?? null,
                'tiempo_devolucion'  => $data['tiempo_devolucion'] ?? null,
                'estado_id'          => $estadoId,
            ]);

            return $dotacion->fresh();
        });
    }
}
