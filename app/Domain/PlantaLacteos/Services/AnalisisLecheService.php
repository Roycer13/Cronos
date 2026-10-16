<?php

namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\AnalisisLeche;
use App\Domain\PlantaLacteos\Models\RecepcionLeche;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Support\Facades\DB;

class AnalisisLecheService
{
    public function updateAnalisisFQ(AnalisisLeche $analisisLeche, array $data): AnalisisLeche
    {
        return DB::transaction(function () use ($analisisLeche, $data) {
            $data['user_fq_id'] = auth()->id();
            $data['tiempo_fq'] = now();
            $data['estado_id'] = $this->getEstadoId('Completado');

            $analisisLeche->update($data);

            // Actualiza también la recepción asociada
            RecepcionLeche::where('id', $analisisLeche->PLL_recepcion_leches_id)
                ->update([
                    'estado_id' => $this->getEstadoId('Completado'),
                ]);

            return $analisisLeche->fresh();
        });
    }

    public function updateAnalisisSiembra(AnalisisLeche $analisisLeche, array $data): AnalisisLeche
    {
        return DB::transaction(function () use ($analisisLeche, $data) {
            $data['user_mb_siembra_id'] = auth()->id();
            $data['estado_id'] = $this->getEstadoId('Sembrado');

            $analisisLeche->update($data);

            return $analisisLeche->fresh();
        });
    }

    public function updateAnalisisLectura(AnalisisLeche $analisisLeche, array $data): AnalisisLeche
    {
        return DB::transaction(function () use ($analisisLeche, $data) {
            $data['user_mb_lectura_id'] = auth()->id();
            $data['estado_id'] = $this->getEstadoId('Completado');

            $analisisLeche->update($data);

            return $analisisLeche->fresh();
        });
    }

    public function deleteAnalisisLeche(AnalisisLeche $analisisLeche): void
    {
        DB::transaction(function () use ($analisisLeche) {
            $analisisLeche->delete();
        });
    }

    /**
     * 🔹 Método helper para obtener o crear el estado por nombre.
     * Si no existe, lo crea automáticamente.
     */
    private function getEstadoId(string $nombreEstado): int
    {
        return Estado::firstOrCreate(
            ['nombre' => $nombreEstado],
            ['descripcion' => 'Generado automáticamente', 'color' => '#9ca3af']
        )->id;
    }
}
