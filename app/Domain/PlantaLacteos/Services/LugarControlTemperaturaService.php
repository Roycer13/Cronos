<?php

namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\LugarControlTemperatura;
use Illuminate\Support\Facades\DB;

class LugarControlTemperaturaService
{
    public function create(array $data): LugarControlTemperatura
    {
        return DB::transaction(function () use ($data) {
            return LugarControlTemperatura::create($data);
        });
    }

    public function update(LugarControlTemperatura $lugar, array $data): LugarControlTemperatura
    {
        return DB::transaction(function () use ($lugar, $data) {
            $lugar->update($data);
            return $lugar->fresh();
        });
    }

    public function delete(LugarControlTemperatura $lugar): void
    {
        DB::transaction(function () use ($lugar) {
            $lugar->delete();
        });
    }

    public function toggleEstado(LugarControlTemperatura $lugar): LugarControlTemperatura
    {
        return DB::transaction(function () use ($lugar) {
            $lugar->update(['estado' => !$lugar->estado]);
            return $lugar->fresh();
        });
    }
}