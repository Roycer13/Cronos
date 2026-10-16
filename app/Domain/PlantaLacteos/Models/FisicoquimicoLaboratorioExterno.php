<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FisicoquimicoLaboratorioExterno extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'PLL_fisicoquimico_laboratorio_externo';

    protected $fillable = [
        'tiempo',
        'detalle_id',
        'estado_id',
        'temperatura',
        'humedad_relativa',
        'actividad_agua',
        'observacion'
    ];

    protected $casts = [
        'tiempo' => 'datetime',
        'temperatura' => 'decimal:2',
        'humedad_relativa' => 'decimal:2',
        'actividad_agua' => 'decimal:2',
    ];

    public function scopeFilter($query, array $filters)
    {
        return $query
            ->when(
                $filters['search'] ?? null,
                fn($q, $search) =>
                $q->where(function ($query) use ($search) {
                    $query->where('observacion', 'like', "%{$search}%")
                        ->orWhereHas('detalle', fn($mq) =>
                            $mq->where('codigo', 'like', "%{$search}%")
                               ->orWhereHas('solicitud', fn($sq) =>
                                   $sq->where('codigo', 'like', "%{$search}%")))
                        ->orWhereHas('estado', fn($uq) =>
                            $uq->where('nombre', 'like', "%{$search}%"));
                })
            )
            ->when(
                $filters['detalle_id'] ?? null,
                fn($q, $detalle_id) =>
                $q->where('detalle_id', $detalle_id)
            )
            ->when(
                $filters['estado_id'] ?? null,
                fn($q, $estado_id) =>
                $q->where('estado_id', $estado_id)
            )
            ->when(
                $filters['tiempo_desde'] ?? null,
                fn($q, $tiempo_desde) =>
                $q->whereDate('tiempo', '>=', $tiempo_desde)
            )
            ->when(
                $filters['tiempo_hasta'] ?? null,
                fn($q, $tiempo_hasta) =>
                $q->whereDate('tiempo', '<=', $tiempo_hasta)
            )
            ->when(
                $filters['temperatura_min'] ?? null,
                fn($q, $temperatura_min) =>
                $q->where('temperatura', '>=', $temperatura_min)
            )
            ->when(
                $filters['temperatura_max'] ?? null,
                fn($q, $temperatura_max) =>
                $q->where('temperatura', '<=', $temperatura_max)
            )
            ->when(
                $filters['humedad_min'] ?? null,
                fn($q, $humedad_min) =>
                $q->where('humedad_relativa', '>=', $humedad_min)
            )
            ->when(
                $filters['humedad_max'] ?? null,
                fn($q, $humedad_max) =>
                $q->where('humedad_relativa', '<=', $humedad_max)
            )
            ->when(
                $filters['actividad_agua_min'] ?? null,
                fn($q, $actividad_agua_min) =>
                $q->where('actividad_agua', '>=', $actividad_agua_min)
            )
            ->when(
                $filters['actividad_agua_max'] ?? null,
                fn($q, $actividad_agua_max) =>
                $q->where('actividad_agua', '<=', $actividad_agua_max)
            )
            ->when(
                $filters['con_temperatura'] ?? null,
                fn($q, $con_temperatura) =>
                $con_temperatura ? $q->whereNotNull('temperatura') : $q
            )
            ->when(
                $filters['con_humedad'] ?? null,
                fn($q, $con_humedad) =>
                $con_humedad ? $q->whereNotNull('humedad_relativa') : $q
            )
            ->when(
                $filters['con_actividad_agua'] ?? null,
                fn($q, $con_actividad_agua) =>
                $con_actividad_agua ? $q->whereNotNull('actividad_agua') : $q
            )
            ->when(
                $filters['sin_resultados'] ?? null,
                fn($q, $sin_resultados) =>
                $sin_resultados ? $q->whereNull('temperatura')
                                 ->whereNull('humedad_relativa')
                                 ->whereNull('actividad_agua') : $q
            )
            ->when(
                $filters['con_resultados'] ?? null,
                fn($q, $con_resultados) =>
                $con_resultados ? $q->whereNotNull('temperatura')
                                    ->orWhereNotNull('humedad_relativa')
                                    ->orWhereNotNull('actividad_agua') : $q
            );
    }

    public function detalle()
    {
        return $this->belongsTo(DetalleSolicitudLaboratorioExterno::class, 'detalle_id');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

}
