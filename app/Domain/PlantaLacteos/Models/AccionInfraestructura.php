<?php
namespace App\Domain\PlantaLacteos\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AccionInfraestructura extends Model
{
    use HasFactory;

    protected $table = 'acciones_infraestructura';

    protected $fillable = [
        'ubicacion_id','inspeccion_infraestructura_id','criterio','descripcion',
        'tipo_accion','responsable','fecha_ejecucion','estado','referencia','observaciones'
    ];

    protected $casts = [
        'fecha_ejecucion' => 'date',
    ];

    public function ubicacion() {
        return $this->belongsTo(\App\Domain\Sistema\Configuracion\Models\Ubicacion::class);
    }

    public function inspeccion() {
        return $this->belongsTo(InspeccionInfraestructura::class, 'inspeccion_infraestructura_id');
    }

    public function scopeFilter($query, array $filters) {
        return $query
            ->when($filters['inspeccion_infraestructura_id'] ?? null, fn($q, $v) => $q->where('inspeccion_infraestructura_id', $v))
            ->when($filters['estado'] ?? null, fn($q, $v) => $q->where('estado', $v))
            ->when($filters['criterio'] ?? null, fn($q, $v) => $q->where('criterio', $v))
            ->when($filters['responsable'] ?? null, fn($q, $v) => $q->where('responsable','like',"%{$v}%"))
            ->when($filters['ubicacion_id'] ?? null, fn($q, $v) => $q->where('ubicacion_id', $v));
    }
}