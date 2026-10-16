<?php

namespace App\Domain\Sistema\Configuracion\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoUbicacion extends Model
{
    use HasFactory;

    protected $table = 'tipo_ubicaciones';


    protected $fillable = [

        'nombre',
        'descripcion'


    ];

    public $timestamps = false;

    // Relación con el modelo User
    public function ubicacion()
    {
        return $this->hasMany(Ubicacion::class, 'tipo_ubicacion_id');
    }




}
