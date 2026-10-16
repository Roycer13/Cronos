<?php

namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\AnalisisLinea;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Support\Facades\DB;

class AnalisisLineaService
{
    public function updateAnalisis(AnalisisLinea $analisisLinea, array $data): AnalisisLinea
    {
        return DB::transaction(function () use ($analisisLinea, $data) {
            // Preparar datos para actualización
            $updateData = [
                'tiempo_analisis' => now(),
                'analista_id' => auth()->id(),
                'estado_id' => $this->getEstadoId('Completado'),
            ];

            // Agregar solo los campos que están presentes en los datos
            $camposAnalisis = [
                'temperatura',
                'ph',
                'acidez', 
                'brix',
                'viscosidad',
                'densidad',
                'color',
                'olor',
                'sabor',
                'aspecto',
                'observaciones',
            ];

            foreach ($camposAnalisis as $campo) {
                if (array_key_exists($campo, $data)) {
                    $updateData[$campo] = $data[$campo];
                }
            }

            $analisisLinea->update($updateData);

            return $analisisLinea;
        });
    }

    public function deleteAnalisisLinea(AnalisisLinea $analisisLinea): bool
    {
        return DB::transaction(function () use ($analisisLinea) {
            return $analisisLinea->delete();
        });
    }

    /**
     * Obtener el ID del estado por nombre
     */
    private function getEstadoId(string $nombreEstado): int
    {
        static $estadosCache = [];

        if (isset($estadosCache[$nombreEstado])) {
            return $estadosCache[$nombreEstado];
        }

        $estado = Estado::where('nombre', $nombreEstado)->first();
        
        if (!$estado) {
            $estado = Estado::create([
                'nombre' => $nombreEstado,
                'descripcion' => 'Estado para análisis de línea',
                'color' => '#9ca3af'
            ]);
        }
        
        $estadosCache[$nombreEstado] = $estado->id;
        return $estado->id;
    }
}