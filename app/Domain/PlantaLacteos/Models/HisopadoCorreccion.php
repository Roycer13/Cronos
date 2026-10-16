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

class HisopadoCorreccion extends Model
{
    use HasFactory;

    protected $table = 'PLL_hisopados_correcciones';

    protected $fillable = [
        'tiempo',
        'user_id',
        'hisopado_id'
    ];



    // Relaciones

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function hisopado()
    {
        return $this->belongsTo(Hisopado::class, 'hisopado_id');
    }




}
