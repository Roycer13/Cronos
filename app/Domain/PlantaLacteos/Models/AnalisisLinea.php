<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalisisLinea extends Model
{
    use SoftDeletes;

    protected $table = 'PLL_analisis_linea';

    protected $fillable = [
        'tiempo_solicitud',
        'solicitante_id',
        'estado_planta_id',
        'estado_id',
        'tiempo_analisis',
        'analista_id',
        'temperatura',
        'ph',
        'acidez',
        'brix',
        'viscosidad',
        'densidad',
        'color',
        'olor',
        'sabor',
        'aspecto',
        'peso',
        'volumen',
        'observaciones',
        'tempUHT'
    ];

    protected $casts = [
        'tiempo_solicitud' => 'datetime',
        'tiempo_analisis' => 'datetime',
        'color' => 'boolean',
        'olor' => 'boolean',
        'sabor' => 'boolean',
        'temperatura' => 'decimal:2',
        'ph' => 'decimal:2',
        'acidez' => 'decimal:3',
        'brix' => 'decimal:2',
        'viscosidad' => 'decimal:2',
        'densidad' => 'decimal:3',
        'peso' => 'decimal:2',
        'volumen' => 'decimal:2',
        'tempUHT' => 'decimal:2',
    ];

    // Relación con el usuario que solicita (solicitante)
    public function solicitante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'solicitante_id');
    }

    // Relación con el usuario que realiza el análisis (analista)
    public function analista(): BelongsTo
    {
        return $this->belongsTo(User::class, 'analista_id');
    }

    // Relación con EstadoPlanta
    public function estadoPlanta(): BelongsTo
    {
        return $this->belongsTo(EstadoPlanta::class, 'estado_planta_id');
    }

    // Relación con Estado (estado de la solicitud)
    public function estado(): BelongsTo
    {
        return $this->belongsTo(\App\Domain\Sistema\Configuracion\Models\Estado::class, 'estado_id');
    }

    // Scopes útiles
    public function scopePendientes($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('nombre', 'Pendiente');
        });
    }

    public function scopeCompletadas($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('nombre', 'Completado');
        });
    }

    public function scopePorSolicitante($query, $solicitanteId)
    {
        return $query->where('solicitante_id', $solicitanteId);
    }

    public function scopePorAnalista($query, $analistaId)
    {
        return $query->where('analista_id', $analistaId);
    }

    public function scopePorEstadoPlanta($query, $estadoPlantaId)
    {
        return $query->where('estado_planta_id', $estadoPlantaId);
    }

    public function scopeRecientes($query)
    {
        return $query->orderBy('tiempo_solicitud', 'desc');
    }

    // Scopes para análisis
    public function scopeConAnalisisCompletado($query)
    {
        return $query->whereNotNull('tiempo_analisis')
                    ->whereNotNull('analista_id');
    }

    public function scopeSinAnalisis($query)
    {
        return $query->whereNull('tiempo_analisis')
                    ->orWhereNull('analista_id');
    }

    public function scopePorRangoFechas($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('tiempo_solicitud', [$fechaInicio, $fechaFin]);
    }

    /**
     * Filtrar por código de ORP (exacto o parcialmente)
     */
    public function scopePorOrpCodigo($query, $codigo)
    {
        if (!$codigo) return $query;
        return $query->whereHas('estadoPlanta.estadoDetalle.orp', function ($q) use ($codigo) {
            $q->where('codigo', $codigo)->orWhere('codigo', 'like', "%{$codigo}%");
        });
    }

    /**
     * Filtrar por nombre de producto (nombre_sap o nombre_comercial) asociado al ORP
     */
    public function scopePorProductoNombre($query, $nombre)
    {
        if (!$nombre) return $query;
        return $query->whereHas('estadoPlanta.estadoDetalle.orp.productoTerminado', function ($q) use ($nombre) {
            $q->where('nombre_sap', 'like', "%{$nombre}%")
              ->orWhere('nombre_comercial', 'like', "%{$nombre}%");
        });
    }

    /**
     * Filtrar por etapa (nombre de la etapa en Estado relacionado)
     */
    public function scopePorEtapa($query, $etapa)
    {
        if (!$etapa) return $query;
        return $query->whereHas('estadoPlanta.etapa', function ($q) use ($etapa) {
            $q->where('nombre', 'like', "%{$etapa}%");
        });
    }

    /**
     * Filtrar por destino del producto terminado
     */
    public function scopePorDestino($query, $destino)
    {
        if (!$destino) return $query;
        return $query->whereHas('estadoPlanta.estadoDetalle.orp.productoTerminado.destino', function ($q) use ($destino) {
            if (is_numeric($destino)) {
                $q->where('id', $destino);
            } else {
                $q->where('nombre', 'like', "%{$destino}%");
            }
        });
    }

    /**
     * Filtrar por preparación (campo en EstadoDetalle)
     */
    public function scopePorPreparacion($query, $preparacion)
    {
        if (!$preparacion) return $query;
        return $query->whereHas('estadoPlanta.detalles', function ($q) use ($preparacion) {
            $q->where('preparacion', $preparacion)->orWhere('preparacion', 'like', "%{$preparacion}%");
        });
    }

    /**
     * Filtrar por origen (origen_id o nombre)
     */
    public function scopePorOrigen($query, $origen)
    {
        if (!$origen) return $query;
        return $query->whereHas('estadoPlanta.origen', function ($q) use ($origen) {
            if (is_numeric($origen)) {
                $q->where('id', $origen);
            } else {
                $q->where('alias', 'like', "%{$origen}%")->orWhere('nombre', 'like', "%{$origen}%");
            }
        });
    }

    // Métodos de utilidad
    public function tieneAnalisis(): bool
    {
        return !is_null($this->tiempo_analisis) && !is_null($this->analista_id);
    }

    public function esPendiente(): bool
    {
        return $this->estado && $this->estado->nombre === 'Pendiente';
    }

    public function esCompletado(): bool
    {
        return $this->estado && $this->estado->nombre === 'Completado';
    }
}