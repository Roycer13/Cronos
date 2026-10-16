<?php
namespace App\Domain\ModulosComunes\Old\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OldDistribucionCarro extends Model
{
    use HasFactory;

    protected $table = 'old_distribucion_carros';

    protected $fillable = [
        'fecha',
        'user',
        'destino',
        'placa',
        'paredes_externas',
        'limpieza_interno',
        'ausencia_objetos_olores',
        'ausenci_objetos y olores',
        'set_temperatura',
        'bph_chofer',
        'bph_ayudante',
        'observaciones',
        'correciones',
    ];

    protected $casts = [
        'fecha' => 'datetime',
        'paredes_externas' => 'boolean',
        'limpieza_interno' => 'boolean',
        'ausencia_objetos_olores' => 'boolean',
        'ausenci_objetos y olores' => 'boolean',
        'set_temperatura' => 'decimal:2',
        'bph_chofer' => 'boolean',
        'bph_ayudante' => 'boolean',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user');
    }
}
