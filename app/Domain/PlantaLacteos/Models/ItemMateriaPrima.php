<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\Unidad;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemMateriaPrima extends Model
{
    use HasFactory;

    protected $table = 'PLL_item_materia_primas';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'categoria_materia_prima_id',
        'nivel_inspeccion',
        'nca_max',
        'nca_min',
        'Nivel_dilucion',
        'temp_max',
        'temp_min',
        'ph_max',
        'ph_min',
        'solidos_max',
        'solidos_min',
        'acidez_max',
        'acidez_min',
        'densidad_max',
        'densidad_min',
        'viscosidad_max',
        'viscosidad_min',
        'organoleptica',
        'unidad_id',
        'unidad2_id',
        'ubicacion_id'

    ];



    public function categoriaMateriaPrima()
    {
        return $this->belongsTo(CategoriaMateriaPrima::class, 'categoria_materia_prima_id');
    }
    public function recepcionesMateriaPrima()
    {
        return $this->hasMany(RecepcionMateriaPrima::class, 'item_materia_prima_id');
    }
    public function unidad()
    {
        return $this->belongsTo(Unidad::class, 'unidad_id');
    }
    public function unidad2()
    {
        return $this->belongsTo(Unidad::class, 'unidad2_id');
    }
    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }

}
