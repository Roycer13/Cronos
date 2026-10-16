<?php

namespace App\Domain\ModulosComunes\Canastillos\Services;

use App\Domain\ModulosComunes\Canastillos\Models\Almacen;
use Illuminate\Support\Facades\DB;

class AlmacenService
{
   // AlmacenService.php
public function store(array $data): Almacen
{
    return DB::transaction(function () use ($data) {
        // Extraer responsables del array para no enviarlo a la creación
        $responsables = $data['responsables'] ?? [];
        unset($data['responsables']);

        $almacen = Almacen::create($data);
        $almacen->responsables()->sync($responsables);
        return $almacen;
    });
}

public function update(Almacen $almacen, array $data): Almacen
{
    return DB::transaction(function () use ($almacen, $data) {
        $responsables = $data['responsables'] ?? [];
        unset($data['responsables']);

        $almacen->update($data);
        $almacen->responsables()->sync($responsables);
        return $almacen->fresh();
    });
}
    public function delete(Almacen $almacen): void
    {
        DB::transaction(function () use ($almacen) {
            $almacen->delete();
        });
    }
}
