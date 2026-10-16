<?php

namespace App\Domain\ModulosComunes\Productos\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Destino extends Model
{
    use SoftDeletes;

    protected $table = 'destinos';

    protected $fillable = [
        'nombre',
        'codigo',
        'descripcion',
        'estado_id',
        'ubicacion_id'
    ];

    // Relaciones
    public function estado()
    {
        return $this->belongsTo(Estado::class);
    }

    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }

    public function productos()
    {
        return $this->hasMany(ProductoTerminado::class, 'destino_id');
    }
}