<?php
// app/Domain/PlantaLacteos/Models/LimpiezaTanqueAereo.php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LimpiezaTanqueAereo extends Model
{
    use HasFactory;

    protected $table = 'PLL_limpieza_tanques_aereos';

    protected $fillable = [
        'tiempo',
        'tanque',
        'user_id',
        'l_tapa',
        'd_tapa',
        'l_paredes',
        'd_paredes',
        'l_piso',
        'd_piso',
        'l_conexiones',
        'd_conexiones',
        'correccion',
        'observacion',
    ];

    protected $casts = [
        'tiempo' => 'datetime',
        'l_tapa' => 'boolean',
        'd_tapa' => 'boolean',
        'l_paredes' => 'boolean',
        'd_paredes' => 'boolean',
        'l_piso' => 'boolean',
        'd_piso' => 'boolean',
        'l_conexiones' => 'boolean',
        'd_conexiones' => 'boolean',
    ];

    // Scope para filtros
    public function scopeFilter($query, array $filters)
    {
        return $query
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('tanque', 'like', "%{$search}%")
                        ->orWhere('correccion', 'like', "%{$search}%")
                        ->orWhere('observacion', 'like', "%{$search}%");
                });
            })
            ->when($filters['tanque'] ?? null, fn($q, $tanque) => $q->where('tanque', 'like', "%{$tanque}%"))
            ->when($filters['user_id'] ?? null, fn($q, $userId) => $q->where('user_id', $userId))
            ->when($filters['fecha_desde'] ?? null, fn($q, $fecha) => $q->whereDate('tiempo', '>=', $fecha))
            ->when($filters['fecha_hasta'] ?? null, fn($q, $fecha) => $q->whereDate('tiempo', '<=', $fecha));
    }

    // Relaciones
    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
