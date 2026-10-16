<?php

namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\ServicioFrio;
use Illuminate\Support\Facades\DB;

class ServicioFrioService
{
    public function create(array $data): ServicioFrio
    {
        return DB::transaction(function () use ($data) {
            $data['user_id'] = auth()->id();
            return ServicioFrio::create($data);
        });
    }

    public function update(ServicioFrio $servicioFrio, array $data): ServicioFrio
    {
        return DB::transaction(function () use ($servicioFrio, $data) {
            $servicioFrio->update($data);
            return $servicioFrio->fresh();
        });
    }

    public function delete(ServicioFrio $servicioFrio): void
    {
        DB::transaction(function () use ($servicioFrio) {
            $servicioFrio->delete();
        });
    }
}