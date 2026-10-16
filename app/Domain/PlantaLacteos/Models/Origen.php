<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\MaquinaEquipo;
use App\Domain\Sistema\Configuracion\Models\Sector;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Origen extends Model
{
       use HasFactory, SoftDeletes;

    protected $table = 'PLL_origenes';
    
    protected $fillable = [
        'alias',
        'descripcion',
        'maquina_id',
        'sector_id'
    ];

    // Relaciones
    public function maquina()
    {
        return $this->belongsTo(MaquinaEquipo::class, 'maquina_id');
    }

    public function sector()
    {
        return $this->belongsTo(Sector::class, 'sector_id');
    }

    public function estadoPlantas()
    {
        return $this->hasMany(EstadoPlanta::class, 'origen_id');
    }

    public function estadoDetalles()
    {
        return $this->hasMany(EstadoDetalle::class, 'origen_id');
    }
}
