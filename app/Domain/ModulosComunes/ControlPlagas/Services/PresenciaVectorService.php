<?php

namespace App\Domain\ModulosComunes\ControlPlagas\Services;

use App\Domain\ModulosComunes\ControlPlagas\Models\{
    BarreraPlaga,
    ControlBarrera,
    PresenciaVector,
    Trampa,
    ControlTrampa,
    ArranqueFumigacion,
    Insectocaptor,
    RegistroInsecto
};
use Illuminate\Support\Facades\DB;

class PresenciaVectorService
{
    public function crear(array $data, $inspector): PresenciaVector
    {
        return PresenciaVector::create([
            ...$data,
            'user_id' => $inspector->id,
            'fecha'   => $data['fecha'] ?? now(),
        ]);
    }

    public function actualizar(PresenciaVector $presencia, array $data): PresenciaVector
    {
        $presencia->update($data);
        return $presencia->refresh();
    }
}
