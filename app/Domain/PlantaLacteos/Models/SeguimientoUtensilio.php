<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeguimientoUtensilio extends Model
{
    use HasFactory;

    protected $table = 'PLL_seguimiento_utensilios';

    protected $fillable = [
        'detalle_utensilio_id',
        'user_id',
        'responsable_id',
        'tiempo',
        'cargo',
        'area',
        'tiene_codigo',
        'buen_estado',
        'observaciones',
    ];

    protected $casts = [
        'tiene_codigo' => 'boolean',
        'buen_estado' => 'boolean',
        'tiempo' => 'datetime',
    ];

    public function detalleUtensilio()
    {
        return $this->belongsTo(DetalleUtensilio::class, 'detalle_utensilio_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function usuarioResponsable()
    {
        return $this->belongsTo(User::class, 'responsable_id');
    }

    public function scopeOrdenReciente($query)
    {
        return $query->orderByDesc('created_at');
    }
}
