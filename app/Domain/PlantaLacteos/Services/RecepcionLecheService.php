<?php

namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\RecepcionLeche;
use App\Domain\PlantaLacteos\Models\AnalisisLeche;
use App\Domain\PlantaLacteos\Models\HigieneAcopio;
use App\Domain\PlantaLacteos\Models\SubRutaAcopio;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Support\Facades\DB;

class RecepcionLecheService
{

  public function createRecepcionLeche(array $data): array
{
    try {
        $recepcionesCreadas = [];

        DB::transaction(function () use ($data, &$recepcionesCreadas) {
            $getEstadoId = fn($nombre) => Estado::firstOrCreate(['nombre' => $nombre])->id;

            // ✅ Solo crear registro de higiene si es Camión
            if ($data['grupo_recepcion'] === 'Camión') {
                $primeraSubruta = SubRutaAcopio::find($data['subrutas_seleccionadas'][0]);
                if (!$primeraSubruta) {
                    throw new \Exception("Subruta no encontrada");
                }
                $rutaId = $primeraSubruta->PLL_ruta_acopios_id;

                HigieneAcopio::create([
                    'tiempo' => now(),
                    'user_id' => auth()->id(),
                    'estado_id' => $getEstadoId('Pendiente'),
                    'PLL_ruta_acopios_id' => $rutaId,
                ]);
            }

            // Recepciones de leche y análisis (siempre)
            foreach ($data['subrutas_seleccionadas'] as $subruta_id) {
                $recepcion = RecepcionLeche::create([
                    'PLL_subruta_acopios_id' => $subruta_id,
                    'tiempo' => now(),
                    'estado_id' => $getEstadoId('Pendiente'),
                    'user_id' => auth()->id(),
                    'cantidad' => $data['cantidad'] ?? null,
                    'observaciones' => $data['observaciones'] ?? null,
                    'tipo_recepcion' => $data['grupo_recepcion'],
                ]);

                AnalisisLeche::create([
                    'PLL_recepcion_leches_id' => $recepcion->id,
                    'estado_id' => $getEstadoId('Pendiente'),
                ]);

                $recepcionesCreadas[] = $recepcion;
            }
        });

        return $recepcionesCreadas;
    } catch (\Throwable $th) {
        throw $th;
    }
}

    public function updateRecepcionLeche(RecepcionLeche $recepcionLeche, array $data): RecepcionLeche
    {
        return DB::transaction(function () use ($recepcionLeche, $data) {
            // Solo actualizar campos permitidos (no tiempo, estado_id, user_id)
            $recepcionLeche->update([
                'PLL_subruta_acopios_id' => $data['PLL_subruta_acopios_id'],
                'cantidad' => $data['cantidad'] ?? null,
                'observaciones' => $data['observaciones'] ?? null,
                'tipo_recepcion' => $data['tipo_recepcion'],
            ]);

            return $recepcionLeche->fresh();
        });
    }

   public function deleteRecepcionLeche(RecepcionLeche $recepcionLeche): void
{
    if (!$recepcionLeche->exists) {
        throw new \Exception("La recepción de leche no existe en la base de datos.");
    }

    DB::transaction(function () use ($recepcionLeche) {
        // Elimina los análisis asociados (hasMany)
        $recepcionLeche->analisis()->delete(); // 👈 Usa el query builder de la relación

        // Elimina la recepción
        $recepcionLeche->delete();
    });
}
}
