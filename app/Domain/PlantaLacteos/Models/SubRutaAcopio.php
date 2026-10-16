<?php

namespace App\Domain\PlantaLacteos\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubRutaAcopio extends Model
{
    use HasFactory;
    protected $table = 'PLL_subruta_acopios';   
   
    protected $fillable = [
        'PLL_ruta_acopios_id',
        'nombre',
        'alias',
        'detalle',
        'grupo',
        'estado'
    ];

    protected $casts = [
        'estado' => 'boolean'
    ];
    // Relaciones
      
    public function ruta()
    {
        return $this->belongsTo(RutaAcopio::class, 'PLL_ruta_acopios_id');
    }

    public function recepciones()
    {
        return $this->hasMany(RecepcionLeche::class, 'PLL_subruta_acopios_id');
    }

}
