<?php
namespace App\Domain\PlantaLacteos\Services\Externo;

use App\Domain\PlantaLacteos\Models\ExtTipoMuestra;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TipoMuestraService
{
    public function listarPorUbicacion(int $ubicacionId, array $filters = [])
    {
        $query = ExtTipoMuestra::where('ubicacion_id', $ubicacionId);
        if (isset($filters['nombre'])) {
            $query->byNombre($filters['nombre']);
        }
        return $query->orderBy('nombre')->get();
    }

    public function crear(array $data): ExtTipoMuestra
    {
        return ExtTipoMuestra::create($data);
    }

    public function actualizar(ExtTipoMuestra $tipoMuestra, array $data): ExtTipoMuestra
    {
        $tipoMuestra->update($data);
        return $tipoMuestra;
    }

    public function eliminar(ExtTipoMuestra $tipoMuestra): void
    {
        // Validar si está siendo usado en algún detalle
        if ($tipoMuestra->detalles()->exists()) {
            throw ValidationException::withMessages(['error' => 'No se puede eliminar porque está asociado a solicitudes.']);
        }
        $tipoMuestra->delete();
    }
}