<?php

namespace App\Domain\ModulosComunes\Documentacion\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class SolicitudDocumento extends Model
{
    protected $table = 'solicitud_documentos';

    protected $fillable = [
        'codigo_solicitud',
        'fecha_solicitud',
        'solicitante_id',
        'tipo_solicitud',
        'documento_id',
        'justificacion',
        'alcance',
        'estado_id',
        'limite_fecha_elaboracion',
        'fecha_elaboracion',
        'limite_fecha_revision_tecnica',
        'fecha_revision_tecnica',
        'limite_fecha_revision_calidad',
        'fecha_revision_calidad',
        'limite_fecha_revision_aprobacion',
        'fecha_revision_aprobacion',
        'ubicacion_id',
        'area_id',
        'observaciones'
    ];

    // Relaciones
    public function solicitante()
    {
        return $this->belongsTo(User::class, 'solicitante_id');
    }

    public function documento()
    {
        return $this->belongsTo(Documento::class);
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class);
    }

    // Ejemplo: relación opcional si existe tabla ubicaciones
    public function ubicacion()
    {
        return $this->belongsTo(\App\Domain\Sistema\Configuracion\Models\Ubicacion::class, 'ubicacion_id');
    }

    // SCOPES básicos para filtrar desde index
    public function scopeTipo(Builder $query, $tipo)
    {
        return $query->when($tipo, fn($q) => $q->where('tipo_solicitud', $tipo));
    }

    public function scopeArea(Builder $query, $areaId)
    {
        return $query->when($areaId, fn($q) => $q->where('area_id', $areaId));
    }

    public function scopeEstado(Builder $query, $estadoId)
    {
        return $query->when($estadoId, fn($q) => $q->where('estado_id', $estadoId));
    }

    public function scopeCodigoOrTitulo(Builder $query, $term)
    {
        return $query->when($term, fn($q) => $q->where(function ($qq) use ($term) {
            $qq->where('codigo_solicitud', 'like', "%{$term}%")
                ->orWhere('justificacion', 'like', "%{$term}%")
                ->orWhere('alcance', 'like', "%{$term}%");
        }));
    }

    // Scope que aplica todos los filtros esperados
    public function scopeFilter(Builder $query, array $filters)
    {
        return $query
            ->tipo($filters['tipo'] ?? null)
            ->area($filters['area_id'] ?? null)
            ->estado($filters['estado_id'] ?? null)
            ->when($filters['ubicacion_id'] ?? null, fn($q, $v) => $q->where('ubicacion_id', $v))
            ->codigoOrTitulo($filters['codigo'] ?? ($filters['titulo'] ?? null));
    }
}
