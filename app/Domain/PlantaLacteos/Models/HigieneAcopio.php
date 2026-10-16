<?php
// app/Domain/PlantaLacteos/Models/HigieneAcopio.php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HigieneAcopio extends Model
{
    use HasFactory;

    protected $table = 'PLL_higiene_acopio';

    protected $fillable = [
        'tiempo',
        'user_id',
        'estado_id',
        'PLL_ruta_acopios_id',
        'superficie_llegada',
        'observacion_llegada',
        'correccion_llegada',
        'cofia',
        'Barbijo',
        'Overol',
        'superficie_salida',
        'observacion_salida',
        'correccion_salida',
    ];

    protected $casts = [
        'tiempo' => 'datetime',
        'superficie_llegada' => 'boolean',
        'cofia' => 'boolean',
        'Barbijo' => 'boolean',
        'Overol' => 'boolean',
        'superficie_salida' => 'boolean',
    ];

    // Scope para filtros
    public function scopeFilter($query, array $filters)
    {
        return $query
        ->when($filters['search'] ?? null, fn($q, $search) => $q->where(function($q) use ($search) {
    $q->where('observacion_llegada', 'like', "%{$search}%")
      ->orWhere('observacion_salida', 'like', "%{$search}%")
      ->orWhere('correccion_llegada', 'like', "%{$search}%")
      ->orWhere('correccion_salida', 'like', "%{$search}%");
}))
            ->when($filters['ruta_id'] ?? null, fn($q, $rutaId) => $q->where('PLL_ruta_acopios_id', $rutaId))
            ->when($filters['estado_id'] ?? null, fn($q, $estadoId) => $q->where('estado_id', $estadoId));
    }



    // Relaciones
    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

    public function ruta()
    {
        return $this->belongsTo(RutaAcopio::class, 'PLL_ruta_acopios_id');
    }
}
