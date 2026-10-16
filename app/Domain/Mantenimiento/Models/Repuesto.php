<?php

namespace App\Domain\Mantenimiento\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\MaquinaEquipo;
use App\Domain\Sistema\Configuracion\Models\Prioridad;
use App\Domain\Sistema\Configuracion\Models\Sector;
use App\Domain\Sistema\Configuracion\Models\Unidad;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class Repuesto extends Model
{
    use HasFactory;
    protected $table = 'MAN_repuestos';
    protected $fillable = [

        'nombre',
        'codigo',
        'foto',
        'descripcion',
        'observacion',
        'stock_minimo',
        'unidad_id',
        'precio_relativo',

    ];
    protected $appends = ['stock_actual'];
use SoftDeletes;

    // Relación con el modelo User
    public function unidad()
    {
        return $this->belongsTo(Unidad::class, 'unidad_id');
    }


    public function getStockActualAttribute()
{
    $ultimo = $this->detalleAlmacenRepuestos()
        ->whereHas('almacenRepuesto', function ($q) {
            $q->whereHas('estado', function ($eq) {
                $eq->where('nombre', 'Entregado');
            });
        })
        ->orderBy('updated_at', 'desc')
        ->first();

    return $ultimo ? $ultimo->saldo : 0;
}

    public function detalleAlmacenRepuestos()
    {
        return $this->hasMany(DetalleAlmacenRepuestos::class, 'repuesto_id');
    }

    public function scopeFilter($query, array $filters)
    {
        return $query
            ->when(
                $filters['search'] ?? null,
                fn($q, $search) =>
                $q->where(function ($query) use ($search) {
                    $query->where('nombre', 'like', "%{$search}%")
                        ->orWhere('codigo', 'like', "%{$search}%");
                })
            )
            //filtros unitarios y para select
            ->when($filters['nombre'] ?? null, fn($q, $nombre) => $q->where('nombre', 'like', "%{$nombre}%"))
            ->when($filters['codigo'] ?? null, fn($q, $codigo) => $q->where('codigo', 'like', "%{$codigo}%"))
            ->when($filters['unidad_id'] ?? null, function ($q, $unidadId) {
                $q->whereHas('unidad', function ($query) use ($unidadId) {
                    $query->where('id', $unidadId); // ⚡ filtramos por el id del rol
                });
            })
            ->when($filters['observacion'] ?? null, fn($q, $observacion) => $q->where('observacion', $observacion));
    }
}
