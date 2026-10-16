<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Models;

use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Capacitacion extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'capacitaciones';
    
    protected $fillable = [
        'ubicacion_id',
        'nombre',
        'fecha',
        'instructor',
        'lugar',
        'objetivo',
        'descripcion',
    ];

    protected $casts = [
        'fecha' => 'datetime',
    ];

    // Relaciones
    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class);
    }

    public function asistencias()
    {
        return $this->hasMany(AsistenciaCapacitacion::class);
    }

    public function trabajadores()
    {
        return $this->belongsToMany(User::class, 'asistencia_capacitacion', 'capacitacion_id', 'trabajador_id')
                    ->withPivot('asistio', 'aprobo', 'nota')
                    ->withTimestamps();
    }

    // Scopes
    public function scopePorUbicacion($query, $ubicacionId)
    {
        return $query->where('ubicacion_id', $ubicacionId);
    }

    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('fecha', $fecha);
    }

    public function scopeProximas($query)
    {
        return $query->where('fecha', '>=', now());
    }

    public function scopePasadas($query)
    {
        return $query->where('fecha', '<', now());
    }

    public function scopePorInstructor($query, $instructor)
    {
        return $query->where('instructor', 'like', "%{$instructor}%");
    }

    public function scopePorLugar($query, $lugar)
    {
        return $query->where('lugar', 'like', "%{$lugar}%");
    }

    // Métodos de ayuda
    public function totalAsistentes(): int
    {
        return $this->asistencias()->where('asistio', true)->count();
    }

    public function totalAprobados(): int
    {
        return $this->asistencias()->where('aprobo', true)->count();
    }

    public function tasaAsistencia(): float
    {
        $total = $this->asistencias()->count();
        if ($total === 0) return 0;
        
        $asistentes = $this->totalAsistentes();
        return round(($asistentes / $total) * 100, 2);
    }

    public function tasaAprobacion(): float
    {
        $asistentes = $this->totalAsistentes();
        if ($asistentes === 0) return 0;
        
        $aprobados = $this->totalAprobados();
        return round(($aprobados / $asistentes) * 100, 2);
    }
}