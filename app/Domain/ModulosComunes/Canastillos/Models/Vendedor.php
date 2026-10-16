<?php


namespace App\Domain\ModulosComunes\Canastillos\Models;

use Illuminate\Database\Eloquent\Model;

class Vendedor extends Model
{
    protected $table = 'CAN_vendedores';

    protected $fillable = [
        'nombre',
        'apellido',
        'codigo',
        'telefono',
        'deuda',
    ];


    public function scopeFilter($query, array $filters)
{
    $query->when($filters['search'] ?? null, function ($query, $search) {
        $query->where(function ($query) use ($search) {
            $query->where('nombre', 'like', '%' . $search . '%')
                  ->orWhere('apellido', 'like', '%' . $search . '%')
                  ->orWhere('codigo', 'like', '%' . $search . '%');
        });
    });
}
}
