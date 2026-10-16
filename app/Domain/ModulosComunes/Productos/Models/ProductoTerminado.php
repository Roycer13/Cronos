<?php

namespace App\Domain\ModulosComunes\Productos\Models;

use App\Domain\ModulosComunes\Productos\Models\CategoriaProducto;
use App\Domain\ModulosComunes\Productos\Models\Linea;
use App\Domain\ModulosComunes\Productos\Models\SubcategoriaProducto;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\Unidad;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class ProductoTerminado extends Model
{
    use SoftDeletes;

    protected $table = 'producto_terminados';

    protected $fillable = [
        'codigo_sap',
        'codigo_interno',
        'nombre_sap',
        'nombre_comercial',
        'descripcion_comercial',
        'descripcion_tecnica',
        'ubicacion_id',
        'categoria_producto_id',
        'subcategoria_producto_id',
        'linea_id',
        'destino_id',
        'cantidad_neto',
        'unidad_id',
        'cantidad_bruto',
        'estado_id',
        'usuario_creador_id',
        'usuario_modificador_id'
    ];

    protected $casts = [
        'cantidad_neto' => 'decimal:3',
        'cantidad_bruto' => 'decimal:3',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relaciones
    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }

    public function categoriaProducto()
    {
        return $this->belongsTo(CategoriaProducto::class, 'categoria_producto_id');
    }

    public function subcategoriaProducto()
    {
        return $this->belongsTo(SubcategoriaProducto::class, 'subcategoria_producto_id');
    }

    public function linea()
    {
        return $this->belongsTo(Linea::class, 'linea_id');
    }

    public function destino()
    {
        return $this->belongsTo(Destino::class, 'destino_id');
    }

    public function unidad()
    {
        return $this->belongsTo(Unidad::class, 'unidades_id');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class);
    }

    public function usuarioCreador()
    {
        return $this->belongsTo(User::class, 'usuario_creador_id');
    }

    public function usuarioModificador()
    {
        return $this->belongsTo(User::class, 'usuario_modificador_id');
    }

    public function fichaTecnica()
    {
        return $this->hasOne(FichaTecnica::class, 'producto_terminado_id');
    }

    // SCOPES
    public function scopeSearch($query, $search)
    {
        return $query->where('codigo_sap', 'LIKE', "%{$search}%")
                    ->orWhere('codigo_interno', 'LIKE', "%{$search}%")
                    ->orWhere('nombre_sap', 'LIKE', "%{$search}%")
                    ->orWhere('nombre_comercial', 'LIKE', "%{$search}%")
                    ->orWhere('descripcion_comercial', 'LIKE', "%{$search}%");
    }

    public function scopePorCodigoSap($query, $codigoSap)
    {
        return $query->where('codigo_sap', $codigoSap);
    }

    public function scopePorCodigoInterno($query, $codigoInterno)
    {
        return $query->where('codigo_interno', $codigoInterno);
    }

    public function scopePorUbicacion($query, $ubicacionId)
    {
        return $query->where('ubicacion_id', $ubicacionId);
    }

    public function scopePorCategoria($query, $categoriaProductoId)
    {
        return $query->where('categoria_producto_id', $categoriaProductoId);
    }

    public function scopePorSubcategoria($query, $subcategoriaProductoId)
    {
        return $query->where('subcategoria_producto_id', $subcategoriaProductoId);
    }

    public function scopePorLinea($query, $lineaId)
    {
        return $query->where('linea_id', $lineaId);
    }

    public function scopePorDestino($query, $destinoId)
    {
        return $query->where('destino_id', $destinoId);
    }

    public function scopeActivos($query)
    {
        return $query->whereHas('estado', function($q) {
            $q->where('nombre', 'Activo');
        });
    }

    public function scopeConRelaciones($query)
    {
        return $query->with([
            'ubicacion',
            'categoriaProducto',
            'subcategoriaProducto',
            'linea',
            'destino',
            'unidad',
            'estado',
            'fichaTecnica'
        ]);
    }
}
