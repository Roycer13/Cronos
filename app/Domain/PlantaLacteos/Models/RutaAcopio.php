<?php

namespace App\Domain\PlantaLacteos\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RutaAcopio extends Model
{
    use HasFactory;
    protected $table = 'PLL_ruta_acopios';   
    protected $fillable = [
        'nombre',
        'detalle',
        'alias',
        'estado'
    ];
    protected $casts = [
        'estado' => 'boolean'
    ];
    // Relaciones
    public function subrutas()
    {
        return $this->hasMany(SubRutaAcopio::class, 'PLL_ruta_acopios_id');
    }

}
