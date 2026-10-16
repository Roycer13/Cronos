<?php

namespace App\Domain\PlantaLacteos\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LugarControlTemperatura extends Model
{
    use HasFactory;

    protected $table = 'PLL_lugar_control_temperaturas';
    
    protected $fillable = [
        'nombre',
        'tipo',
        'alias',
        'estado'
    ];

    protected $casts = [
        'estado' => 'boolean'
    ];

    public function scopeFilter($query, array $filters)
    {
        return $query
            ->when($filters['nombre'] ?? null, fn($q, $nombre) => 
                $q->where('nombre', 'like', "%{$nombre}%"))
            ->when($filters['tipo'] ?? null, fn($q, $tipo) => 
                $q->where('tipo', $tipo))
            ->when(isset($filters['estado']), fn($q, $estado) => 
                $q->where('estado', $estado));
    }

    // Relaciones
    public function temperaturasAlmacenCongelador()
    {
        return $this->hasMany(TemperaturaAlmacenCongelador::class, 'lugar_id');
    }

    public function serviciosFrios()
    {
        return $this->hasMany(ServicioFrio::class, 'lugar_id');
    }
}