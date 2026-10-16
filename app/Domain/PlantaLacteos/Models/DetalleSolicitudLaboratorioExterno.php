<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\ModulosComunes\Productos\Models\ProductoTerminado;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DetalleSolicitudLaboratorioExterno extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'PLL_detalle_solicitud_laboratorio_externo';

    protected $fillable = [
        'solicitud_id',
        'user_id',
        'item_materia_prima_id',
        'producto_terminado_id',
        'otros',
        'codigo',
        'tiempo_autorizado',
        'observacion',
        'autorizante_id',
        'estado_id',
        'tipo_muestra_id',
        'lote',
        'tipo',
        'fecha_muestreo',

    ];

    protected $casts = [
        'tiempo_autorizado' => 'datetime',
    ];

    public function scopeFilter($query, array $filters)
    {
        return $query
            ->when(
                $filters['search'] ?? null,
                fn($q, $search) =>
                $q->where(function ($query) use ($search) {
                    $query->where('codigo', 'like', "%{$search}%")
                        ->orWhere('otros', 'like', "%{$search}%")
                        ->orWhere('observacion', 'like', "%{$search}%")
                        ->orWhereHas('user', fn($mq) =>
                            $mq->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('autorizante', fn($sq) =>
                            $sq->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('estado', fn($uq) =>
                            $uq->where('nombre', 'like', "%{$search}%"))
                        ->orWhereHas('itemMateriaPrima', fn($vq) =>
                            $vq->where('nombre', 'like', "%{$search}%"))
                        ->orWhereHas('tipoMuestra', fn($wq) =>
                            $wq->where('nombre', 'like', "%{$search}%"))
                        ->orWhereHas('solicitud', fn($xq) =>
                            $xq->where('codigo', 'like', "%{$search}%"));
                })
            )
            ->when(
                $filters['solicitud_id'] ?? null,
                fn($q, $solicitud_id) =>
                $q->where('solicitud_id', $solicitud_id)
            )
            ->when(
                $filters['user_id'] ?? null,
                fn($q, $user_id) =>
                $q->where('user_id', $user_id)
            )
            ->when(
                $filters['item_materia_prima_id'] ?? null,
                fn($q, $item_materia_prima_id) =>
                $q->where('item_materia_prima_id', $item_materia_prima_id)
            )
            ->when(
                $filters['autorizante_id'] ?? null,
                fn($q, $autorizante_id) =>
                $q->where('autorizante_id', $autorizante_id)
            )
            ->when(
                $filters['estado_id'] ?? null,
                fn($q, $estado_id) =>
                $q->where('estado_id', $estado_id)
            )
            ->when(
                $filters['tipo_muestra_id'] ?? null,
                fn($q, $tipo_muestra_id) =>
                $q->where('tipo_muestra_id', $tipo_muestra_id)
            )
            ->when(
                $filters['codigo'] ?? null,
                fn($q, $codigo) =>
                $q->where('codigo', 'like', "%{$codigo}%")
            )
            ->when(
                $filters['tiempo_autorizado_desde'] ?? null,
                fn($q, $tiempo_autorizado_desde) =>
                $q->whereDate('tiempo_autorizado', '>=', $tiempo_autorizado_desde)
            )
            ->when(
                $filters['tiempo_autorizado_hasta'] ?? null,
                fn($q, $tiempo_autorizado_hasta) =>
                $q->whereDate('tiempo_autorizado', '<=', $tiempo_autorizado_hasta)
            )
            ->when(
                $filters['tiene_otros'] ?? null,
                fn($q, $tiene_otros) =>
                $tiene_otros ? $q->whereNotNull('otros')->where('otros', '!=', '') : $q
            )
            ->when(
                $filters['sin_autorizar'] ?? null,
                fn($q, $sin_autorizar) =>
                $sin_autorizar ? $q->whereNull('tiempo_autorizado') : $q
            )
            ->when(
                $filters['autorizados'] ?? null,
                fn($q, $autorizados) =>
                $autorizados ? $q->whereNotNull('tiempo_autorizado') : $q
            );
    }

    public function solicitud()
    {
        return $this->belongsTo(SolicitudLaboratorioExterno::class, 'solicitud_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function itemMateriaPrima()
    {
        return $this->belongsTo(ItemMateriaPrima::class, 'item_materia_prima_id');
    }

    public function autorizante()
    {
        return $this->belongsTo(User::class, 'autorizante_id');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

    public function tipoMuestra()
    {
        return $this->belongsTo(TipoMuestralaboratorioExterno::class, 'tipo_muestra_id');
    }

    public function productoTerminado()
    {
        return $this->belongsTo(ProductoTerminado::class, 'producto_terminado_id');
    }



}
