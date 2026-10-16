<?php

namespace App\Domain\Sistema\Configuracion\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prioridad extends Model
{
    use HasFactory;
    protected $table = 'prioridades';
    protected $fillable = [

        'nombre',
        'codigo',
        'descripcion',
        'color',
        'tiempo_respuesta',

    ];

    public $timestamps = false;

    // Relación con el modelo User



}
