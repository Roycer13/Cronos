<?php

namespace App\Domain\ModulosComunes\ControlPlagas\Services;

use App\Domain\ModulosComunes\ControlPlagas\Models\{
    BarreraPlaga, ControlBarrera, PresenciaVector,
    Trampa, ControlTrampa, ArranqueFumigacion,
    Insectocaptor, RegistroInsecto
};
use Illuminate\Support\Facades\DB;

class BarreraPlagaService
{
    public function crear(array $data): BarreraPlaga
    {
        return BarreraPlaga::create($data);
    }
 
    public function actualizar(BarreraPlaga $barrera, array $data): BarreraPlaga
    {
        $barrera->update($data);
        return $barrera->fresh();
    }
}