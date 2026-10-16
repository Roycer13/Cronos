<?php

namespace App\Domain\ModulosComunes\Productos\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class SubcategoriaProducto extends Model
{
    use SoftDeletes;

    protected $table = 'subcategoria_productos';

    protected $fillable = [
        'nombre',
        'codigo',
        'descripcion',
        'categoria_id'
    ];

    // Relaciones
    public function categoria()
    {
        return $this->belongsTo(CategoriaProducto::class, 'categoria_id');
    }

    public function productos()
    {
        return $this->hasMany(ProductoTerminado::class, 'subcategoria_id');
    }
}
