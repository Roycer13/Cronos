<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProveedorMateriaPrima extends Model
{
    use HasFactory;

    protected $table = 'PLL_proveedor_materia_primas';

    protected $fillable = [
        'nombre',
        'descripcion',
        'ubicacion_id'
    ];

    public function recepcionesMateriaPrima()
    {
        return $this->hasMany(RecepcionMateriaPrima::class, 'proveedor_materia_prima_id');
    }
    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }
}
