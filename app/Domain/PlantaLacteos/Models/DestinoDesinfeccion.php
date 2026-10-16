<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\Unidad;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DestinoDesinfeccion extends Model
{
    use HasFactory;

    protected $table = 'PLL_destino_desinfecciones';

    protected $fillable = [
        'codigo',
        'nombre',
        'concentracion',
        'unidad_id',
        'estado_id',
        'ubicacion_id',
        'item_desinfeccion_id',
        'multiplicador'

    ];



    public function unidad()
    {
        return $this->belongsTo(Unidad::class, 'unidad_id');
    }
    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }
    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }
    public function item(){
        return $this->belongsTo(ItemDesinfeccion::class, 'item_desinfeccion_id');
    }
}
