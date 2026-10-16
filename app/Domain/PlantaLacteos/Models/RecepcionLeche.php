<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecepcionLeche extends Model
{
    use HasFactory;

    protected $table = 'PLL_recepcion_leches';

    protected $fillable = [
        'PLL_subruta_acopios_id',
        'tiempo',
        'estado_id',
        'user_id',
        'cantidad',
        'observaciones',
        'tipo_recepcion'
    ];

    protected $casts = [
        'tiempo' => 'datetime',
        'cantidad' => 'decimal:2'
    ];

    public function scopeFilter($query, array $filters)
    {
        return $query
            //filtros unitarios y para select
            ->when($filters['PLL_subruta_acopios_id'] ?? null, fn($q, $subrutaId) => $q->where('PLL_subruta_acopios_id', $subrutaId))
            ->when($filters['estado_id'] ?? null, fn($q, $estadoId) => $q->where('estado_id', $estadoId))
            ->when($filters['user_id'] ?? null, fn($q, $userId) => $q->where('user_id', $userId))
            ->when($filters['tipo_recepcion'] ?? null, fn($q, $tipoRecepcion) => $q->where('tipo_recepcion', 'like', "%{$tipoRecepcion}%"))
            // Filtro por ruta (a través de la relación subruta)
            ->when($filters['ruta_id'] ?? null, function ($q, $rutaId) {
                $q->whereHas('subruta', function ($query) use ($rutaId) {
                    $query->where('PLL_ruta_acopios_id', $rutaId);
                });
            });
    }

    // Relaciones
    public function subruta()
    {
        return $this->belongsTo(SubRutaAcopio::class, 'PLL_subruta_acopios_id');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function analisis()
    {
        return $this->hasMany(AnalisisLeche::class,'PLL_recepcion_leches_id', 'id');
    }
}