<?php

namespace App\Domain\ModulosComunes\Sanidad\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Caja extends Model
{
    protected $table = 'san_cajas';

    protected $fillable = [
        'nombre',
        'descripcion'
    ];

    public function policlinicos(): HasMany
    {
        return $this->hasMany(Policlinico::class, 'caja_id');
    }
}