<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CertificadoMicrobiologiaLaboratorioExterno extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'PLL_certificado_microbiologia_laboratorio_externo';

    protected $fillable = [
        'ubicacion_id',
        'detalle_id',
        'microbiologico_id',
        'min_mesofilos',
        'max_mesofilos',
        'min_coliformes',
        'max_coliformes',
        'max_mohos',
        'min_mohos',

        'mesofilos',
        'coliformes',
        'mohos',
        'mesofilos2',
        'coliformes2',
        'mohos2',

        'nombre',
        'codigo'
    ];

    protected $casts = [
        'mesofilos' => 'boolean',
        'coliformes' => 'boolean',
        'mohos' => 'boolean',
        'mesofilos2' => 'boolean',
        'coliformes2' => 'boolean',
        'mohos2' => 'boolean',
        'min_mesofilos' => 'integer',
        'max_mesofilos' => 'integer',

    ];

    public function scopeFilter($query, array $filters)
    {
        return $query
            ->when(
                $filters['search'] ?? null,
                fn($q, $search) =>
                $q->where(function ($query) use ($search) {
                    $query->whereHas('detalle', fn($mq) =>
                            $mq->where('codigo', 'like', "%{$search}%")
                               ->orWhereHas('solicitud', fn($sq) =>
                                   $sq->where('codigo', 'like', "%{$search}%")))
                        ->orWhereHas('ubicacion', fn($uq) =>
                            $uq->where('nombre', 'like', "%{$search}%"))
                        ->orWhereHas('microbiologico', fn($vq) =>
                            $vq->where('observacion', 'like', "%{$search}%"));
                })
            )
            ->when(
                $filters['ubicacion_id'] ?? null,
                fn($q, $ubicacion_id) =>
                $q->where('ubicacion_id', $ubicacion_id)
            )
            ->when(
                $filters['detalle_id'] ?? null,
                fn($q, $detalle_id) =>
                $q->where('detalle_id', $detalle_id)
            )
            ->when(
                $filters['microbiologico_id'] ?? null,
                fn($q, $microbiologico_id) =>
                $q->where('microbiologico_id', $microbiologico_id)
            )
            ->when(
                $filters['mesofilos'] ?? null,
                fn($q, $mesofilos) =>
                $q->where('mesofilos', $mesofilos)
            )
            ->when(
                $filters['coliformes'] ?? null,
                fn($q, $coliformes) =>
                $q->where('coliformes', $coliformes)
            )
            ->when(
                $filters['mohos'] ?? null,
                fn($q, $mohos) =>
                $q->where('mohos', $mohos)
            )
            ->when(
                $filters['mesofilos2'] ?? null,
                fn($q, $mesofilos2) =>
                $q->where('mesofilos2', $mesofilos2)
            )
            ->when(
                $filters['coliformes2'] ?? null,
                fn($q, $coliformes2) =>
                $q->where('coliformes2', $coliformes2)
            )
            ->when(
                $filters['mohos2'] ?? null,
                fn($q, $mohos2) =>
                $q->where('mohos2', $mohos2)
            )
            ->when(
                $filters['con_parametros'] ?? null,
                fn($q, $con_parametros) =>
                $con_parametros ? $q->where(function ($query) {
                    $query->where('mesofilos', true)
                        ->orWhere('coliformes', true)
                        ->orWhere('mohos', true)
                        ->orWhere('mesofilos2', true)
                        ->orWhere('coliformes2', true)
                        ->orWhere('mohos2', true);
                }) : $q
            )
            ->when(
                $filters['sin_microbiologico'] ?? null,
                fn($q, $sin_microbiologico) =>
                $sin_microbiologico ? $q->whereNull('microbiologico_id') : $q
            )
            ->when(
                $filters['con_microbiologico'] ?? null,
                fn($q, $con_microbiologico) =>
                $con_microbiologico ? $q->whereNotNull('microbiologico_id') : $q
            )
            ->when(
                $filters['tiene_limites'] ?? null,
                fn($q, $tiene_limites) =>
                $tiene_limites ? $q->where(function ($query) {
                    $query->whereNotNull('min_mesofilos')->orWhereNotNull('max_mesofilos')
                        ->orWhereNotNull('min_coliformes')->orWhereNotNull('max_coliformes')
                        ->orWhereNotNull('min_mohos')->orWhereNotNull('max_mohos')
                        ;
                }) : $q
            );
    }

    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }

    public function detalle()
    {
        return $this->belongsTo(DetalleSolicitudLaboratorioExterno::class, 'detalle_id');
    }

    public function microbiologico()
    {
        return $this->belongsTo(MicrobiologiaLaboratorioExterno::class, 'microbiologico_id');
    }

    // Accessor para obtener el total de parámetros incluidos
    public function getTotalParametrosAttribute()
    {
        $count = 0;
        if ($this->mesofilos) $count++;
        if ($this->coliformes) $count++;
        if ($this->mohos) $count++;
        if ($this->mesofilos2) $count++;
        if ($this->coliformes2) $count++;
        if ($this->mohos2) $count++;
        return $count;
    }

    // Accessor para obtener lista de parámetros incluidos
    public function getParametrosIncluidosAttribute()
    {
        $parametros = [];
        if ($this->mesofilos) $parametros[] = 'Mesófilos (día 2)';
        if ($this->coliformes) $parametros[] = 'Coliformes (día 2)';
        if ($this->mohos) $parametros[] = 'Mohos (día 2)';
        if ($this->mesofilos2) $parametros[] = 'Mesófilos (día 5)';
        if ($this->coliformes2) $parametros[] = 'Coliformes (día 5)';
        if ($this->mohos2) $parametros[] = 'Mohos (día 5)';
        return $parametros;
    }

    // Accessor para verificar si tiene análisis asociado
    public function getTieneAnalisisAsociadoAttribute()
    {
        return !is_null($this->microbiologico_id);
    }

    // Accessor para obtener el estado del certificado
    public function getEstadoCertificadoAttribute()
    {
        if ($this->tiene_analisis_asociado) {
            return 'Completado';
        }
        return 'Pendiente de análisis';
    }

    // Accessor para obtener rango de mesófilos (día 2)
    public function getRangoMesofilosAttribute()
    {
        if ($this->min_mesofilos || $this->max_mesofilos) {
            return ($this->min_mesofilos ?? 'N/A') . ' - ' . ($this->max_mesofilos ?? 'N/A');
        }
        return null;
    }

    // Accessor para obtener rango de coliformes (día 2)
    public function getRangoColiformesAttribute()
    {
        if ($this->min_coliformes || $this->max_coliformes) {
            return ($this->min_coliformes ?? 'N/A') . ' - ' . ($this->max_coliformes ?? 'N/A');
        }
        return null;
    }

    // Accessor para obtener rango de mohos (día 2)
    public function getRangoMohosAttribute()
    {
        if ($this->min_mohos || $this->max_mohos) {
            return ($this->min_mohos ?? 'N/A') . ' - ' . ($this->max_mohos ?? 'N/A');
        }
        return null;
    }



    // Método para verificar coherencia con el tipo de muestra
    public function verificarCoherenciaTipoMuestra()
    {
        if (!$this->detalle || !$this->detalle->tipoMuestra) {
            return null;
        }

        $tipoMuestra = $this->detalle->tipoMuestra;
        $inconsistencias = [];

        // Verificar que los parámetros del certificado coincidan con los requeridos por el tipo de muestra
        if ($this->mesofilos && !$tipoMuestra->mesofilos) {
            $inconsistencias[] = 'Mesófilos (día 2) no requeridos según tipo de muestra';
        }

        if ($this->coliformes && !$tipoMuestra->coliformes) {
            $inconsistencias[] = 'Coliformes (día 2) no requeridos según tipo de muestra';
        }

        if ($this->mohos && !$tipoMuestra->mohos) {
            $inconsistencias[] = 'Mohos (día 2) no requeridos según tipo de muestra';
        }

        if ($this->mesofilos2 && !$tipoMuestra->mesofilos2) {
            $inconsistencias[] = 'Mesófilos (día 5) no requeridos según tipo de muestra';
        }

        if ($this->coliformes2 && !$tipoMuestra->coliformes2) {
            $inconsistencias[] = 'Coliformes (día 5) no requeridos según tipo de muestra';
        }

        if ($this->mohos2 && !$tipoMuestra->mohos2) {
            $inconsistencias[] = 'Mohos (día 5) no requeridos según tipo de muestra';
        }

        return [
            'coherente' => empty($inconsistencias),
            'inconsistencias' => $inconsistencias,
            'tipo_muestra' => $tipoMuestra->nombre
        ];
    }

    // Método para verificar si el certificado está completo (todos los parámetros incluidos tienen valores en el análisis)
    public function verificarCompletitud()
    {
        if (!$this->tiene_analisis_asociado) {
            return [
                'completo' => false,
                'faltantes' => $this->parametros_incluidos,
                'mensaje' => 'No tiene análisis microbiológico asociado'
            ];
        }

        $faltantes = [];

        if ($this->mesofilos && is_null($this->microbiologico->aerovios)) {
            $faltantes[] = 'Mesófilos (día 2)';
        }

        if ($this->coliformes && is_null($this->microbiologico->coliformes)) {
            $faltantes[] = 'Coliformes (día 2)';
        }

        if ($this->mohos && is_null($this->microbiologico->mohos)) {
            $faltantes[] = 'Mohos (día 2)';
        }

        if ($this->mesofilos2 && is_null($this->microbiologico->aerovios_2)) {
            $faltantes[] = 'Mesófilos (día 5)';
        }

        if ($this->coliformes2 && is_null($this->microbiologico->coliformes_2)) {
            $faltantes[] = 'Coliformes (día 5)';
        }

        if ($this->mohos2 && is_null($this->microbiologico->mohos_2)) {
            $faltantes[] = 'Mohos (día 5)';
        }

        return [
            'completo' => empty($faltantes),
            'faltantes' => $faltantes,
            'total_parametros' => $this->total_parametros,
            'parametros_completados' => $this->total_parametros - count($faltantes)
        ];
    }



    private function verificarRango($valor, $min, $max)
    {
        if (is_null($min) && is_null($max)) return true;
        if (is_null($max)) return $valor >= $min;
        if (is_null($min)) return $valor <= $max;
        return $valor >= $min && $valor <= $max;
    }

    // Scopes adicionales
    public function scopeConParametro($query, $parametro)
    {
        return $query->where($parametro, true);
    }

    public function scopeConTodosParametros($query)
    {
        return $query->where('mesofilos', true)
                    ->where('coliformes', true)
                    ->where('mohos', true)
                    ->where('mesofilos2', true)
                    ->where('coliformes2', true)
                    ->where('mohos2', true);
    }

    public function scopeSinAnalisis($query)
    {
        return $query->whereNull('microbiologico_id');
    }

    public function scopeConAnalisis($query)
    {
        return $query->whereNotNull('microbiologico_id');
    }

    public function scopePorUbicacion($query, $ubicacion_id)
    {
        return $query->where('ubicacion_id', $ubicacion_id);
    }

    public function scopePorDetalle($query, $detalle_id)
    {
        return $query->where('detalle_id', $detalle_id);
    }

    public function scopeConLimitesDefinidos($query)
    {
        return $query->where(function ($q) {
            $q->whereNotNull('min_mesofilos')->orWhereNotNull('max_mesofilos')
              ->orWhereNotNull('min_coliformes')->orWhereNotNull('max_coliformes')
              ->orWhereNotNull('min_mohos')->orWhereNotNull('max_mohos');
        });
    }
}
