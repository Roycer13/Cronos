<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Models;

use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HigienePersonal extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'higiene_personales';

    protected $fillable = [
        'ubicacion_id',
        'empleado_id',
        'supervisor_id',
        'fecha',
        'uniforme',
        'limpieza',
        'lavado_manos',
        'salud',
        'epp',
        'objetos',
        'material_equipo',
        'conforme',
        'observaciones',
        'correccion',
        'turno',
    ];

    protected $casts = [
        'fecha' => 'datetime',
        'uniforme' => 'boolean',
        'limpieza' => 'boolean',
        'lavado_manos' => 'boolean',
        'salud' => 'boolean',
        'epp' => 'boolean',
        'objetos' => 'boolean',
        'material_equipo' => 'boolean',
        'conforme' => 'boolean',
        'turno' => 'string',
    ];



    // Relaciones
    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class);
    }

    public function empleado()
    {
        return $this->belongsTo(User::class, 'empleado_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    // Scopes
    public function scopePorUbicacion($query, $ubicacionId)
    {
        return $query->where('ubicacion_id', $ubicacionId);
    }

    public function scopePorEmpleado($query, $empleadoId)
    {
        return $query->where('empleado_id', $empleadoId);
    }

    public function scopePorSupervisor($query, $supervisorId)
    {
        return $query->where('supervisor_id', $supervisorId);
    }

    public function scopeConforme($query)
    {
        return $query->where('conforme', true);
    }

    public function scopeNoConforme($query)
    {
        return $query->where('conforme', false);
    }

    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('fecha', $fecha);
    }

    public function scopePorRangoFechas($query, $desde, $hasta)
    {
        return $query->whereBetween('fecha', [$desde, $hasta]);
    }

    public function scopeConObservaciones($query)
    {
        return $query->whereNotNull('observaciones');
    }

    // Métodos de ayuda
    public function tieneObservaciones(): bool
    {
        return !empty($this->observaciones);
    }

    public function requiereCorreccion(): bool
    {
        return !$this->conforme || !empty($this->correccion);
    }

    public function calcularPorcentajeCumplimiento(): int
    {
        $checklist = [
            $this->uniforme,
            $this->limpieza,
            $this->salud,
            $this->epp,
            $this->objetos,
            $this->material_equipo,
        ];

        $cumplidos = count(array_filter($checklist));
        return round(($cumplidos / 6) * 100);
    }
}
