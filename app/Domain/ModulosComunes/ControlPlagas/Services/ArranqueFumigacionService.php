<?php
namespace App\Domain\ModulosComunes\ControlPlagas\Services;
 
use App\Domain\ModulosComunes\ControlPlagas\Models\{
    BarreraPlaga, ControlBarrera, PresenciaVector,
    Trampa, ControlTrampa, ArranqueFumigacion,
    Insectocaptor, RegistroInsecto
};
use Illuminate\Support\Facades\DB;
class ArranqueFumigacionService
{
    public function crear(array $data, $inspector): ArranqueFumigacion
    {
        return ArranqueFumigacion::create([
            ...$data,
            'user_id' => $inspector->id,
            'fecha'   => now(),
        ]);
    }
 
    public function actualizar(ArranqueFumigacion $arranque, array $data): ArranqueFumigacion
    {
        $arranque->update($data);
        return $arranque->fresh();
    }
}
 