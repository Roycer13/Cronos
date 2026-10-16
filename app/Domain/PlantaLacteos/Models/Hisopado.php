<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\ModulosComunes\Orp\Models\Orp;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\MaquinaEquipo;
use App\Domain\Sistema\Configuracion\Models\Sector;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Hisopado extends Model
{
    use HasFactory;

    protected $table = 'PLL_hisopados';

    protected $fillable = [
        'tiempo',
        'tiempo_siembra',
        'tiempo_lectura',
        'coliformes',
        'estado_id',
        'user_id',
        'usuario_siembra_id',
        'usuario_lectura_id',
        'observacion_siembra',
        'observacion_lectura'
    ];



    // Relaciones

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

    public function usuarioSiembra()
    {
        return $this->belongsTo(User::class, 'usuario_siembra_id');
    }

    public function usuarioLectura()
    {
        return $this->belongsTo(User::class, 'usuario_lectura_id');
    }


    public function hisopadoCorrecciones()
    {
        return $this->hasMany(HisopadoCorreccion::class, 'hisopado_id');
    }




     public function scopeFilter($query, array $filters)
{
    // 🔹 JOINs solo una vez
    $query
        ->leftJoin('users as u', 'PLL_hisopados.user_id', '=', 'u.id')
        ->leftJoin('estados as e', 'PLL_hisopados.estado_id', '=', 'e.id')
        ->leftJoin('users as us', 'PLL_hisopados.usuario_siembra_id', '=', 'us.id')
        ->leftJoin('users as ul', 'PLL_hisopados.usuario_lectura_id', '=', 'ul.id')
        ->select('PLL_hisopados.*');

    // 🔎 SEARCH
    if (!empty($filters['search'])) {
        $search = $filters['search'];

        $query->where(function ($q) use ($search) {
            $q->where('PLL_hisopados.observacion_siembra', 'like', "%{$search}%")
              ->orWhere('PLL_hisopados.observacion_lectura', 'like', "%{$search}%")
              ->orWhere('PLL_hisopados.coliformes', 'like', "%{$search}%")
              ->orWhere('u.name', 'like', "%{$search}%")
              ->orWhere('e.nombre', 'like', "%{$search}%")
              ->orWhere('us.name', 'like', "%{$search}%")
              ->orWhere('ul.name', 'like', "%{$search}%");
        });
    }

    // 📅 FECHAS
    $query->when($filters['fecha_desde'] ?? null,
        fn($q, $v) => $q->whereDate('PLL_hisopados.tiempo', '>=', $v)
    );

    $query->when($filters['fecha_hasta'] ?? null,
        fn($q, $v) => $q->whereDate('PLL_hisopados.tiempo', '<=', $v)
    );

    // 🎯 FILTROS EXACTOS
    $query->when($filters['estado'] ?? null,
        fn($q, $v) => $q->where('e.nombre', $v)
    );

    $query->when($filters['usuario'] ?? null,
        fn($q, $v) => $q->where('u.name', $v)
    );

    $query->when($filters['usuario_siembra'] ?? null,
        fn($q, $v) => $q->where('us.name', $v)
    );

    $query->when($filters['usuario_lectura'] ?? null,
        fn($q, $v) => $q->where('ul.name', $v)
    );

    $query->when($filters['coliformes_min'] ?? null,
        fn($q, $v) => $q->where('PLL_hisopados.coliformes', '>=', $v)
    );

    $query->when($filters['coliformes_max'] ?? null,
        fn($q, $v) => $q->where('PLL_hisopados.coliformes', '<=', $v)
    );

    return $query;
}

}
