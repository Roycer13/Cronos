<?php

namespace App\Domain\PlantaLacteos\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetalleAcrilico extends Model
{
    use HasFactory;

    protected $table = 'PLL_detalle_acrilicos';

    protected $fillable = [
        'codigo',
        'area',
        'cantidad_vidrios',
        'cantidad_luminarias',
        'vigencia',
        'frecuencia',
    ];

    public function seguimientos()
    {
        return $this->hasMany(SeguimientoAcrilico::class, 'detalle_acrilico_id');
    }
}
