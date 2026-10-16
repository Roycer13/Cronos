<?php


namespace App\Domain\Mantenimiento\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetalleAlmacenRepuestos extends Model
{
    //
    use HasFactory;
    protected $table = 'MAN_detalle_almacen_repuestos';
    protected $fillable = [
        'almacen_repuesto_id',
        'repuesto_id',
        'cantidad',
        'precio',
        'saldo'
    ];

    public function almacenRepuesto()
    {
        return $this->belongsTo(almacenRepuestos::class, 'almacen_repuesto_id');
    }
    public function repuesto()
    {
        return $this->belongsTo(Repuesto::class, 'repuesto_id');
    }
}
