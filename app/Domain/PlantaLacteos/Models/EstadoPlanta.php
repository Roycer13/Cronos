<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\MaquinaEquipo;
use App\Domain\Sistema\Configuracion\Models\Sector;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstadoPlanta extends Model
{
    use HasFactory;

    protected $table = 'PLL_estado_plantas';

    protected $fillable = [
        'tiempo',
        'user_id',
        'origen_id',
        'proceso_id',
        'etapa_id',
        'observaciones'
    ];

    protected $casts = [
        'tiempo' => 'datetime',
    ];

    // Relaciones
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function origen()
    {
        return $this->belongsTo(Origen::class);
    }

    public function proceso()
    {
        return $this->belongsTo(Estado::class, 'proceso_id');
    }

    public function etapa()
    {
        return $this->belongsTo(Estado::class, 'etapa_id');
    }

    public function detalles()
    {
        return $this->hasMany(EstadoDetalle::class, 'estado_planta_id');
    }

    // Relación singular al primer detalle (para compatibilidad)
    public function estadoDetalle()
    {
        return $this->hasOne(EstadoDetalle::class, 'estado_planta_id');
    }
    
    public function analisisLinea()
    {
        return $this->hasOne(AnalisisLinea::class, 'estado_planta_id')->latestOfMany();
    }

    // Alias para solicitudAnalisisLinea (compatibilidad con código existente)
    public function solicitudAnalisisLinea()
    {
        return $this->hasOne(AnalisisLinea::class, 'estado_planta_id')->latestOfMany();
    }

    // Scopes
    public function scopeConDetalles($query)
    {
        return $query->with(['detalles', 'origen', 'proceso', 'etapa', 'user']);
    }

    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('tiempo', $fecha);
    }

    public function scopePorRangoFechas($query, $desde, $hasta)
    {
        return $query->whereBetween('tiempo', [$desde, $hasta]);
    }

    public function scopePorOrigen($query, $origenId)
    {
        return $query->where('origen_id', $origenId);
    }

    public function scopePorProceso($query, $procesoId)
    {
        return $query->where('proceso_id', $procesoId);
    }

    public function scopePorEtapa($query, $etapaId)
    {
        return $query->where('etapa_id', $etapaId);
    }

    public function scopePorUsuario($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecientes($query)
    {
        return $query->orderBy('tiempo', 'desc');
    }

    public function scopeConObservaciones($query)
    {
        return $query->whereNotNull('observaciones')->where('observaciones', '!=', '');
    }
}
