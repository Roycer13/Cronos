<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeguimientoAcrilico extends Model
{
    use HasFactory;

    protected $table = 'PLL_seguimiento_acrilicos';

    protected $fillable = [
        'detalle_acrilico_id',
        'integridad_vidrios',
        'integridad_luminarias',
        'observaciones',
        'informado',
        'user_id',
        'tiempo',
        'codigo',
        'area',
        'cantidad_vidrios',
        'cantidad_luminarias',
    ];

    protected $casts = [
        'integridad_vidrios' => 'boolean',
        'integridad_luminarias' => 'boolean',
        'informado' => 'boolean',
        'tiempo' => 'datetime',
    ];

    public function detalleAcrilico()
    {
        return $this->belongsTo(DetalleAcrilico::class, 'detalle_acrilico_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
