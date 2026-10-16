<?php

namespace App\Domain\ModulosComunes\Productos\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Linea extends Model
{
    use SoftDeletes;

    protected $table = 'lineas';

    protected $fillable = [
        'nombre',
        'codigo',
        'descripcion',
        'ubicacion_id',
        'estado_id'
    ];

    // Relaciones
    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class);
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class);
    }

    public function productos()
    {
        return $this->hasMany(ProductoTerminado::class, 'linea_id');
    }
}