<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetalleUtensilio extends Model
{
    use HasFactory;

    protected $table = 'PLL_detalle_utensilios';

    protected $fillable = [
        'nombre_utensilio',
        'area',
        'cargo',
        'estado',
        'frecuencia',
        'vigencia_utensilio',
        'codigo',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function seguimientos()
    {
        return $this->hasMany(SeguimientoUtensilio::class, 'detalle_utensilio_id');
    }

    public function scopeVigente($query)
    {
        return $query->where('vigencia_utensilio', 'Vigente');
    }

    public function scopePorFrecuencia($query, string $frecuencia)
    {
        return $query->whereRaw('LOWER(frecuencia) = ?', [strtolower(trim($frecuencia))]);
    }
}
