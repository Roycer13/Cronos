<?php

namespace App\Domain\ModulosComunes\Old\Services;

use App\Domain\ModulosComunes\Old\Models\OldDistribucionCarro;

class OldDistribucionCarroService
{
    public function crear(array $data)
    {
        $data['user'] = auth()->id();

        // Check for the typo column just in case the frontend sends the correct one
        if (isset($data['ausencia_objetos_olores']) && !isset($data['ausenci_objetos y olores'])) {
            $data['ausenci_objetos y olores'] = $data['ausencia_objetos_olores'];
        }

        return OldDistribucionCarro::create($data);
    }

    public function actualizar(OldDistribucionCarro $modelo, array $data)
    {
        if (isset($data['ausencia_objetos_olores']) && !isset($data['ausenci_objetos y olores'])) {
            $data['ausenci_objetos y olores'] = $data['ausencia_objetos_olores'];
        }

        $modelo->update($data);
        return $modelo;
    }
}
