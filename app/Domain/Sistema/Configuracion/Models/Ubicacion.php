<?php

namespace App\Domain\Sistema\Configuracion\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ubicacion extends Model
{
    use HasFactory;

    protected $table = 'ubicaciones';


    protected $fillable = [

        'nombre',
        'direccion',
        'codigo',
        'abreviatura',
        'tipo_ubicacion_id'

    ];

    public $timestamps = false;

    // Relación con el modelo User
    public function tipoUbicacion()
    {
        return $this->belongsTo(TipoUbicacion::class, 'tipo_ubicacion_id');
    }
    // Relación con el modelo Area
    public function user()
    {
        return $this->hasMany(User::class, 'user_id');
    }



}
