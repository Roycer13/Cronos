<?php
namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\Infraestructura;
use Illuminate\Support\Facades\DB;

class InfraestructuraService
{
    public function create(array $data): Infraestructura {
        return DB::transaction(fn() => Infraestructura::create($data));
    }

    public function update(Infraestructura $infra, array $data): Infraestructura {
        DB::transaction(fn() => $infra->update($data));
        return $infra->fresh();
    }

    public function delete(Infraestructura $infra): void {
        DB::transaction(fn() => $infra->delete());
    }
}