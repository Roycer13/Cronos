<?php


namespace App\Domain\ModulosComunes\Canastillos\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleMovimiento extends Model
{
    protected $table = 'CAN_detalle_movimientos';

    protected $fillable = [
        'movimiento_id',
        'canastillo_id',
        'cantidad',
        'saldo',
    ];

    public function movimiento()
    {
        return $this->belongsTo(Movimiento::class, 'movimiento_id');
    }

    public function canastillo()
    {
        return $this->belongsTo(Canastillo::class, 'canastillo_id');
    }


}
