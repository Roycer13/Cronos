<?php


namespace App\Domain\ModulosComunes\Canastillos\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;

class Movimiento extends Model
{
    protected $table = 'CAN_movimientos';

    protected $fillable = [
        'almacen_id',
        'almacen2_id',
        'responsable_id',
        'responsable2_id',
        'vendedor_id',
        'tipo_movimiento',
        'tipo_descripcion',
        'observaciones',
        'estado_id',
        'numero'
    ];


       const TIPO_PRESTAMO = 'prestamo';
    const TIPO_DEVOLUCION = 'devolucion';
    const TIPO_TRANSFERENCIA_SALIDA = 'transferencia_salida';
    const TIPO_TRANSFERENCIA_ENTRADA = 'transferencia_entrada';
    const TIPO_AJUSTE_INGRESO = 'ajuste_ingreso';
    const TIPO_AJUSTE_SALIDA = 'ajuste_salida';



    public function almacen()
    {
        return $this->belongsTo(Almacen::class, 'almacen_id');
    }

    public function almacen2()
    {
        return $this->belongsTo(Almacen::class, 'almacen2_id');
    }

    public function responsable()
    {
        return $this->belongsTo(User::class, 'responsable_id');
    }
    public function responsable2()
    {
        return $this->belongsTo(User::class, 'responsable2_id');
    }

    public function vendedor()
    {
        return $this->belongsTo(Vendedor::class, 'vendedor_id');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleMovimiento::class, 'movimiento_id');
    }

 public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

      public function isPending(): bool
    {
        return $this->estado && $this->estado->nombre === 'Pendiente';
    }

    public function isConfirmed(): bool
    {
        return $this->estado && $this->estado->nombre === 'Aceptado';
    }

    public function isRejected(): bool
    {
        return $this->estado && $this->estado->nombre === 'Rechazado';
    }



    public static function getNextNumero(): int
{
    return (self::max('numero') ?? 0) + 1;
}
    public function scopeFilter($query, array $filters)
{
    $query->when($filters['almacen_id'] ?? null, function ($query, $almacenId) {
        $query->where('almacen_id', $almacenId);
    });

    $query->when($filters['vendedor_id'] ?? null, function ($query, $vendedorId) {
        $query->where('vendedor_id', $vendedorId);
    });

    $query->when($filters['tipo_movimiento'] ?? null, function ($query, $tipo) {
        $query->where('tipo_movimiento', $tipo);
    });

    $query->when($filters['responsable_id'] ?? null, function ($query, $responsableId) {
        $query->where('responsable_id', $responsableId);
    });

    $query->when($filters['fecha_desde'] ?? null, function ($query, $fecha) {
        $query->whereDate('created_at', '>=', $fecha);
    });

    $query->when($filters['fecha_hasta'] ?? null, function ($query, $fecha) {
        $query->whereDate('created_at', '<=', $fecha);
    });


       $query->when($filters['tipo_movimiento'] ?? null, function ($query, $tipo) {
            // Si el filtro es 'ajuste', mostramos ambos ajustes
            if ($tipo === 'ajuste') {
                $query->whereIn('tipo_movimiento', [self::TIPO_AJUSTE_INGRESO, self::TIPO_AJUSTE_SALIDA]);
            } else {
                $query->where('tipo_movimiento', $tipo);
            }
        });
}

}
