<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\ModulosComunes\Productos\Models\ProductoTerminado;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParametroLinea extends Model
{
    use HasFactory;

    protected $table = 'PLL_parametros_linea';

    protected $fillable = [
        'etapa_id',
        'producto_terminado_id',
        'temperatura_min',
        'temperatura_max',
        'ph_min',
        'ph_max',
        'acidez_min',
        'acidez_max',
        'brix_min',
        'brix_max',
        'viscosidad_min',
        'viscosidad_max',
        'densidad_min',
        'densidad_max'
    ];

    protected $casts = [
        'temperatura_min' => 'decimal:5',
        'temperatura_max' => 'decimal:5',
        'ph_min' => 'decimal:5',
        'ph_max' => 'decimal:5',
        'acidez_min' => 'decimal:5',
        'acidez_max' => 'decimal:5',
        'brix_min' => 'decimal:5',
        'brix_max' => 'decimal:5',
        'viscosidad_min' => 'decimal:5',
        'viscosidad_max' => 'decimal:5',
        'densidad_min' => 'decimal:5',
        'densidad_max' => 'decimal:5',
    ];

    // Relaciones
    public function etapa()
    {
        return $this->belongsTo(Estado::class, 'etapa_id');
    }

    public function productoTerminado()
    {
        return $this->belongsTo(ProductoTerminado::class, 'producto_terminado_id');
    }

    // Scopes
    public function scopePorEtapa($query, $etapaId)
    {
        return $query->where('etapa_id', $etapaId);
    }

    public function scopePorProducto($query, $productoId)
    {
        return $query->where('producto_terminado_id', $productoId);
    }

    public function scopePorEtapaYProducto($query, $etapaId, $productoId)
    {
        return $query->where('etapa_id', $etapaId)
                     ->where('producto_terminado_id', $productoId);
    }

    public function scopeActivos($query)
    {
        return $query->whereHas('etapa', function($q) {
            // Si Estado tiene campo 'activo', úsalo
            // Si no, puedes filtrar por nombre o simplemente devolver todos
        })->whereHas('productoTerminado', function($q) {
            $q->activos(); // Usa el scope activos de ProductoTerminado
        });
    }

    // Métodos helper
    public function isTemperaturaValida($valor)
    {
        return $valor >= $this->temperatura_min && $valor <= $this->temperatura_max;
    }

    public function isPhValido($valor)
    {
        return $valor >= $this->ph_min && $valor <= $this->ph_max;
    }

    public function isAcidezValida($valor)
    {
        return $valor >= $this->acidez_min && $valor <= $this->acidez_max;
    }

    public function isBrixValido($valor)
    {
        return $valor >= $this->brix_min && $valor <= $this->brix_max;
    }

    public function isViscosidadValida($valor)
    {
        return $valor >= $this->viscosidad_min && $valor <= $this->viscosidad_max;
    }

    public function isDensidadValida($valor)
    {
        return $valor >= $this->densidad_min && $valor <= $this->densidad_max;
    }

    // Atributos accesores
    public function getRangoTemperaturaAttribute()
    {
        return "{$this->temperatura_min} - {$this->temperatura_max}";
    }

    public function getRangoPhAttribute()
    {
        return "{$this->ph_min} - {$this->ph_max}";
    }

    public function getRangoAcidezAttribute()
    {
        return "{$this->acidez_min} - {$this->acidez_max}";
    }

    public function getRangoBrixAttribute()
    {
        return "{$this->brix_min} - {$this->brix_max}";
    }

    public function getRangoViscosidadAttribute()
    {
        return "{$this->viscosidad_min} - {$this->viscosidad_max}";
    }

    public function getRangoDensidadAttribute()
    {
        return "{$this->densidad_min} - {$this->densidad_max}";
    }

    public function getRangosAttribute()
    {
        return [
            'temperatura' => $this->getRangoTemperaturaAttribute(),
            'ph' => $this->getRangoPhAttribute(),
            'acidez' => $this->getRangoAcidezAttribute(),
            'brix' => $this->getRangoBrixAttribute(),
            'viscosidad' => $this->getRangoViscosidadAttribute(),
            'densidad' => $this->getRangoDensidadAttribute(),
        ];
    }

    // Validar todos los parámetros
    public function validarParametros(array $valores)
    {
        $resultados = [];

        if (isset($valores['temperatura'])) {
            $resultados['temperatura'] = $this->isTemperaturaValida($valores['temperatura']);
        }
        if (isset($valores['ph'])) {
            $resultados['ph'] = $this->isPhValido($valores['ph']);
        }
        if (isset($valores['acidez'])) {
            $resultados['acidez'] = $this->isAcidezValida($valores['acidez']);
        }
        if (isset($valores['brix'])) {
            $resultados['brix'] = $this->isBrixValido($valores['brix']);
        }
        if (isset($valores['viscosidad'])) {
            $resultados['viscosidad'] = $this->isViscosidadValida($valores['viscosidad']);
        }
        if (isset($valores['densidad'])) {
            $resultados['densidad'] = $this->isDensidadValida($valores['densidad']);
        }

        return $resultados;
    }

    public function sonParametrosValidos(array $valores)
    {
        $resultados = $this->validarParametros($valores);
        return !in_array(false, $resultados, true);
    }
}
