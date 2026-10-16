<?php

namespace App\Domain\ModulosComunes\Productos\Models;

use App\Domain\ModulosComunes\Productos\Models\ProductoTerminado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class FichaTecnica extends Model
{
    use SoftDeletes;

    protected $table = 'ficha_tecnicas';

    protected $fillable = [
        'producto_terminado_id',
        'version',
        'version_anterior_id',
        'usuario_aprobador_id',
        'descripcion_producto',
        'presentacion',
        'ingredientes',
        'aditivos',
        'alergenos',
        'observaciones',
        'aprobado',
        'sabor',
        'color',
        'textura',
        'olor',
        'almacenamiento_recomendado',
        'refrigerado',
        'congelado',
        'apilamiento_maximo',
        'vida_util_dias',
        'vida_util_alertas_dias',
        'imagen_url'
    ];

    protected $casts = [
        'aprobado' => 'boolean',
        'refrigerado' => 'boolean',
        'congelado' => 'boolean',
        'vida_util_dias' => 'integer',
        'vida_util_alertas_dias' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relaciones
    public function productoTerminado()
    {
        return $this->belongsTo(ProductoTerminado::class, 'producto_terminado_id');
    }

    public function versionAnterior()
    {
        return $this->belongsTo(FichaTecnica::class, 'version_anterior_id');
    }

    public function usuarioAprobador()
    {
        return $this->belongsTo(User::class, 'usuario_aprobador_id');
    }

    public function informacionNutricional()
    {
        return $this->hasOne(FichaTecnicaNutricion::class, 'ficha_tecnica_id');
    }

    // SCOPES
    public function scopeSearch($query, $search)
    {
        return $query->whereHas('productoTerminado', function($q) use ($search) {
            $q->where('nombre_comercial', 'LIKE', "%{$search}%")
              ->orWhere('codigo_interno', 'LIKE', "%{$search}%")
              ->orWhere('codigo_sap', 'LIKE', "%{$search}%");
        });
    }

    public function scopeAprobadas($query)
    {
        return $query->where('aprobado', true);
    }

    public function scopePorAprobacion($query, $aprobado)
    {
        return $query->where('aprobado', $aprobado);
    }

    public function scopePorProducto($query, $productoTerminadoId)
    {
        return $query->where('producto_terminado_id', $productoTerminadoId);
    }

    public function scopeConInformacionNutricional($query)
    {
        return $query->with('informacionNutricional');
    }

    public function scopeConProducto($query)
    {
        return $query->with('productoTerminado');
    }

    public function scopeRefrigerados($query)
    {
        return $query->where('refrigerado', true);
    }

    public function scopeCongelados($query)
    {
        return $query->where('congelado', true);
    }

    public function scopePorVidaUtil($query, $diasMinimos = null)
    {
        if ($diasMinimos) {
            return $query->where('vida_util_dias', '>=', $diasMinimos);
        }
        return $query;
    }

    public function scopePorVersion($query, $version)
    {
        return $query->where('version', $version);
    }
}