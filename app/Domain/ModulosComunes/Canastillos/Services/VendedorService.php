<?php

namespace App\Domain\ModulosComunes\Canastillos\Services;

use App\Domain\ModulosComunes\Canastillos\Models\Vendedor;
use Illuminate\Support\Facades\DB;

class VendedorService
{
    public function store(array $data): Vendedor
    {
        return DB::transaction(function () use ($data) {
            return Vendedor::create($data);
        });
    }

    public function update(Vendedor $vendedor, array $data): Vendedor
    {
        return DB::transaction(function () use ($vendedor, $data) {
            $vendedor->update($data);
            return $vendedor->fresh();
        });
    }

    public function delete(Vendedor $vendedor): void
    {
        DB::transaction(function () use ($vendedor) {
            $vendedor->delete();
        });
    }
}
