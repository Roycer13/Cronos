<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalisisLeche extends Model
{
    use HasFactory;

    protected $table = 'PLL_analisis_leche';

    protected $fillable = [
        'PLL_recepcion_leches_id',
        'estado_id',
        'user_fq_id',
        'user_mb_siembra_id',
        'user_mb_lectura_id',
        'tiempo_fq',
        'tiempo_siembra',
        'tiempo_lectura',
        'temperatura',
        'ph',
        'acidez',
        'brix',
        'densidad',
        'prueba_alcohol',
        'contenido_graso',
        'temperatura_congelacion',
        'porcentaje_agua',
        'recuento',
        'antibioticos',
        'observaciones_fq',
        'observaciones_siembra',
        'observaciones_lectura'
    ];

    protected $casts = [
        'tiempo_fq' => 'datetime',
        'tiempo_siembra' => 'datetime',
        'tiempo_lectura' => 'datetime',
        'prueba_alcohol' => 'boolean'
    ];

    public function scopeFilter($query, array $filters)
    {
        return $query
            //filtros unitarios y para select
            ->when($filters['estado_id'] ?? null, fn($q, $estadoId) => $q->where('estado_id', $estadoId))
            ->when($filters['user_fq_id'] ?? null, fn($q, $userId) => $q->where('user_fq_id', $userId))
            ->when($filters['user_mb_siembra_id'] ?? null, fn($q, $userId) => $q->where('user_mb_siembra_id', $userId))
            ->when($filters['user_mb_lectura_id'] ?? null, fn($q, $userId) => $q->where('user_mb_lectura_id', $userId))
            // Filtro por subruta (a través de la relación recepcion)
            ->when($filters['subruta_id'] ?? null, function ($q, $subrutaId) {
                $q->whereHas('recepcion', function ($query) use ($subrutaId) {
                    $query->where('PLL_subruta_acopios_id', $subrutaId);
                });
            })
            // Filtro por ruta (a través de recepcion->subruta)
            ->when($filters['ruta_id'] ?? null, function ($q, $rutaId) {
                $q->whereHas('recepcion.subruta', function ($query) use ($rutaId) {
                    $query->where('PLL_ruta_acopios_id', $rutaId);
                });
            });
    }

    // Relaciones
    public function recepcion()
    {
        return $this->belongsTo(RecepcionLeche::class, 'PLL_recepcion_leches_id');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class);
    }

    public function analistaFQ()
    {
        return $this->belongsTo(User::class, 'user_fq_id');
    }

    public function analistaMBSiembra()
    {
        return $this->belongsTo(User::class, 'user_mb_siembra_id');
    }

    public function analistaMBLectura()
    {
        return $this->belongsTo(User::class, 'user_mb_lectura_id');
    }
}