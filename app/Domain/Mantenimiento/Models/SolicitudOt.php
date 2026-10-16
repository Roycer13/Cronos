<?php

namespace App\Domain\Mantenimiento\Models;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\MaquinaEquipo;
use App\Domain\Sistema\Configuracion\Models\Sector;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SolicitudOt extends Model
{
    use HasFactory;
    protected $table = 'MAN_solicitud_ots';

    protected $fillable = [

        'user_id',
        'tiempo',
        'maquina_equipo_id',
        'sector_id',
        'descripcion',
        'observacion',
        'estado_id',
        'tiempo_respuesta',
        'created_by'



    ];


     use SoftDeletes;

    protected static function booted()
    {
        static::deleting(function ($solicitudOt) {
            // Si se elimina (soft delete), también eliminar lógicamente la OT
            if ($solicitudOt->ot) {
                $solicitudOt->ot->delete();
            }
        });

        static::restoring(function ($solicitudOt) {
            // Si se restaura la solicitud, también restaurar la OT
            if ($solicitudOt->ot()->withTrashed()->first()) {
                $solicitudOt->ot()->withTrashed()->restore();
            }
        });
    }


    // Relación con el modelo User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by'); // 'created_by' es la columna en la tabla
    }
    public function sector()
    {
        return $this->belongsTo(Sector::class, 'sector_id');
    }
    public function maquinaEquipo()
    {
        return $this->belongsTo(MaquinaEquipo::class, 'maquina_equipo_id');
    }
    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

    public function ot()
    {
        return $this->hasOne(Ot::class, 'solicitud_ot_id'); // Antes era hasMany
    }



    public function scopeFilter($query, array $filters)
    {
        return $query
            // 🔍 Búsqueda general (en varios campos)
            ->when(
                $filters['search'] ?? null,
                fn($q, $search) =>
                $q->where(function ($query) use ($search) {
                    $query->where('descripcion', 'like', "%{$search}%")
                        ->orWhere('observacion', 'like', "%{$search}%")
                        ->orWhereHas('maquinaEquipo', fn($mq) =>
                        $mq->where('nombre', 'like', "%{$search}%"))
                        ->orWhereHas('sector', fn($sq) =>
                        $sq->where('nombre', 'like', "%{$search}%"))
                        ->orWhereHas('user', fn($uq) =>
                        $uq->where('name', 'like', "%{$search}%"));
                })
            )

            // 🧍‍♂️ Filtro por usuario
            ->when($filters['user_id'] ?? null, fn($q, $userId) => $q->where('user_id', $userId))

            // 🏭 Filtro por máquina/equipo
            ->when($filters['maquina_equipo_id'] ?? null, fn($q, $maquinaId) => $q->where('maquina_equipo_id', $maquinaId))

            // 🧩 Filtro por sector
            ->when($filters['sector_id'] ?? null, function ($q, $sectorId) use ($filters) {
                $q->where('sector_id', $sectorId);

                // Si no hay máquina seleccionada, filtrar automáticamente máquinas del sector
                if (empty($filters['maquina_equipo_id'])) {
                    $q->whereHas('maquinaEquipo', fn($mq) => $mq->where('sector_id', $sectorId));
                }
            })
            // 🔖 Filtro por estado
            ->when($filters['estado_id'] ?? null, fn($q, $estadoId) => $q->where('estado_id', $estadoId))
            //fecha
            ->when($filters['fecha_desde'] ?? null, fn($q, $desde) => $q->whereDate('created_at', '>=', $desde))
            ->when($filters['fecha_hasta'] ?? null, fn($q, $hasta) => $q->whereDate('created_at', '<=', $hasta))

            // 📋 Filtros individuales
            ->when($filters['descripcion'] ?? null, fn($q, $desc) => $q->where('descripcion', 'like', "%{$desc}%"))
            ->when($filters['observacion'] ?? null, fn($q, $obs) => $q->where('observacion', 'like', "%{$obs}%"));
    }
}
