<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MovimientoDesinfeccion extends Model
{
    use HasFactory;

    protected $table = 'PLL_movimiento_desinfecciones';

    protected $fillable = [
        'tiempo',
        'fecha_entrega',
        'user_id',
        'tipo',
        'autorizante_id',
        'entregante_id',
        'item_desinfeccion_id',
        'destino_desinfeccion_id',
        'estado_id',
        'cantidad_item',
        'cantidad_mezcla',
        'saldo',
        'ubicacion_id',
        'confirmacion',
        'observacion',
    ];

// En el modelo MovimientoDesinfeccion
public function scopeFilter($query, array $filters)
{
    $query->when($filters['search'] ?? null, function ($query, $search) {
        $query->where(function ($query) use ($search) {
            $query->whereHas('item', function ($q) use ($search) {
                $q->where('nombre', 'like', '%'.$search.'%');
            })
            ->orWhereHas('destino', function ($q) use ($search) {
                $q->where('nombre', 'like', '%'.$search.'%');
            })
            ->orWhere('observacion', 'like', '%'.$search.'%');
        });
    })
    ->when($filters['user_id'] ?? null, function ($query, $userId) {
        $query->where('user_id', $userId);
    })
    ->when($filters['item_desinfeccion_id'] ?? null, function ($query, $itemId) {
        $query->where('item_desinfeccion_id', $itemId);
    })
    ->when($filters['destino_desinfeccion_id'] ?? null, function ($query, $destinoId) {
        $query->where('destino_desinfeccion_id', $destinoId);
    })
    ->when($filters['estado_id'] ?? null, function ($query, $estadoId) {
        $query->where('estado_id', $estadoId);
    })
    ->when($filters['tipo'] ?? null, function ($query, $tipo) {
        $query->where('tipo', $tipo);
    })
    ->when($filters['fecha_entrega'] ?? null, function ($query, $fecha) {
        $query->whereDate('fecha_entrega', $fecha);
    });
}



protected $casts = [
    'tipo' => 'boolean',
    // otros casts...
];


    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function item()
    {
        return $this->belongsTo(ItemDesinfeccion::class, 'item_desinfeccion_id');
    }
    public function destino()
    {
        return $this->belongsTo(DestinoDesinfeccion::class, 'destino_desinfeccion_id');
    }
    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

    public function autorizante()
    {
        return $this->belongsTo(User::class, 'autorizante_id');
    }
    public function entregante()
    {
        return $this->belongsTo(User::class, 'entregante_id');
    }

}
