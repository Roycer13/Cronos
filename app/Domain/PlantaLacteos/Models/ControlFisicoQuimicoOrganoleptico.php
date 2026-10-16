<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ControlFisicoQuimicoOrganoleptico extends Model
{
    use HasFactory;

    protected $table = 'PLL_control_fisicoquimico_organoleptico';

    protected $fillable = [
        'tiempo',
        'user_id',
        'ph_pozo',
        'dureza_pozo',
        'conductividad_pozo',
        'ph_etap',
        'dureza_etap',
        'cloruros_etap',
        'conductividad_etap',
        'color',
        'olor',
        'sabor',
        'aspecto',
        'observaciones',
        'color_etap',
        'olor_etap',
        'sabor_etap',
        'aspecto_etap'
    ];

    protected $casts = [
        'tiempo' => 'datetime:Y-m-d H:i:s',
        'ph_pozo' => 'decimal:5',
        'dureza_pozo' => 'decimal:5',
        'conductividad_pozo' => 'decimal:5',
        'ph_etap' => 'decimal:5',
        'dureza_etap' => 'decimal:5',
        'cloruros_etap' => 'decimal:5',
        'conductividad_etap' => 'decimal:5',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
