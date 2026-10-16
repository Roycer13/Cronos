<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AsistenciaCapacitacion extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'asistencia_capacitacion';
    
    protected $fillable = [
        'capacitacion_id',
        'trabajador_id',
        'asistio',
        'aprobo',
        'nota',
    ];

    protected $casts = [
        'asistio' => 'boolean',
        'aprobo' => 'boolean',
    ];

    // Relaciones
    public function capacitacion()
    {
        return $this->belongsTo(Capacitacion::class);
    }

    public function trabajador()
    {
        return $this->belongsTo(User::class, 'trabajador_id');
    }

    // Scopes
    public function scopePorCapacitacion($query, $capacitacionId)
    {
        return $query->where('capacitacion_id', $capacitacionId);
    }

    public function scopePorTrabajador($query, $trabajadorId)
    {
        return $query->where('trabajador_id', $trabajadorId);
    }

    public function scopeAsistio($query)
    {
        return $query->where('asistio', true);
    }

    public function scopeNoAsistio($query)
    {
        return $query->where('asistio', false);
    }

    public function scopeAprobo($query)
    {
        return $query->where('aprobo', true);
    }

    public function scopeNoAprobo($query)
    {
        return $query->where('aprobo', false);
    }

    public function scopeConNotaMinima($query, $nota)
    {
        return $query->where('nota', '>=', $nota);
    }

    // Métodos de ayuda
    public function calificacionTexto(): string
    {
        if (!$this->asistio) return 'No asistió';
        if (!$this->aprobo) return 'No aprobó';
        
        if ($this->nota >= 90) return 'Excelente';
        if ($this->nota >= 80) return 'Bueno';
        if ($this->nota >= 70) return 'Regular';
        return 'Insuficiente';
    }
}