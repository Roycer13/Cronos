<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\ModulosComunes\Orp\Models\Orp;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\MaquinaEquipo;
use App\Domain\Sistema\Configuracion\Models\Sector;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DetalleSeguimientoUht extends Model
{
    use HasFactory;

    protected $table = 'PLL_detalle_seguimiento_uht';

    protected $fillable = [

        'seguimiento_uht_id',
        'orp_id'
    ];

    // Relaciones

    public function seguimientoUht()
    {
        return $this->belongsTo(SeguimientoUht::class, 'seguimiento_uht_id');
    }
    public function orp()
    {
        return $this->belongsTo(Orp::class, 'orp_id');
    }
 }
