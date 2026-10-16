<?php

namespace App\Domain\ModulosComunes\Sanidad\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AtencionMedica extends Model
{
    protected $table = 'san_atencion_medicas';

    protected $fillable = [
        'medico',
        'paciente',
        'fecha_incidente',
        'fecha_atencion',
        'motivo_consulta',
        'descripcion',
        'diagnostico',
        'gravedad',
        'temperatura',
        'presion_arterial',
        'frecuencia_respiratoria',
        'frecuencia_cardiaca',
        'tratamiento',
        'transferencia',
        'policlinico_id',
        'estado_id',
        'fecha_alta',
        'descripcion_alta'
    ];

    protected $casts = [
        'fecha_incidente' => 'datetime',
        'fecha_atencion' => 'datetime',
        'fecha_alta' => 'datetime',
        'transferencia' => 'boolean',
        'temperatura' => 'decimal:2',
        // los enteros se castean solos
    ];

    public function medicoUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'medico');
    }

    public function pacienteUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paciente');
    }

    public function policlinico(): BelongsTo
    {
        return $this->belongsTo(Policlinico::class);
    }

    public function estado(): BelongsTo
    {
        return $this->belongsTo(Estado::class, 'estado_id'); // Asegurar que existe modelo Estado
    }

    public function reconsultas(): HasMany
    {
        return $this->hasMany(ReconsultaAtencionMedica::class, 'atencion_medica_id');
    }

    // Scopes para reportes
    public function scopeFilter($query, array $filters)
    {
        return $query
            ->when($filters['medico'] ?? null, fn($q, $medico) => $q->where('medico', $medico))
            ->when($filters['paciente'] ?? null, fn($q, $paciente) => $q->where('paciente', $paciente))
            ->when($filters['fecha_desde'] ?? null, fn($q, $fecha) => $q->whereDate('fecha_atencion', '>=', $fecha))
            ->when($filters['fecha_hasta'] ?? null, fn($q, $fecha) => $q->whereDate('fecha_atencion', '<=', $fecha))
            ->when($filters['estado_id'] ?? null, fn($q, $estado) => $q->where('estado_id', $estado))
            ->when($filters['transferencia'] ?? null, fn($q, $trans) => $q->where('transferencia', $trans))
            ->when($filters['policlinico_id'] ?? null, fn($q, $id) => $q->where('policlinico_id', $id))
            ->when($filters['gravedad'] ?? null, fn($q, $g) => $q->where('gravedad', $g))
            ->when($filters['motivo_consulta'] ?? null, fn($q, $motivo) => $q->where('motivo_consulta', 'like', "%{$motivo}%"));
    }

    public function scopeEntreFechas($query, $inicio, $fin)
    {
        return $query->whereBetween('fecha_atencion', [$inicio, $fin]);
    }

    public function scopePorMedico($query, $medicoId)
    {
        return $query->where('medico', $medicoId);
    }

    public function scopePorPaciente($query, $pacienteId)
    {
        return $query->where('paciente', $pacienteId);
    }
}