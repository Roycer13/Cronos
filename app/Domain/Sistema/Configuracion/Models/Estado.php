<?php

namespace App\Domain\Sistema\Configuracion\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estado extends Model
{
    use HasFactory;

    protected $table = 'estados';


    protected $fillable = [

        'nombre',
        'color',
        'descripcion'

    ];

    public $timestamps = false;





}
