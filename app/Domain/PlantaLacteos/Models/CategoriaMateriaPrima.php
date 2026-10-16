<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoriaMateriaPrima extends Model
{
    use HasFactory;

    protected $table = 'PLL_categoria_materia_primas';

    protected $fillable = [
        'nombre',
        'descripcion',
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
