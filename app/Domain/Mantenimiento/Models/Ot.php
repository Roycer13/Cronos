<?php

namespace App\Domain\Mantenimiento\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\MaquinaEquipo;
use App\Domain\Sistema\Configuracion\Models\Prioridad;
use App\Domain\Sistema\Configuracion\Models\Sector;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ot extends Model
{
    use HasFactory;
    protected $table = 'MAN_ots';
    protected $fillable = [
        'solicitud_ot_id',
        'user_id',
        'prioridad_id',
        'tipo_orden',
        'estado_id',
        'observacion',
        'notas',
        'numero',
        'tiempo_visto',
        'tiempo_revisado',
        'tiempo_cerrado',
        'diagnostico',
        'accion',
        'sugerencia',
        'tiempo_completado'
    ];

    use SoftDeletes;
    // Relación con el modelo User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function solicitudOt()
    {
        return $this->belongsTo(SolicitudOt::class, 'solicitud_ot_id');
    }
    public function prioridad()
    {
        return $this->belongsTo(Prioridad::class, 'prioridad_id');
    }
    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }
    public function almacenRepuestos()
    {
        return $this->hasMany(almacenRepuestos::class, 'ot_id');
    }

    public function maquinaEquipo()
    {
        return $this->belongsTo(MaquinaEquipo::class, 'maquina_equipo_id');
    }
    public function sector()
    {
        return $this->belongsTo(Sector::class, 'sector_id');
    }

    public function ayudantes()
    {
        return $this->hasMany(AyudanteOt::class, 'ot_id');
    }


    // App\Domain\Mantenimiento\Models\Ot.php

public static function generarNumeroSiguiente(): string
{
    // Obtener el último número de OT registrado (incluyendo eliminados si quieres evitar reutilizar)
    $ultimoOt = self::withTrashed() // si usas soft deletes, incluye eliminados
        ->orderBy('numero', 'desc')
        ->first();

    if (!$ultimoOt || !$ultimoOt->numero) {
        return '000001';
    }

    // Extraer el número, convertirlo a entero y sumar 1
    $numeroActual = (int) $ultimoOt->numero;
    $nuevoNumero = $numeroActual + 1;

    // Formatear a 6 dígitos con ceros a la izquierda
    return str_pad($nuevoNumero, 6, '0', STR_PAD_LEFT);
}



    // ==============================================
    // 🔎 SCOPE FILTER
    // ==============================================
    public function scopeFilter($query, array $filters)
    {
        return $query
            // 🔍 Búsqueda general
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('tipo_orden', 'like', "%{$search}%")
                        ->orWhereHas('estado', fn($e) =>
                        $e->where('nombre', 'like', "%{$search}%"))
                        ->orWhereHas('prioridad', fn($p) =>
                        $p->where('nombre', 'like', "%{$search}%"))
                        ->orWhereHas('user', fn($u) =>
                        $u->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('solicitudOt', fn($s) =>
                        $s->where('descripcion', 'like', "%{$search}%")
                            ->orWhere('observacion', 'like', "%{$search}%"));
                });
            })

            ->when(
                $filters['solicitanteOt'] ?? null,
                fn($q, $solicitanteId) =>
                $q->whereHas('solicitudOt', fn($s) => $s->where('user_id', $solicitanteId))
            )
            // 🧍‍♂️ Filtro por usuario asignado por name o apellido
            //    ->when($filters['user_id'] ?? null, function ($q, $userSearch) { $q->whereHas('user', function ($query) use ($userSearch) { $query->where('name', 'like', "%{$userSearch}%") ->orWhere('apellido', 'like', "%{$userSearch}%"); }); })

            // ⚙️ Filtro por prioridad
            ->when($filters['user_id'] ?? null, fn($q, $userId) => $q->where('user_id', $userId))
            ->when($filters['prioridad_id'] ?? null, fn($q, $prioridadId) => $q->where('prioridad_id', $prioridadId))

            // 🔖 Filtro por estado
            ->when($filters['estado_id'] ?? null, fn($q, $estadoId) => $q->where('estado_id', $estadoId))

            // 🧾 Filtro por tipo de orden
            ->when($filters['tipo_orden'] ?? null, fn($q, $tipo) => $q->where('tipo_orden', 'like', "%{$tipo}%"))

            // 📅 Filtros por fecha
            ->when($filters['fecha_desde'] ?? null, fn($q, $desde) => $q->whereDate('created_at', '>=', $desde))
            ->when($filters['fecha_hasta'] ?? null, fn($q, $hasta) => $q->whereDate('created_at', '<=', $hasta));
    }
}
