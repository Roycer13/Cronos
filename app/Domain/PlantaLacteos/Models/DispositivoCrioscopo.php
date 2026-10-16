<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class DispositivoCrioscopo extends Model
{
    use HasFactory;

    protected $table = 'PLL_dispositivo_crioscopos';

    protected $fillable = [
        'fecha_hora',
        'user_id',
        'punto_ajuste_a',
        'punto_ajuste_b',
        'dispositivos_medicion_id',
        'estado_id',
        'observaciones',
    ];

    protected $casts = [
        'fecha_hora' => 'datetime',
        'punto_ajuste_a' => 'boolean',
        'punto_ajuste_b' => 'boolean',
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

    public function scopeConPuntoAjusteA(Builder $query)
    {
        return $query->where('punto_ajuste_a', true);
    }

    public function scopeConPuntoAjusteB(Builder $query)
    {
        return $query->where('punto_ajuste_b', true);
    }

    public function scopeOrdenarPorFecha(Builder $query, string $orden = 'desc')
    {
        return $query->orderBy('fecha_hora', $orden);
    }
}