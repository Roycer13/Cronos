<?php


namespace App\Domain\ModulosComunes\Canastillos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;

class Almacen extends Model
{
    protected $table = 'CAN_almacenes';

    protected $fillable = [
        'nombre',
        'ubicacion',
        'responsable_id',
        'tipo_almacen_id',
        'cantidad',
        'observaciones',
    ];



    public function tipoAlmacen()
    {
        return $this->belongsTo(TipoAlmacen::class, 'tipo_almacen_id');
    }

    public function responsables()
    {
        return $this->belongsToMany(User::class, 'CAN_almacen_responsable', 'almacen_id', 'user_id')
            ->withTimestamps();
    }


    // En App\Domain\ModulosComunes\Canastillos\Models\Almacen.php
public function scopeFilter($query, array $filters)
{
    $query->when($filters['search'] ?? null, function ($query, $search) {
        $query->where(function ($q) use ($search) {
            $q->where('nombre', 'like', '%' . $search . '%')
              ->orWhere('ubicacion', 'like', '%' . $search . '%');
        });
    });

    $query->when($filters['tipo_almacen_id'] ?? null, function ($query, $tipoId) {
        $query->where('tipo_almacen_id', $tipoId);
    });

    $query->when($filters['responsable_id'] ?? null, function ($query, $responsableId) {
        $query->whereHas('responsables', function ($q) use ($responsableId) {
            $q->where('user_id', $responsableId);
        });
    });
}
}
