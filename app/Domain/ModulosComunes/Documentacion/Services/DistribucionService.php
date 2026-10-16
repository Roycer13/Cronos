<?php

namespace App\Domain\ModulosComunes\Documentacion\Services;

use App\Domain\ModulosComunes\Documentacion\Models\DistribucionDocumento;
use App\Domain\ModulosComunes\Documentacion\Models\Documento;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class DistribucionService
{
    public function createDistribucion(Documento $documento, array $data): DistribucionDocumento
    {
        return DB::transaction(function () use ($documento, $data) {
            $dist = new DistribucionDocumento();
            $dist->documento_id = $documento->id;
            $dist->tipo = $data['tipo'];
            $dist->cantidad_copias = $data['cantidad_copias'] ?? 1;
            $dist->area_destinataria_id = $data['area_destinataria_id'] ?? null;
            $dist->responsable_user_id = $data['responsable_user_id'] ?? null;
            $dist->ubicacion_fisica = $data['ubicacion_fisica'] ?? null;
            $dist->acceso_usuario_id = $data['acceso_usuario_id'] ?? null;
            $dist->fecha_inicio_acceso = $data['fecha_inicio_acceso'] ?? null;
            $dist->fecha_fin_acceso = $data['fecha_fin_acceso'] ?? null;
            $dist->control_descarga = $data['control_descarga'] ?? true;
            $dist->cantidad_descargas = 0;
            $dist->save();

            return $dist;
        });
    }

    public function grantAccess(DistribucionDocumento $dist, int $userId, ?\DateTimeInterface $from = null, ?\DateTimeInterface $to = null)
    {
        $dist->acceso_usuario_id = $userId;
        $dist->fecha_inicio_acceso = $from ?? now();
        $dist->fecha_fin_acceso = $to;
        $dist->save();
    }

    public function revokeAccess(DistribucionDocumento $dist)
    {
        $dist->acceso_usuario_id = null;
        $dist->fecha_inicio_acceso = null;
        $dist->fecha_fin_acceso = null;
        $dist->save();
    }

    public function registerDownload(DistribucionDocumento $dist)
    {
        $dist->increment('cantidad_descargas');
    }
}
