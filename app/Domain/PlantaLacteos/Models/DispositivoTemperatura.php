<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class DispositivoTemperatura extends Model
{
    use HasFactory;

    protected $table = 'PLL_dispositivo_temperaturas';

    protected $fillable = [
        'fecha_hora',
        'patron_1',
        'inst_1',
        'error_1',
        'patron_2',
        'inst_2',
        'error_2',
        'patron_3',
        'inst_3',
        'error_3',
        'dispositivos_medicion_id',
        'user_id',
        'estado_id',
        'observaciones',
    ];

    protected $casts = [
        'fecha_hora' => 'datetime',
        'patron_1' => 'decimal:2',
        'inst_1' => 'decimal:2',
        'error_1' => 'decimal:2',
        'patron_2' => 'decimal:2',
        'inst_2' => 'decimal:2',
        'error_2' => 'decimal:2',
        'patron_3' => 'decimal:2',
        'inst_3' => 'decimal:2',
        'error_3' => 'decimal:2',
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

    public function scopeConErrorMayorA(Builder $query, float $error)
    {
        return $query->where(function($q) use ($error) {
            $q->where('error_1', '>', $error)
              ->orWhere('error_2', '>', $error)
              ->orWhere('error_3', '>', $error);
        });
    }

    public function scopeOrdenarPorFecha(Builder $query, string $orden = 'desc')
    {
        return $query->orderBy('fecha_hora', $orden);
    }
}