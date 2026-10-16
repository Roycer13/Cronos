<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServicioFrio extends Model
{
    use HasFactory;

    protected $table = 'pll_servicio_frios';
    
    protected $fillable = [
        'tiempo',
        'user_id',
        'lugar_id',
        'display1',
        'display2',
        'display3',
        'termometro_mano',
        'separacion_pared',
        'observaciones'
    ];

    protected $casts = [
        'tiempo' => 'datetime',
        'display1' => 'decimal:2',
        'display2' => 'decimal:2',
        'display3' => 'decimal:2',
        'termometro_mano' => 'decimal:2',
        'separacion_pared' => 'boolean'
    ];

    public function scopeFilter($query, array $filters)
    {
        return $query
            ->when($filters['user_id'] ?? null, fn($q, $userId) => 
                $q->where('user_id', $userId))
            ->when($filters['lugar_id'] ?? null, fn($q, $lugarId) => 
                $q->where('lugar_id', $lugarId))
            ->when($filters['fecha_inicio'] ?? null, fn($q, $fecha) => 
                $q->where('tiempo', '>=', $fecha))
            ->when($filters['fecha_fin'] ?? null, fn($q, $fecha) => 
                $q->where('tiempo', '<=', $fecha));
    }

    // Relaciones
    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function lugar()
    {
        return $this->belongsTo(LugarControlTemperatura::class, 'lugar_id');
    }
}