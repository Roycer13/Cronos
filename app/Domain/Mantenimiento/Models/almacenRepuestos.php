<?php

namespace App\Domain\Mantenimiento\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class almacenRepuestos extends Model
{


    use HasFactory;
    protected $table = 'MAN_almacen_repuestos';
    protected $fillable = [

        'ot_id',
        'proveedor_id',
        'user_id',
        'ubicacion_id',

        'almacenero_id',
        'autorizante_id',
        'estado_id',
        'observacion',
        'tipo',
        'tipo_descripcion',
        'tiempo',
        'tiempo_autorizacion',
        'tiempo_entregado'
    ];

    public function ot()
    {
        return $this->belongsTo(Ot::class, 'ot_id');
    }
    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'proveedor_id');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function almacenero()
    {
        return $this->belongsTo(User::class, 'almacenero_id');
    }
    public function autorizante()
    {
        return $this->belongsTo(User::class, 'autorizante_id');
    }
    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }
    public function detalleAlmacenRepuestos()
    {
        return $this->hasMany(DetalleAlmacenRepuestos::class, 'almacen_repuesto_id');
    }
    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }



    // app/Domain/Mantenimiento/Models/almacenRepuestos.php

    public function scopeFilter($query, array $filters)
    {
        return $query
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('observacion', 'like', "%{$search}%")
                        ->orWhereHas('ot', fn($o) => $o->where('numero', 'like', "%{$search}%"))
                        ->orWhereHas('proveedor', fn($p) => $p->where('nombre', 'like', "%{$search}%"))
                        ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('almacenero', fn($a) => $a->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('autorizante', fn($au) => $au->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($filters['ot_id'] ?? null, fn($q, $otId) => $q->where('ot_id', $otId))
            ->when($filters['proveedor_id'] ?? null, fn($q, $proveedorId) => $q->where('proveedor_id', $proveedorId))
            ->when($filters['user_id'] ?? null, fn($q, $userId) => $q->where('user_id', $userId))
            ->when($filters['almacenero_id'] ?? null, fn($q, $almaceneroId) => $q->where('almacenero_id', $almaceneroId))
            ->when($filters['autorizante_id'] ?? null, fn($q, $autorizanteId) => $q->where('autorizante_id', $autorizanteId))
            ->when($filters['estado_id'] ?? null, fn($q, $estadoId) => $q->where('estado_id', $estadoId))
            ->when($filters['tipo'] ?? null, fn($q, $tipo) => $q->where('tipo', $tipo))
            ->when($filters['fecha_desde'] ?? null, fn($q, $desde) => $q->whereDate('created_at', '>=', $desde))
            ->when($filters['fecha_hasta'] ?? null, fn($q, $hasta) => $q->whereDate('created_at', '<=', $hasta))
            ->when($filters['tiempo_entregado_desde'] ?? null, fn($q, $desde) => $q->whereDate('tiempo_entregado', '>=', $desde))
            ->when($filters['tiempo_entregado_hasta'] ?? null, fn($q, $hasta) => $q->whereDate('tiempo_entregado', '<=', $hasta));
    }
}
