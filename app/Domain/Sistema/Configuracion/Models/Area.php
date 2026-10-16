<?php

namespace App\Domain\Sistema\Configuracion\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;

    protected $fillable = [

        'nombre',
        'codigo',
        'ubicacion_id',
    ];

    public $timestamps = false;

    // Relación con el modelo User
    public function users()
    {
        return $this->hasMany(User::class, 'rol_id');
    }
    // Relación con el modelo Planta
    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }


}
