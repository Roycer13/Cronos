<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AlmacenMateriaPrima extends Model
{
    use HasFactory;

    protected $table = 'PLL_almacen_materia_prima';

    protected $fillable = [
        'nombre',
        'ubicacion_id'
    ];



    public function itemsMateriaPrima()
    {
        return $this->hasMany(ItemMateriaPrima::class, 'categoria_materia_primas_id');
    }

    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }


}
