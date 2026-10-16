<?php
namespace App\Domain\ModulosComunes\ControlPlagas\Services;
 
use App\Domain\ModulosComunes\ControlPlagas\Models\{
    BarreraPlaga, ControlBarrera, PresenciaVector,
    Trampa, ControlTrampa, ArranqueFumigacion,
    Insectocaptor, RegistroInsecto
};
use Illuminate\Support\Facades\DB;
class InsectocaptorService
{
    public function crear(array $data): Insectocaptor
    {
        return Insectocaptor::create($data);
    }
 
    public function actualizar(Insectocaptor $equipo, array $data): Insectocaptor
    {
        $equipo->update($data);
        return $equipo->fresh();
    }
}