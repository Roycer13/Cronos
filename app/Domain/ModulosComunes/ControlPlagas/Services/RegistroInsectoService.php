<?php
namespace App\Domain\ModulosComunes\ControlPlagas\Services;
 
use App\Domain\ModulosComunes\ControlPlagas\Models\{
    BarreraPlaga, ControlBarrera, PresenciaVector,
    Trampa, ControlTrampa, ArranqueFumigacion,
    Insectocaptor, RegistroInsecto
};
use Illuminate\Support\Facades\DB;
class RegistroInsectoService
{
    public function crear(array $data, $inspector): RegistroInsecto
    {
        return RegistroInsecto::create([
            ...$data,
            'user_id' => $inspector->id,
            'fecha'   => now(),
        ]);
    }
 
    public function actualizar(RegistroInsecto $registro, array $data): RegistroInsecto
    {
        $registro->update($data);
        return $registro->fresh();
    }
}