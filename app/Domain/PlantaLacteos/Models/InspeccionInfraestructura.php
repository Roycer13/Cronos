<?php
namespace App\Domain\PlantaLacteos\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InspeccionInfraestructura extends Model
{
    use HasFactory;

    protected $table = 'inspeccion_infraestructuras';

    protected $fillable = [
        'ubicacion_id','infraestructura_id','user_id','fecha',
        'pisos_ok','pisos_observacion',
        'paredes_ok','paredes_observacion',
        'techos_ok','techos_observacion',
        'puertas_ok','puertas_observacion',
        'ventanas_ok','ventanas_observacion',
        'drenajes_ok','drenajes_observacion',
        'iluminacion_ok','iluminacion_observacion',
        'ventilacion_ok','ventilacion_observacion',
        'lavamanos_ok','lavamanos_observacion',
        'servicios_sanitarios_ok','servicios_sanitarios_observacion',
        'almacenamiento_ok','almacenamiento_observacion',
        'senalizacion_ok','senalizacion_observacion',
        'maquina_equipo_ok','maquina_equipo_observacion',
        'extra_ok','extra_observacion',
        'observacion_general'
    ];

    protected $casts = [
        'fecha' => 'datetime',
        'pisos_ok' => 'boolean',
        'paredes_ok' => 'boolean',
        'techos_ok' => 'boolean',
        'puertas_ok' => 'boolean',
        'ventanas_ok' => 'boolean',
        'drenajes_ok' => 'boolean',
        'iluminacion_ok' => 'boolean',
        'ventilacion_ok' => 'boolean',
        'lavamanos_ok' => 'boolean',
        'servicios_sanitarios_ok' => 'boolean',
        'almacenamiento_ok' => 'boolean',
        'senalizacion_ok' => 'boolean',
        'maquina_equipo_ok' => 'boolean',
        'extra_ok' => 'boolean',
    ];

    public function ubicacion() {
        return $this->belongsTo(\App\Domain\Sistema\Configuracion\Models\Ubicacion::class);
    }

    public function infraestructura() {
        return $this->belongsTo(Infraestructura::class);
    }

    public function usuario() {
        return $this->belongsTo(\App\Domain\Sistema\Configuracion\Models\User::class, 'user_id');
    }

    public function acciones() {
        return $this->hasMany(AccionInfraestructura::class, 'inspeccion_infraestructura_id');
    }

    public function scopeFilter($query, array $filters) {
        return $query
            ->when($filters['infraestructura_id'] ?? null, fn($q, $v) => $q->where('infraestructura_id', $v))
            ->when($filters['user_id'] ?? null, fn($q, $v) => $q->where('user_id', $v))
            ->when($filters['fecha_desde'] ?? null, fn($q, $v) => $q->whereDate('fecha','>=',$v))
            ->when($filters['fecha_hasta'] ?? null, fn($q, $v) => $q->whereDate('fecha','<=',$v))
            ->when($filters['ubicacion_id'] ?? null, fn($q, $v) => $q->where('ubicacion_id', $v));
    }
}