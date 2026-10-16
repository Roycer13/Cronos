<?php

namespace App\Domain\ModulosComunes\Sanidad\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamenOcupacional extends Model
{
    protected $table = 'san_examen_ocupacionales';

    protected $fillable = [
        'tipo_examen',
        'fecha_examen',
        'empleado_id',
        'medico_id',
        'policlinico_id',
        'entidad_anterior',
        'ocupacion_anterior',
        'fecha_inicio',
        'fecha_fin',
        'tiempo_servicio_total',
        'enfermedad_profesional',
        'accidentes_trabajo',
        'patologias',
        'patologias_lista',
        'grupo_sanguineo',
        'intervenciones_quirurgicas',
        'patologias_personales',
        'vacunas_tipo_dosis',
        'vacunas_fecha_ultima_dosis',
        'habitos_deportes',
        'examen_psicologico',
        'tipo_menstrual',
        'dismenorrea',
        'menarquia',
        'gesta',
        'numero_hijos',
        'peso_kg',
        'estatura_m',
        'temperatura_c',
        'presion_arterial_mmhg',
        'frecuencia_respiratoria_pm',
        'pulso_lpm',
        'indice_masa_corporal',
        'imc_estado',
        'segmentario_cabeza',
        'segmentario_cara',
        'segmentario_ojos',
        'segmentario_oidos',
        'segmentario_fosas_nasales',
        'segmentario_boca_faringe',
        'segmentario_dientes',
        'segmentario_cuello',
        'segmentario_piel',
        'segmentario_torax',
        'segmentario_corazon',
        'segmentario_pulmones',
        'segmentario_abdomen',
        'segmentario_genitourinario',
        'segmentario_extremidades',
        'segmentario_columna',
        'segmentario_neurologico_mental',
        'transferencia_requerida',
        'especialidad_derivacion',
        'aptitud_ocupacional',
        'concepto_final_aptitud',
        'recomendaciones'
    ];

    protected $casts = [
        'fecha_examen' => 'datetime',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date', // año
        'patologias' => 'boolean',
        'patologias_lista' => 'array',
        'vacunas_tipo_dosis' => 'array',
        'vacunas_fecha_ultima_dosis' => 'array',
        'habitos_deportes' => 'array',
        'dismenorrea' => 'boolean', // si lo corriges en migración; si queda string, cambia a 'string'
        'menarquia' => 'integer',
        'gesta' => 'integer',
        'numero_hijos' => 'integer',
        'peso_kg' => 'decimal:2',
        'estatura_m' => 'decimal:2',
        'temperatura_c' => 'decimal:2',
        'indice_masa_corporal' => 'decimal:2',
        'transferencia_requerida' => 'boolean'
    ];

    // Relaciones
    public function empleado(): BelongsTo
    {
        return $this->belongsTo(User::class, 'empleado_id');
    }

    public function medico(): BelongsTo
    {
        return $this->belongsTo(User::class, 'medico_id');
    }

    public function policlinico(): BelongsTo
    {
        return $this->belongsTo(Policlinico::class);
    }

    // Scopes para reportes
    public function scopeFilter($query, array $filters)
    {
        return $query
            ->when($filters['tipo_examen'] ?? null, fn($q, $tipo) => $q->where('tipo_examen', $tipo))
            ->when($filters['empleado_id'] ?? null, fn($q, $id) => $q->where('empleado_id', $id))
            ->when($filters['medico_id'] ?? null, fn($q, $id) => $q->where('medico_id', $id))
            ->when($filters['fecha_desde'] ?? null, fn($q, $fecha) => $q->whereDate('fecha_examen', '>=', $fecha))
            ->when($filters['fecha_hasta'] ?? null, fn($q, $fecha) => $q->whereDate('fecha_examen', '<=', $fecha))
            ->when($filters['aptitud_ocupacional'] ?? null, fn($q, $apt) => $q->where('aptitud_ocupacional', $apt))
            ->when($filters['policlinico_id'] ?? null, fn($q, $id) => $q->where('policlinico_id', $id))
            ->when($filters['transferencia_requerida'] ?? null, fn($q, $trans) => $q->where('transferencia_requerida', $trans))
            ->when($filters['grupo_sanguineo'] ?? null, fn($q, $gs) => $q->where('grupo_sanguineo', $gs));
    }

    public function scopeDeTipo($query, $tipo)
    {
        return $query->where('tipo_examen', $tipo);
    }

    public function scopeEntreFechas($query, $inicio, $fin)
    {
        return $query->whereBetween('fecha_examen', [$inicio, $fin]);
    }

    public function scopePorEmpleado($query, $empleadoId)
    {
        return $query->where('empleado_id', $empleadoId);
    }

    public function scopeConAptitud($query, $aptitud)
    {
        return $query->where('aptitud_ocupacional', $aptitud);
    }
}