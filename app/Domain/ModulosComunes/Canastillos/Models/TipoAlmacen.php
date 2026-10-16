<?php


namespace App\Domain\ModulosComunes\Canastillos\Models;

use Illuminate\Database\Eloquent\Model;

class TipoAlmacen extends Model
{
    protected $table = 'CAN_tipo_almacenes';

    protected $fillable = [
        'nombre',
    ];


}
