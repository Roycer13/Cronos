<?php

namespace App\Domain\Sistema\Configuracion\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sector extends Model
{
    use HasFactory;

    protected $table = 'MAN_sectores';


    protected $fillable = [

        'nombre',
        'codigo',
        'ubicacion_id'

    ];

    public $timestamps = false;

    // Relación con el modelo User
    public function Ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }
    // Relación con el modelo Area



}
