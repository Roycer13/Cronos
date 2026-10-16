<?php

namespace App\Domain\Sistema\Configuracion\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unidad extends Model
{
    use HasFactory;
    protected $table = 'unidades';
    protected $fillable = [

        'nombre',

        'abreviatura',

    ];

    public $timestamps = false;

    // Relación con el modelo User



}
