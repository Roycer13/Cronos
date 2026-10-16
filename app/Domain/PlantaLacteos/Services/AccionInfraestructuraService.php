<?php
namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\AccionInfraestructura;
use Illuminate\Support\Facades\DB;

class AccionInfraestructuraService
{
    public function create(array $data): AccionInfraestructura {
        return DB::transaction(fn() => AccionInfraestructura::create($data));
    }

    public function update(AccionInfraestructura $accion, array $data): AccionInfraestructura {
        DB::transaction(fn() => $accion->update($data));
        return $accion->fresh();
    }

    public function delete(AccionInfraestructura $accion): void {
        DB::transaction(fn() => $accion->delete());
    }
}