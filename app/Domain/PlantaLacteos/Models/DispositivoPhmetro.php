<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class DispositivoPhmetro extends Model
{
    use HasFactory;

    protected $table = 'PLL_dispositivo_phmetros';

    protected $fillable = [
        'fecha_hora',
        'verificacion_temperatura1',
        'verificacion_temperatura2',
        'verificacion_temperatura3',
        'verificacion_4',
        'verificacion_7',
        'verificacion_10',
        'requiere_ajuste',
        'verificacion_ajuste_temperatura1',
        'verificacion_ajuste_temperatura2',
        'verificacion_ajuste_temperatura3',
        'verificacion_ajuste_4',
        'verificacion_ajuste_7',
        'verificacion_ajuste_10',
        'dispositivos_medicion_id',
        'user_id',
        'estado_id',
        'observaciones',
    ];

    protected $casts = [
        'fecha_hora' => 'datetime',
        'requiere_ajuste' => 'boolean',
        'verificacion_temperatura1' => 'decimal:2',
        'verificacion_temperatura2' => 'decimal:2',
        'verificacion_temperatura3' => 'decimal:2',
        'verificacion_4' => 'decimal:2',
        'verificacion_7' => 'decimal:2',
        'verificacion_10' => 'decimal:2',
        'verificacion_ajuste_temperatura1' => 'decimal:2',
        'verificacion_ajuste_temperatura2' => 'decimal:2',
        'verificacion_ajuste_temperatura3' => 'decimal:2',
        'verificacion_ajuste_4' => 'decimal:2',
        'verificacion_ajuste_7' => 'decimal:2',
        'verificacion_ajuste_10' => 'decimal:2',
    ];

    // Relaciones
    public function dispositivoMedicion()
    {
        return $this->belongsTo(DispositivoMedicion::class, 'dispositivos_medicion_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

    // Scopes
    public function scopeFiltrarPorFechas(Builder $query, ?string $fechaInicio, ?string $fechaFin)
    {
        if ($fechaInicio) {
            $query->where('fecha_hora', '>=', $fechaInicio);
        }
        if ($fechaFin) {
            $query->where('fecha_hora', '<=', $fechaFin);
        }
        return $query;
    }

    public function scopeFiltrarPorDispositivo(Builder $query, ?int $dispositivoId)
    {
        if ($dispositivoId) {
            $query->where('dispositivos_medicion_id', $dispositivoId);
        }
        return $query;
    }

    public function scopeFiltrarPorEstado(Builder $query, ?int $estadoId)
    {
        if ($estadoId) {
            $query->where('estado_id', $estadoId);
        }
        return $query;
    }

    public function scopeFiltrarPorUsuario(Builder $query, ?int $usuarioId)
    {
        if ($usuarioId) {
            $query->where('user_id', $usuarioId);
        }
        return $query;
    }

    public function scopeConAjusteRequerido(Builder $query)
    {
        return $query->where('requiere_ajuste', true);
    }

    public function scopeOrdenarPorFecha(Builder $query, string $orden = 'desc')
    {
        return $query->orderBy('fecha_hora', $orden);
    }
}