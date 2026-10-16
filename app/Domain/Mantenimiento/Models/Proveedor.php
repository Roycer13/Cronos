<?php

namespace App\Domain\Mantenimiento\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\MaquinaEquipo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model
{
    use HasFactory;
    protected $table = 'MAN_proveedores';
    protected $fillable = [

        'nombre',
        'codigo',
        'direccion',
        'telefono',
        'encargado',
        'estado_id'

    ];

    use SoftDeletes;

    // Relación con el modelo User
    public function estado()
    {
        return $this->belongsTo( Estado::class, 'estado_id');
    }

}
