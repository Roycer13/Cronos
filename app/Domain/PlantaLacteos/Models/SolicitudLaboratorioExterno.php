<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SolicitudLaboratorioExterno extends Model
{
    use HasFactory;

    protected $table = 'PLL_solicitud_laboratorio_externo';

    protected $fillable = [
        'tiempo',
        'tiempo_autorizacion',
        'autorizante_id',
        'estado_id',
        'codigo',
        'user_id',
        'ubicacion_id',
        'observacion'
    ];

    protected $casts = [
        'tiempo' => 'datetime',
        'tiempo_autorizacion' => 'datetime',
    ];

    public function scopeFilter($query, array $filters)
    {
        return $query
            ->when(
                $filters['search'] ?? null,
                fn($q, $search) =>
                $q->where(function ($query) use ($search) {
                    $query->where('codigo', 'like', "%{$search}%")
                        ->orWhere('observacion', 'like', "%{$search}%")
                        ->orWhereHas('user', fn($mq) =>
                            $mq->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('autorizante', fn($sq) =>
                            $sq->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('estado', fn($uq) =>
                            $uq->where('nombre', 'like', "%{$search}%"));
                })
            )
            ->when(
                $filters['user_id'] ?? null,
                fn($q, $user_id) =>
                $q->where('user_id', $user_id)
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
                $filters['ubicacion_id'] ?? null,
                fn($q, $ubicacion_id) =>
                $q->where('ubicacion_id', $ubicacion_id)
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
                $filters['tiempo_autorizacion_desde'] ?? null,
                fn($q, $tiempo_autorizacion_desde) =>
                $q->whereDate('tiempo_autorizacion', '>=', $tiempo_autorizacion_desde)
            )
            ->when(
                $filters['tiempo_autorizacion_hasta'] ?? null,
                fn($q, $tiempo_autorizacion_hasta) =>
                $q->whereDate('tiempo_autorizacion', '<=', $tiempo_autorizacion_hasta)
            );
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function autorizante()
    {
        return $this->belongsTo(User::class, 'autorizante_id');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleSolicitudLaboratorioExterno::class, 'solicitud_id');
    }


}
