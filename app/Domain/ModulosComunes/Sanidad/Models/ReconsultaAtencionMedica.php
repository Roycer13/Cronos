<?php

namespace App\Domain\ModulosComunes\Sanidad\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReconsultaAtencionMedica extends Model
{
    protected $table = 'san_reconsulta_atencion_medicas';

    protected $fillable = [
        'atencion_medica_id',
        'medico',
        'fecha_atencion',
        'evolucion_mejoria',
        'tratamiento',
        'transferencia',
        'policlinico_id'
    ];

    protected $casts = [
        'fecha_atencion' => 'datetime',
        'transferencia' => 'boolean'
    ];

    public function atencionMedica(): BelongsTo
    {
        return $this->belongsTo(AtencionMedica::class);
    }

    public function medicoUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'medico');
    }

    public function policlinico(): BelongsTo
    {
        return $this->belongsTo(Policlinico::class);
    }

    // Scopes
    public function scopeFilter($query, array $filters)
    {
        return $query
            ->when($filters['atencion_medica_id'] ?? null, fn($q, $id) => $q->where('atencion_medica_id', $id))
            ->when($filters['medico'] ?? null, fn($q, $medico) => $q->where('medico', $medico))
            ->when($filters['fecha_desde'] ?? null, fn($q, $fecha) => $q->whereDate('fecha_atencion', '>=', $fecha))
            ->when($filters['fecha_hasta'] ?? null, fn($q, $fecha) => $q->whereDate('fecha_atencion', '<=', $fecha))
            ->when($filters['transferencia'] ?? null, fn($q, $trans) => $q->where('transferencia', $trans))
            ->when($filters['policlinico_id'] ?? null, fn($q, $id) => $q->where('policlinico_id', $id));
    }
}
