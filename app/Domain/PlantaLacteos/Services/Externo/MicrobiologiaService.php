<?php

namespace App\Domain\PlantaLacteos\Services\Externo;

use App\Domain\PlantaLacteos\Models\ExtMicrobiologia;

class MicrobiologiaService
{
    public function registrarSiembra(ExtMicrobiologia $micro, array $data): void
    {
        $micro->update([
            'fecha_siembra' => $data['fecha_siembra'],
            'ana_sem_id' => auth()->id(),
            'estado' => 'Sembrado',
            'observaciones' => $data['observaciones'] ?? $micro->observaciones,
        ]);
    }

    public function registrarDia2(ExtMicrobiologia $micro, array $data): void
    {
        $tipoMuestra = $micro->detalle?->tipoMuestra;
        $payload = [
            'fecha_dia2' => $data['fecha_dia2'],
            'ana_dia2_id' => auth()->id(),
            'estado' => 'En Lectura Día 2',
        ];

        if ($tipoMuestra?->mesofilos) {
            $payload['aer_mes'] = $data['aer_mes'] ?? null;
        } else {
            $payload['aer_mes'] = null;
        }

        if ($tipoMuestra?->coliformes) {
            $payload['col_tot'] = $data['col_tot'] ?? null;
        } else {
            $payload['col_tot'] = null;
        }

        $payload['aer_mes2'] = $data['aer_mes2'] ?? null;
        $payload['col_tot2'] = $data['col_tot2'] ?? null;

        $micro->update($payload);
    }

    public function registrarDia5(ExtMicrobiologia $micro, array $data): void
    {
        $tipoMuestra = $micro->detalle?->tipoMuestra;
        $payload = [
            'fecha_dia5' => $data['fecha_dia5'],
            'ana_dia5_id' => auth()->id(),
            'estado' => 'Analizado',
        ];

        if ($tipoMuestra?->mohos) {
            $payload['moh_lev'] = $data['moh_lev'] ?? null;
        } else {
            $payload['moh_lev'] = null;
        }

        $payload['aer_mes2'] = $data['aer_mes2'] ?? null;
        $payload['col_tot2'] = $data['col_tot2'] ?? null;
        $payload['moh_lev2'] = $data['moh_lev2'] ?? null;

        $micro->update($payload);
    }
}
