<?php
namespace App\Domain\PlantaLacteos\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AguaHelada extends Model
{
    use HasFactory;

    protected $table = 'agua_helada';

    protected $fillable = [
        'ubicacion_id',
        'user_id',
        'fecha',
        'p1_dir',
        'p2_d1',
        'p3_d2',
        'p4_dir',
        'p5_dir',
        'p6_d3',
        'p7_dir',
    ];

    protected $casts = [
        'fecha' => 'datetime',
        'p1_dir' => 'decimal:2',
        'p2_d1' => 'decimal:2',
        'p3_d2' => 'decimal:2',
        'p4_dir' => 'decimal:2',
        'p5_dir' => 'decimal:2',
        'p6_d3' => 'decimal:2',
        'p7_dir' => 'decimal:2',
    ];

    public function ubicacion() {
        return $this->belongsTo(\App\Domain\Sistema\Configuracion\Models\Ubicacion::class);
    }

    public function usuario() {
        return $this->belongsTo(\App\Domain\Sistema\Configuracion\Models\User::class, 'user_id');
    }

    public function scopeFilter($query, array $filters) {
        return $query
            ->when($filters['ubicacion_id'] ?? null, fn($q, $v) => $q->where('ubicacion_id', $v))
            ->when($filters['user_id'] ?? null, fn($q, $v) => $q->where('user_id', $v))
            ->when($filters['fecha_desde'] ?? null, fn($q, $v) => $q->whereDate('fecha', '>=', $v))
            ->when($filters['fecha_hasta'] ?? null, fn($q, $v) => $q->whereDate('fecha', '<=', $v));
    }
}