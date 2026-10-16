<?php

namespace App\Domain\ModulosComunes\Canastillos\Services;

use App\Domain\ModulosComunes\Canastillos\Models\Canastillo;
use Illuminate\Support\Facades\DB;

class CanastilloService
{
    public function store(array $data): Canastillo
    {
        return DB::transaction(function () use ($data) {
            return Canastillo::create($data);
        });
    }

    public function update(Canastillo $canastillo, array $data): Canastillo
    {
        return DB::transaction(function () use ($canastillo, $data) {
            $canastillo->update($data);
            return $canastillo->fresh();
        });
    }

    public function delete(Canastillo $canastillo): void
    {
        DB::transaction(function () use ($canastillo) {
            $canastillo->delete();
        });
    }
}
