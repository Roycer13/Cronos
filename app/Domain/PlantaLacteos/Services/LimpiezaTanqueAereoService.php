<?php
// app/Domain/PlantaLacteos/Services/LimpiezaTanqueAereoService.php

namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\LimpiezaTanqueAereo;
use Illuminate\Support\Facades\DB;

class LimpiezaTanqueAereoService
{
    public function store(array $data): LimpiezaTanqueAereo
    {
        return DB::transaction(function () use ($data) {
            return LimpiezaTanqueAereo::create($data);
        });
    }

    public function update(LimpiezaTanqueAereo $limpieza, array $data): LimpiezaTanqueAereo
    {
        return DB::transaction(function () use ($limpieza, $data) {
            $limpieza->update($data);
            return $limpieza->fresh();
        });
    }

    public function delete(LimpiezaTanqueAereo $limpieza): void
    {
        DB::transaction(function () use ($limpieza) {
            $limpieza->delete();
        });
    }
}
