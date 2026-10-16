<?php

namespace App\Domain\ModulosComunes\Productos\Models;

use App\Domain\ModulosComunes\Productos\Models\ProductoTerminado;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoriaProducto extends Model
{
    use SoftDeletes;

    protected $table = 'categoria_productos';

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
        return $this->belongsTo(Ubicacion::class);
    }

    public function subcategorias()
    {
        return $this->hasMany(SubcategoriaProducto::class, 'categoria_id');
    }

    public function productos()
    {
        return $this->hasMany(ProductoTerminado::class, 'categoria_id');
    }
}