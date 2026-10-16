<?php
namespace App\Domain\ModulosComunes\ControlPlagas\Services;

use App\Domain\ModulosComunes\ControlPlagas\Models\Trampa;
use Illuminate\Support\Facades\DB;
class TrampaService
{
    public function crear(array $data): Trampa
    {
        return Trampa::create($data);
    }
 
    public function actualizar(Trampa $trampa, array $data): Trampa
    {
        $trampa->update($data);
        return $trampa->fresh();
    }
}