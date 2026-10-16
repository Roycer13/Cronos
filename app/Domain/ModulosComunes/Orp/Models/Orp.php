<?php

namespace App\Domain\ModulosComunes\Orp\Models;

use App\Domain\ModulosComunes\Productos\Models\ProductoTerminado;
use App\Domain\PlantaLacteos\Models\Conteo;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\Unidad;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Orp extends Model
{


    protected $table = 'orps';

    protected $fillable = [
        'codigo',
        'producto_terminado_id',
        'lote',
        'prioridad',
        'cantidad_programada',
        'cantidad_producida',
        'unidad_id',
        'tiempo_elaboracion',
        'revisado',
        'revisor_id',
        'fecha_revision',
        'usuario_creador_id',
        'fecha_creacion',
        'usuario_modificador_id',
        'fecha_vencimiento1',
        'fecha_vencimiento2',
        'notas_internas',
        'ubicacion_id',
        'observaciones',
        'ambiente_frio',
    ];

    protected $casts = [
        'revisado' => 'boolean',
        'fecha_creacion' => 'datetime',
        'fecha_revision' => 'datetime',
        'fecha_vencimiento1' => 'date',
        'fecha_vencimiento2' => 'date',

    ];

    // Relaciones
    public function productoTerminado(): BelongsTo
    {
        return $this->belongsTo(ProductoTerminado::class);
    }
    public function producto(): BelongsTo
    {
        return $this->belongsTo(ProductoTerminado::class);
    }

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidad::class);
    }

    public function ubicacion(): BelongsTo
    {
        return $this->belongsTo(Ubicacion::class);
    }

    public function usuarioCreador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_creador_id');
    }

    public function usuarioModificador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_modificador_id');
    }

    public function revisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revisor_id');
    }

    public function historialEstados(): HasMany
    {
        return $this->hasMany(OrpEstado::class, 'orp_id');
    }

    public function estadoActual()
    {
        return $this->historialEstados()->latest()->first();
    }

    public function orpEstado()
    {
        return $this->hasMany(OrpEstado::class, 'orp_id');
    }

    public function ultimoEstado()
    {
        return $this->hasOne(OrpEstado::class, 'orp_id')->latestOfMany('fecha_hora');
    }

    public function conteos(): HasMany
    {
        return $this->hasMany(Conteo::class, 'orp_id');
    }

    // AGREGAR ESTA RELACIÓN FALTANTE
    public function estadoDetalle(): HasMany
    {
        return $this->hasMany(\App\Domain\PlantaLacteos\Models\EstadoDetalle::class, 'orp_id');
    }

    // Scopes para filtros
    public function scopePorCodigo(Builder $query, string $codigo): Builder
    {
        return $query->where('codigo', 'LIKE', "%{$codigo}%");
    }

    public function scopePorProductoTerminado(Builder $query, int $productoTerminadoId): Builder
    {
        return $query->where('producto_terminado_id', $productoTerminadoId);
    }

    public function scopePorLote(Builder $query, float $lote): Builder
    {
        return $query->where('lote', $lote);
    }

    public function scopePorPrioridad(Builder $query, string $prioridad): Builder
    {
        return $query->where('prioridad', $prioridad);
    }

    public function scopeRevisados(Builder $query): Builder
    {
        return $query->where('revisado', true);
    }

    public function scopeNoRevisados(Builder $query): Builder
    {
        return $query->where('revisado', false);
    }

    public function scopePorUbicacion(Builder $query, int $ubicacionId): Builder
    {
        return $query->where('ubicacion_id', $ubicacionId);
    }

    public function scopePorEstado(Builder $query, int $estadoId): Builder
    {
        return $query->whereHas('historialEstados', function ($q) use ($estadoId) {
            $q->where('estado_id', $estadoId)
              ->whereRaw('fecha_hora = (SELECT MAX(fecha_hora) FROM orp_estados WHERE orp_id = orps.id)');
        });
    }

    // NUEVO SCOPE: Para ORPs en proceso por nombre de estado
    public function scopeEnProceso(Builder $query): Builder
    {
        return $query->whereHas('historialEstados', function ($q) {
            $q->whereHas('estado', function ($q2) {
                $q2->where('nombre', 'En Proceso');
            })
            ->whereRaw('fecha_hora = (SELECT MAX(fecha_hora) FROM orp_estados WHERE orp_id = orps.id)');
        });
    }

    // NUEVO SCOPE: Para ORPs de planta lácteos
    public function scopeEnPlantaLacteos(Builder $query): Builder
    {
        return $query->where('ubicacion_id', 1);
    }

    public function scopeConCantidadProducidaMayorA(Builder $query, float $cantidad): Builder
    {
        return $query->where('cantidad_producida', '>', $cantidad);
    }

    public function scopeVencimientoEntre(Builder $query, $fechaInicio, $fechaFin): Builder
    {
        return $query->whereBetween('fecha_vencimiento1', [$fechaInicio, $fechaFin])
                    ->orWhereBetween('fecha_vencimiento2', [$fechaInicio, $fechaFin]);
    }
}
