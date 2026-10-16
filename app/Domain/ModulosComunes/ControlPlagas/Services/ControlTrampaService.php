<?php
namespace App\Domain\ModulosComunes\ControlPlagas\Services;
 
use App\Domain\ModulosComunes\ControlPlagas\Models\{
    BarreraPlaga, ControlBarrera, PresenciaVector,
    Trampa, ControlTrampa, ArranqueFumigacion,
    Insectocaptor, RegistroInsecto
};
use Illuminate\Support\Facades\DB;
class ControlTrampaService
{
    public function crear(array $data, $inspector): ControlTrampa
    {
        return ControlTrampa::create([
            ...$data,
            'user_id' => $inspector->id,
            'fecha'   => now(),
        ]);
    }
 
    public function actualizar(ControlTrampa $control, array $data): ControlTrampa
    {
        $control->update($data);
        return $control->fresh();
    }
}