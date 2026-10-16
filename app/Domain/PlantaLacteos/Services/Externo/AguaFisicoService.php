<?php
namespace App\Domain\PlantaLacteos\Services\Externo;

use App\Domain\PlantaLacteos\Models\ExtAguaFisico;

class AguaFisicoService
{
    public function registrarResultados(ExtAguaFisico $registro, array $data): void
    {
        $registro->update([
            'fecha' => $data['fecha'],
            'ph' => $data['ph'] ?? null,
            'dureza' => $data['dureza'] ?? null,
            'cloruros' => $data['cloruros'] ?? null,
            'conductividad' => $data['conductividad'] ?? null,
            'user_id' => auth()->id(),
            'estado' => 'Analizado',
            'observaciones' => $data['observaciones'] ?? $registro->observaciones,
        ]);
    }
}