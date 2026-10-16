<?php
namespace App\Domain\PlantaLacteos\Services\Externo;


use App\Domain\PlantaLacteos\Models\ExtActividadAgua;

class ActividadAguaService
{
    public function registrarResultados(ExtActividadAgua $actividad, array $data): void
    {
        $actividad->update([
            'fecha' => $data['fecha'],
            'temperatura' => $data['temperatura'] ?? null,
            'por_hum_rel' => $data['por_hum_rel'] ?? null,
            'act_agua' => $data['act_agua'] ?? null,
            'user_id' => auth()->id(),
            'estado' => 'Analizado',
            'observaciones' => $data['observaciones'] ?? $actividad->observaciones,
        ]);
    }
}
