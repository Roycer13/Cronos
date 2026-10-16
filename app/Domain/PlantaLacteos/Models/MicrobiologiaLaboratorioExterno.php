<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MicrobiologiaLaboratorioExterno extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'PLL_microbiologia_laboratorio_externo';

    protected $fillable = [
        'detalle_id',
        'estado_id',
        'tiempo_siembra',
        'tiempo_dia_2',
        'tiempo_dia_5',
        'usuario_siembra_id',
        'usuario_dia_2_id',
        'usuario_dia_5_id',
        'aerovios',
        'aerovios_2',
        'coliformes',
        'coliformes_2',
        'mohos',
        'mohos_2',
        'user_id',
        'observacion'
    ];

    protected $casts = [
        'tiempo_siembra' => 'datetime',
        'tiempo_dia_2' => 'datetime',
        'tiempo_dia_5' => 'datetime',
        'aerovios' => 'integer',
        'aerovios_2' => 'integer',
        'coliformes' => 'integer',
        'coliformes_2' => 'integer',
        'mohos' => 'integer',
        'mohos_2' => 'integer',
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
                            $uq->where('nombre', 'like', "%{$search}%"))
                        ->orWhereHas('user', fn($vq) =>
                            $vq->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('usuarioSiembra', fn($wq) =>
                            $wq->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('usuarioDia2', fn($xq) =>
                            $xq->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('usuarioDia5', fn($yq) =>
                            $yq->where('name', 'like', "%{$search}%"));
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
                $filters['user_id'] ?? null,
                fn($q, $user_id) =>
                $q->where('user_id', $user_id)
            )
            ->when(
                $filters['usuario_siembra_id'] ?? null,
                fn($q, $usuario_siembra_id) =>
                $q->where('usuario_siembra_id', $usuario_siembra_id)
            )
            ->when(
                $filters['usuario_dia_2_id'] ?? null,
                fn($q, $usuario_dia_2_id) =>
                $q->where('usuario_dia_2_id', $usuario_dia_2_id)
            )
            ->when(
                $filters['usuario_dia_5_id'] ?? null,
                fn($q, $usuario_dia_5_id) =>
                $q->where('usuario_dia_5_id', $usuario_dia_5_id)
            )
            ->when(
                $filters['tiempo_siembra_desde'] ?? null,
                fn($q, $tiempo_siembra_desde) =>
                $q->whereDate('tiempo_siembra', '>=', $tiempo_siembra_desde)
            )
            ->when(
                $filters['tiempo_siembra_hasta'] ?? null,
                fn($q, $tiempo_siembra_hasta) =>
                $q->whereDate('tiempo_siembra', '<=', $tiempo_siembra_hasta)
            )
            ->when(
                $filters['sin_siembra'] ?? null,
                fn($q, $sin_siembra) =>
                $sin_siembra ? $q->whereNull('tiempo_siembra') : $q
            )
            ->when(
                $filters['sin_dia_2'] ?? null,
                fn($q, $sin_dia_2) =>
                $sin_dia_2 ? $q->whereNull('tiempo_dia_2') : $q
            )
            ->when(
                $filters['sin_dia_5'] ?? null,
                fn($q, $sin_dia_5) =>
                $sin_dia_5 ? $q->whereNull('tiempo_dia_5') : $q
            )
            ->when(
                $filters['con_resultados'] ?? null,
                fn($q, $con_resultados) =>
                $con_resultados ? $q->whereNotNull('aerovios')->orWhereNotNull('coliformes')->orWhereNotNull('mohos') : $q
            )
            ->when(
                $filters['rango_aerovios_min'] ?? null,
                fn($q, $rango_aerovios_min) =>
                $q->where('aerovios', '>=', $rango_aerovios_min)
            )
            ->when(
                $filters['rango_aerovios_max'] ?? null,
                fn($q, $rango_aerovios_max) =>
                $q->where('aerovios', '<=', $rango_aerovios_max)
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

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function usuarioSiembra()
    {
        return $this->belongsTo(User::class, 'usuario_siembra_id');
    }

    public function usuarioDia2()
    {
        return $this->belongsTo(User::class, 'usuario_dia_2_id');
    }

    public function usuarioDia5()
    {
        return $this->belongsTo(User::class, 'usuario_dia_5_id');
    }



  }
