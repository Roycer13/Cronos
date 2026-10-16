<?php

namespace App\Domain\ModulosComunes\Canastillos\Services;

use App\Domain\ModulosComunes\Canastillos\Models\TipoAlmacen;
use Illuminate\Support\Facades\DB;

class TipoAlmacenService
{
    public function store(array $data): TipoAlmacen
    {
        return DB::transaction(function () use ($data) {
            return TipoAlmacen::create($data);
        });
    }

    public function update(TipoAlmacen $tipoAlmacen, array $data): TipoAlmacen
    {
        return DB::transaction(function () use ($tipoAlmacen, $data) {
            $tipoAlmacen->update($data);
            return $tipoAlmacen->fresh();
        });
    }

    public function delete(TipoAlmacen $tipoAlmacen): void
    {
        DB::transaction(function () use ($tipoAlmacen) {
            $tipoAlmacen->delete();
        });
    }
}
