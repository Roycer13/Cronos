<?php

namespace App\Domain\ModulosComunes\Productos\Services;

use App\Domain\ModulosComunes\Productos\Models\FichaTecnicaNutricion;

class FichaTecnicaNutricionService
{
    public function crear(array $data): FichaTecnicaNutricion
    {
        return FichaTecnicaNutricion::create($data);
    }

    public function actualizar(FichaTecnicaNutricion $fichaTecnicaNutricion, array $data): bool
    {
        return $fichaTecnicaNutricion->update($data);
    }

    public function eliminar(FichaTecnicaNutricion $fichaTecnicaNutricion): ?bool
    {
        return $fichaTecnicaNutricion->delete();
    }

    public function encontrar(int $id): ?FichaTecnicaNutricion
    {
        return FichaTecnicaNutricion::with('fichaTecnica')->find($id);
    }

    public function encontrarPorFichaTecnica(int $fichaTecnicaId): ?FichaTecnicaNutricion
    {
        return FichaTecnicaNutricion::where('ficha_tecnica_id', $fichaTecnicaId)->first();
    }
}