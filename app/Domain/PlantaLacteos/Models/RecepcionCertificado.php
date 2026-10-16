<?php

namespace App\Domain\PlantaLacteos\Models;

use Illuminate\Database\Eloquent\Model;

class RecepcionCertificado extends Model
{
    protected $table = 'PLL_recepcion_certificados';

    protected $fillable = [
        'recepcion_materia_prima_id',
        'ruta',
        'nombre_original',
        'mime_type',
        'tamano',
    ];

    public function recepcion()
    {
        return $this->belongsTo(RecepcionMateriaPrima::class, 'recepcion_materia_prima_id');
    }
}
