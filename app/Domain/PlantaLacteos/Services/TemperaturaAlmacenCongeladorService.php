<?php

namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\TemperaturaAlmacenCongelador;
use Illuminate\Support\Facades\DB;

class TemperaturaAlmacenCongeladorService
{
    public function create(array $data): TemperaturaAlmacenCongelador
    {
        return DB::transaction(function () use ($data) {
            $data['user_id'] = auth()->id();
            return TemperaturaAlmacenCongelador::create($data);
        });
    }

    public function update(TemperaturaAlmacenCongelador $temperatura, array $data): TemperaturaAlmacenCongelador
    {
        return DB::transaction(function () use ($temperatura, $data) {
            $temperatura->update($data);
            return $temperatura->fresh();
        });
    }

    public function delete(TemperaturaAlmacenCongelador $temperatura): void
    {
        DB::transaction(function () use ($temperatura) {
            $temperatura->delete();
        });
    }
}