<?php


namespace App\Domain\ModulosComunes\Canastillos\Models;

use Illuminate\Database\Eloquent\Model;

class Canastillo extends Model
{
    protected $table = 'CAN_canastillos';

    protected $fillable = [
        'nombre',
        'alias',
        'tamaño',
        'precio',
        'color',
        'detalle',
    ];



public function scopeFilter($query, array $filters)
{
    $query->when($filters['search'] ?? null, function ($query, $search) {
        $query->where(function ($query) use ($search) {
            $query->where('nombre', 'like', '%' . $search . '%')
                  ->orWhere('alias', 'like', '%' . $search . '%')
                  ->orWhere('detalle', 'like', '%' . $search . '%');
        });
    });

    $query->when($filters['tamaño'] ?? null, function ($query, $tamaño) {
        $query->where('tamaño', $tamaño);
    });

    $query->when($filters['color'] ?? null, function ($query, $color) {
        $query->where('color', $color);
    });
}

}
