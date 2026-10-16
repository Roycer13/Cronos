<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\ModulosComunes\Orp\Models\Orp;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\MaquinaEquipo;
use App\Domain\Sistema\Configuracion\Models\Sector;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SeguimientoUht extends Model
{
    use HasFactory;

    protected $table = 'PLL_seguimiento_uht';

    protected $fillable = [

        'origen_id',
        'user_id',
        'lote',
        'tiempo',
        'tiempo_siembra',
        'tiempo_dia_2',
        'tiempo_dia_5',
        'usuario_siembra_id',
        'usuario_dia_2_id',
        'usuario_dia_5_id',
        'aerovios',
        'coliformes',
        'mohos',
        'estado_id',
        'observacion_siembra',
        'observacion_lectura',
        'numero'

    ];

    // Relaciones

    public function origen()
    {
        return $this->belongsTo(Origen::class, 'origen_id');
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
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

    public function detalles()
    {
        return $this->hasMany(DetalleSeguimientoUht::class, 'seguimiento_uht_id');
    }

    // =========================
    // Scope Filter (MISMO FORMATO QUE HTST)
    // =========================

    public function scopeFilter($query, array $filters)
    {
        return $query
            ->when(
                $filters['search'] ?? null,
                fn($q, $search) =>
                $q->where(function ($query) use ($search) {
                    $query
                        ->where('lote', 'like', "%{$search}%")

                        // 🔑 ORP desde detalle
                        ->orWhereHas(
                            'detalles.orp',
                            fn($mq) =>
                            $mq->where('codigo', 'like', "%{$search}%")
                        )

                        ->orWhereHas(
                            'user',
                            fn($mq) =>
                            $mq->where('name', 'like', "%{$search}%")
                        )

                        ->orWhereHas(
                            'estado',
                            fn($mq) =>
                            $mq->where('nombre', 'like', "%{$search}%")
                        )

                        ->orWhereHas(
                            'origen',
                            fn($mq) =>
                            $mq->where('alias', 'like', "%{$search}%")
                        )

                        ->orWhereHas(
                            'usuarioSiembra',
                            fn($mq) =>
                            $mq->where('name', 'like', "%{$search}%")
                        )

                        ->orWhereHas(
                            'usuarioDia2',
                            fn($mq) =>
                            $mq->where('name', 'like', "%{$search}%")
                        )

                        ->orWhereHas(
                            'usuarioDia5',
                            fn($mq) =>
                            $mq->where('name', 'like', "%{$search}%")
                        );
                })
            )

            // 🔑 filtro ORP (desde detalle)
            ->when(
                $filters['orp'] ?? null,
                fn($q, $orp) =>
                $q->whereHas(
                    'detalles.orp',
                    fn($mq) =>
                    $mq->where('codigo', 'like', "%{$orp}%")
                )
            )
            //filtro de producto terminado (desde detalle -> orp -> producto terminado)
            ->when(
                $filters['producto_terminado'] ?? null,
                fn($q, $productoTerminado) =>
                $q->whereHas(
                    'detalles.orp.productoTerminado',
                    fn($mq) =>
                    $mq->where('nombre_sap', 'like', "%{$productoTerminado}%")
                )
            )

            ->when(
                $filters['origen'] ?? null,
                fn($q, $origen) =>
                $q->whereHas(
                    'origen',
                    fn($mq) =>
                    $mq->where('alias', 'like', "%{$origen}%")
                )
            )

            ->when(
                $filters['usuario'] ?? null,
                fn($q, $usuario) =>
                $q->whereHas(
                    'user',
                    fn($mq) =>
                    $mq->where('name', 'like', "%{$usuario}%")
                )
            )

            ->when(
                $filters['estado'] ?? null,
                fn($q, $estado) =>
                $q->whereHas(
                    'estado',
                    fn($mq) =>
                    $mq->where('nombre', $estado)
                )
            )

            ->when(
                $filters['usuario_siembra'] ?? null,
                fn($q, $usuario) =>
                $q->whereHas(
                    'usuarioSiembra',
                    fn($mq) =>
                    $mq->where('name', $usuario)
                )
            )

            ->when(
                $filters['usuario_dia_2'] ?? null,
                fn($q, $usuario) =>
                $q->whereHas(
                    'usuarioDia2',
                    fn($mq) =>
                    $mq->where('name', $usuario)
                )
            )


            ->when(
    $filters['fecha_vencimiento_desde'] ?? null,
    fn($q, $desde) => $q->whereHas('detalles.orp', fn($oq) => $oq->whereDate('fecha_vencimiento1', '>=', $desde))
)
->when(
    $filters['fecha_vencimiento_hasta'] ?? null,
    fn($q, $hasta) => $q->whereHas('detalles.orp', fn($oq) => $oq->whereDate('fecha_vencimiento1', '<=', $hasta))
)
            ->when(
                $filters['usuario_dia_5'] ?? null,
                fn($q, $usuario) =>
                $q->whereHas(
                    'usuarioDia5',
                    fn($mq) =>
                    $mq->where('name', $usuario)
                )
            );
    }
}
