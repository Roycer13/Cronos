<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\ModulosComunes\Orp\Models\Orp;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\MaquinaEquipo;
use App\Domain\Sistema\Configuracion\Models\Sector;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstadoDetalle extends Model
{
    use HasFactory;

    protected $table = 'PLL_estado_detalles';
    
    protected $fillable = [
        'orp_id',
        'preparacion',
        'estado_planta_id',
        'user_id',
        'cantidad'
    ];

    // Relaciones
    public function estadoPlanta()
    {
        return $this->belongsTo(EstadoPlanta::class, 'estado_planta_id');
    }

    public function orp()
    {
        return $this->belongsTo(Orp::class, 'orp_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeConEstadoPlanta($query)
    {
        return $query->with(['estadoPlanta', 'orp', 'user']);
    }

    public function scopePorEstadoPlanta($query, $estadoPlantaId)
    {
        return $query->where('estado_planta_id', $estadoPlantaId);
    }

    public function scopePorOrp($query, $orpId)
    {
        return $query->where('orp_id', $orpId);
    }

    public function scopePorPreparacion($query, $preparacion)
    {
        return $query->where('preparacion', $preparacion);
    }

    public function scopePorUsuario($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeCantidadMayorQue($query, $cantidad)
    {
        return $query->where('cantidad', '>', $cantidad);
    }

    public function scopeCantidadMenorQue($query, $cantidad)
    {
        return $query->where('cantidad', '<', $cantidad);
    }

    public function scopePorRangoCantidad($query, $min, $max)
    {
        return $query->whereBetween('cantidad', [$min, $max]);
    }
}