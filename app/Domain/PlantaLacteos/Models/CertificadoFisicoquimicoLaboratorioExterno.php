<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CertificadoFisicoquimicoLaboratorioExterno extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'PLL_certificado_fisicoquimico_laboratorio_externo';

    protected $fillable = [
        'ubicacion_id',
        'detalle_id',
        'temperatura',
        'humedad',
        'actividad_agua',
        'ph',
        'dureza',
        'cloruros',
        'fisicoquimico_id',
        'nombre',
        'codigo'
    ];

    protected $casts = [
        'temperatura' => 'boolean',
        'humedad' => 'boolean',
        'actividad_agua' => 'boolean',
        'ph' => 'boolean',
        'dureza' => 'boolean',
        'cloruros' => 'boolean',
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
                        ->orWhereHas('fisicoquimico', fn($vq) =>
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
                $filters['fisicoquimico_id'] ?? null,
                fn($q, $fisicoquimico_id) =>
                $q->where('fisicoquimico_id', $fisicoquimico_id)
            )
            ->when(
                $filters['temperatura'] ?? null,
                fn($q, $temperatura) =>
                $q->where('temperatura', $temperatura)
            )
            ->when(
                $filters['humedad'] ?? null,
                fn($q, $humedad) =>
                $q->where('humedad', $humedad)
            )
            ->when(
                $filters['actividad_agua'] ?? null,
                fn($q, $actividad_agua) =>
                $q->where('actividad_agua', $actividad_agua)
            )
            ->when(
                $filters['ph'] ?? null,
                fn($q, $ph) =>
                $q->where('ph', $ph)
            )
            ->when(
                $filters['dureza'] ?? null,
                fn($q, $dureza) =>
                $q->where('dureza', $dureza)
            )
            ->when(
                $filters['cloruros'] ?? null,
                fn($q, $cloruros) =>
                $q->where('cloruros', $cloruros)
            )
            ->when(
                $filters['con_parametros'] ?? null,
                fn($q, $con_parametros) =>
                $con_parametros ? $q->where(function ($query) {
                    $query->where('temperatura', true)
                        ->orWhere('humedad', true)
                        ->orWhere('actividad_agua', true)
                        ->orWhere('ph', true)
                        ->orWhere('dureza', true)
                        ->orWhere('cloruros', true);
                }) : $q
            )
            ->when(
                $filters['sin_fisicoquimico'] ?? null,
                fn($q, $sin_fisicoquimico) =>
                $sin_fisicoquimico ? $q->whereNull('fisicoquimico_id') : $q
            )
            ->when(
                $filters['con_fisicoquimico'] ?? null,
                fn($q, $con_fisicoquimico) =>
                $con_fisicoquimico ? $q->whereNotNull('fisicoquimico_id') : $q
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

    public function fisicoquimico()
    {
        return $this->belongsTo(FisicoquimicoLaboratorioExterno::class, 'fisicoquimico_id');
    }

    // Accessor para obtener el total de parámetros incluidos
    public function getTotalParametrosAttribute()
    {
        $count = 0;
        if ($this->temperatura) $count++;
        if ($this->humedad) $count++;
        if ($this->actividad_agua) $count++;
        if ($this->ph) $count++;
        if ($this->dureza) $count++;
        if ($this->cloruros) $count++;
        return $count;
    }

    // Accessor para obtener lista de parámetros incluidos
    public function getParametrosIncluidosAttribute()
    {
        $parametros = [];
        if ($this->temperatura) $parametros[] = 'Temperatura';
        if ($this->humedad) $parametros[] = 'Humedad';
        if ($this->actividad_agua) $parametros[] = 'Actividad de agua';
        if ($this->ph) $parametros[] = 'pH';
        if ($this->dureza) $parametros[] = 'Dureza';
        if ($this->cloruros) $parametros[] = 'Cloruros';
        return $parametros;
    }

    // Accessor para verificar si tiene análisis asociado
    public function getTieneAnalisisAsociadoAttribute()
    {
        return !is_null($this->fisicoquimico_id);
    }

    // Accessor para obtener el estado del certificado
    public function getEstadoCertificadoAttribute()
    {
        if ($this->tiene_analisis_asociado) {
            return 'Completado';
        }
        return 'Pendiente de análisis';
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
        if ($this->temperatura && !$tipoMuestra->temperatura) {
            $inconsistencias[] = 'Temperatura no requerida según tipo de muestra';
        }

        if ($this->humedad && !$tipoMuestra->humedad) {
            $inconsistencias[] = 'Humedad no requerida según tipo de muestra';
        }

        if ($this->actividad_agua && !$tipoMuestra->actividad_agua) {
            $inconsistencias[] = 'Actividad de agua no requerida según tipo de muestra';
        }

        if ($this->ph && !$tipoMuestra->ph) {
            $inconsistencias[] = 'pH no requerido según tipo de muestra';
        }

        if ($this->dureza && !$tipoMuestra->dureza) {
            $inconsistencias[] = 'Dureza no requerida según tipo de muestra';
        }

        if ($this->cloruros && !$tipoMuestra->cloruros) {
            $inconsistencias[] = 'Cloruros no requeridos según tipo de muestra';
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
                'mensaje' => 'No tiene análisis fisicoquímico asociado'
            ];
        }

        $faltantes = [];

        if ($this->temperatura && is_null($this->fisicoquimico->temperatura)) {
            $faltantes[] = 'Temperatura';
        }

        if ($this->humedad && is_null($this->fisicoquimico->humedad_relativa)) {
            $faltantes[] = 'Humedad';
        }

        if ($this->actividad_agua && is_null($this->fisicoquimico->actividad_agua)) {
            $faltantes[] = 'Actividad de agua';
        }

        // Nota: Los campos ph, dureza, cloruros no existen en FisicoquimicoLaboratorioExterno
        // según la migración que me mostraste. Si los necesitas, deberías agregarlos.
        if ($this->ph) {
            $faltantes[] = 'pH (campo no disponible en análisis)';
        }

        if ($this->dureza) {
            $faltantes[] = 'Dureza (campo no disponible en análisis)';
        }

        if ($this->cloruros) {
            $faltantes[] = 'Cloruros (campo no disponible en análisis)';
        }

        return [
            'completo' => empty($faltantes),
            'faltantes' => $faltantes,
            'total_parametros' => $this->total_parametros,
            'parametros_completados' => $this->total_parametros - count($faltantes)
        ];
    }

    // Scopes adicionales
    public function scopeConParametro($query, $parametro)
    {
        return $query->where($parametro, true);
    }

    public function scopeConTodosParametros($query)
    {
        return $query->where('temperatura', true)
                    ->where('humedad', true)
                    ->where('actividad_agua', true)
                    ->where('ph', true)
                    ->where('dureza', true)
                    ->where('cloruros', true);
    }

    public function scopeSinAnalisis($query)
    {
        return $query->whereNull('fisicoquimico_id');
    }

    public function scopeConAnalisis($query)
    {
        return $query->whereNotNull('fisicoquimico_id');
    }

    public function scopePorUbicacion($query, $ubicacion_id)
    {
        return $query->where('ubicacion_id', $ubicacion_id);
    }

    public function scopePorDetalle($query, $detalle_id)
    {
        return $query->where('detalle_id', $detalle_id);
    }
}
