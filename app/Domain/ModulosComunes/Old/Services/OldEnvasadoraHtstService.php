<?php

namespace App\Domain\ModulosComunes\Old\Services;

use App\Domain\ModulosComunes\Old\Models\OldEnvasadoraHtst;

class OldEnvasadoraHtstService
{
    public function store(array $data)
    {
        // ✅ limpiar checks (solo true)
        if (isset($data['checks'])) {
            $data['checks'] = array_filter($data['checks'], fn($v) => $v === true);
        }

        // ✅ asegurar que origenes sea un array
        $data['origenes'] = $data['origenes'] ?? [];

        return OldEnvasadoraHtst::create($data);
    }

    private function filtrarChecks($data)
    {
        $config = config("maquinas.{$data['tipo_maquina']}") ?? [];

        $permitidos = collect($config)->pluck('key')->toArray();

        return collect($data['checks'] ?? [])
            ->only($permitidos)
            ->toArray();
    }
}
