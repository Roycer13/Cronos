<?php
namespace App\Domain\ModulosComunes\ControlPlagas\Services;
 
use App\Domain\ModulosComunes\ControlPlagas\Models\{
    BarreraPlaga, ControlBarrera, PresenciaVector,
    Trampa, ControlTrampa, ArranqueFumigacion,
    Insectocaptor, RegistroInsecto
};
use Illuminate\Support\Facades\DB;
 
class ControlBarreraService
{
    public function crear(array $data, $inspector): ControlBarrera
    {
        return ControlBarrera::create([
            ...$data,
            'user_id' => $inspector->id,
            'fecha'   => $data['fecha'] ?? now(),
        ]);
    }
 
    public function actualizar(ControlBarrera $control, array $data): ControlBarrera
    {
        $control->update($data);
        return $control->fresh();
    }
}