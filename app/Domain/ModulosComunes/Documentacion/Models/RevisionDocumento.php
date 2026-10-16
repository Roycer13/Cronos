<?php

namespace App\Domain\ModulosComunes\Documentacion\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RevisionDocumento extends Model
{
    use HasFactory;

    protected $table = 'revision_documentos';

    protected $fillable = [
        'documento_id',
        'fecha_evaluacion',
        'analisis_vigencia',
        'evaluacion_efectividad',
        'modificaciones_proceso',
        'resultado_revision_auditoria',
        'retroalimentacion',
        'decision',
        'justificacion',
        'proxima_fecha_revision',
        'responsable_revision_id',
    ];

    // ---------------------------
    // RELACIONES
    // ---------------------------

    public function documento()
    {
        return $this->belongsTo(Documento::class);
    }

    public function responsableRevision()
    {
        return $this->belongsTo(User::class, 'responsable_revision_id');
    }

    // ---------------------------
    // SCOPES
    // ---------------------------

    /** Revisiones que aún no han sido evaluadas */
    public function scopePendientes($query)
    {
        return $query->whereNull('fecha_evaluacion');
    }

    /** Revisiones completadas */
    public function scopeCompletadas($query)
    {
        return $query->whereNotNull('fecha_evaluacion');
    }

    /** Próximas a vencerse (próxima fecha <= hoy) */
    public function scopeVencidas($query)
    {
        return $query->whereDate('proxima_fecha_revision', '<=', now());
    }

    /** Filtrar por documento */
    public function scopeDeDocumento($query, $documentoId)
    {
        return $query->where('documento_id', $documentoId);
    }

    /** Filtrar por usuario responsable */
    public function scopeDeResponsable($query, $userId)
    {
        return $query->where('responsable_revision_id', $userId);
    }
}
