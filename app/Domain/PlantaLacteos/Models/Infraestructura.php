<?php
namespace App\Domain\PlantaLacteos\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Infraestructura extends Model
{
    use HasFactory;

    protected $table = 'infraestructuras';

    protected $fillable = [
        'ubicacion_id','nombre','nivel','periodicidad_dias','ultima_inspeccion',
        'usa_pisos','usa_paredes','usa_techos','usa_puertas','usa_ventanas',
        'usa_drenajes','usa_iluminacion','usa_ventilacion','usa_lavamanos',
        'usa_servicios_sanitarios','usa_almacenamiento','usa_senalizacion','usa_maquina_equipo','usa_extra',
        'activo'
    ];

    protected $casts = [
        'ultima_inspeccion' => 'datetime',
        'activo' => 'boolean',
        'usa_pisos' => 'boolean',
        'usa_paredes' => 'boolean',
        'usa_techos' => 'boolean',
        'usa_puertas' => 'boolean',
        'usa_ventanas' => 'boolean',
        'usa_drenajes' => 'boolean',
        'usa_iluminacion' => 'boolean',
        'usa_ventilacion' => 'boolean',
        'usa_lavamanos' => 'boolean',
        'usa_servicios_sanitarios' => 'boolean',
        'usa_almacenamiento' => 'boolean',
        'usa_senalizacion' => 'boolean',
        'usa_maquina_equipo' => 'boolean',
        'usa_extra' => 'boolean',
    ];

    public function ubicacion() {
        return $this->belongsTo(\App\Domain\Sistema\Configuracion\Models\Ubicacion::class);
    }

    public function inspecciones() {
        return $this->hasMany(InspeccionInfraestructura::class);
    }

    public function getInspeccionVencidaAttribute(): bool {
        if (!$this->ultima_inspeccion) return true;
        return Carbon::parse($this->ultima_inspeccion)->addDays($this->periodicidad_dias)->isPast();
    }

    // Devuelve lista de nombres de criterios que aplican a esta área
    public function criteriosActivos(): array {
        $todos = [
            'pisos','paredes','techos','puertas','ventanas','drenajes',
            'iluminacion','ventilacion','lavamanos','servicios_sanitarios',
            'almacenamiento','senalizacion','maquina_equipo','extra'
        ];
        return array_values(array_filter($todos, fn($c) => $this->{'usa_'.$c}));
    }

    public function scopeFilter($query, array $filters) {
        return $query
            ->when($filters['nombre'] ?? null, fn($q, $v) => $q->where('nombre','like',"%{$v}%"))
            ->when(isset($filters['activo']), fn($q) => $q->where('activo', $filters['activo']))
            ->when($filters['ubicacion_id'] ?? null, fn($q, $v) => $q->where('ubicacion_id', $v));
    }
}