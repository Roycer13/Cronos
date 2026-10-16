<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\ModulosComunes\Orp\Models\Orp;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\MaquinaEquipo;
use App\Domain\Sistema\Configuracion\Models\Sector;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Conteo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'PLL_conteos';

    protected $fillable = [
        'tiempo',
        'cantidad',
        'user_id',
        'orp_id',
        'estado_id',
        'tipo',
        'observacion',
        'ubicacion'
    ];



    // Relaciones
    public function orp()
    {
        return $this->belongsTo(Orp::class, 'orp_id');
    }


    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }




      public function scopeFilter($query, array $filters)
    {
        return $query
            ->when(
                $filters['search'] ?? null,
                fn($q, $search) =>
                $q->where(function ($query) use ($search) {
                    $query
                        ->where('tipo', 'like', "%{$search}%")
                        ->orWhere('observacion', 'like', "%{$search}%")
                        ->orWhere('ubicacion', 'like', "%{$search}%")
                        ->orWhere('cantidad', 'like', "%{$search}%")
                        ->orWhere('tiempo', 'like', "%{$search}%")

                        ->orWhereHas(
                            'orp',
                            fn($mq) =>
                            $mq->where('codigo', 'like', "%{$search}%")
                        )

                        ->orWhereHas(
                            'user',
                            fn($mq) =>
                            $mq->where('name', 'like', "%{$search}%")
                        )

                        ->orWhereHas(
                            'estado',
                            fn($mq) =>
                            $mq->where('nombre', 'like', "%{$search}%")
                        );
                })
            )

            ->when(
                $filters['orp'] ?? null,
                fn($q, $orp) =>
                $q->whereHas(
                    'orp',
                    fn($mq) =>
                    $mq->where('codigo', $orp)
                )
            )

            ->when(
                $filters['usuario'] ?? null,
                fn($q, $usuario) =>
                $q->whereHas(
                    'user',
                    fn($mq) =>
                    $mq->where('name', $usuario)
                )
            )

            ->when(
                $filters['estado'] ?? null,
                fn($q, $estado) =>
                $q->whereHas(
                    'estado',
                    fn($mq) =>
                    $mq->where('nombre', $estado)
                )
            )

            ->when(
                $filters['tipo'] ?? null,
                fn($q, $tipo) =>
                $q->where('tipo', $tipo)
            )

            ->when(
                $filters['ubicacion'] ?? null,
                fn($q, $ubicacion) =>
                $q->where('ubicacion', $ubicacion)
            )

            ->when(
                isset($filters['cantidad_min']) ?? null,
                fn($q) =>
                $q->where('cantidad', '>=', $filters['cantidad_min'])
            )

            ->when(
                isset($filters['cantidad_max']) ?? null,
                fn($q) =>
                $q->where('cantidad', '<=', $filters['cantidad_max'])
            );
    }



}
