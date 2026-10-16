<?php

namespace App\Domain\Sistema\Configuracion\Models;

use App\Domain\ModulosComunes\Canastillos\Models\Almacen;
use App\Domain\ModulosComunes\HigienePersonal\Models\DotacionGuante;
use App\Domain\PlantaLacteos\Models\Hisopado;
use Spatie\Permission\Traits\HasRoles;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use App\Domain\ModulosComunes\Sanidad\Models\AtencionMedica;
use App\Domain\ModulosComunes\Sanidad\Models\ReconsultaAtencionMedica;
use App\Domain\ModulosComunes\Sanidad\Models\ExamenOcupacional;
use App\Domain\ModulosComunes\Sanidad\Models\Policlinico; // Si no lo tienes ya
use App\Domain\ModulosComunes\HigienePersonal\Models\HigienePersonal;
use App\Domain\ModulosComunes\HigienePersonal\Models\InspeccionCasillero;
use App\Domain\PlantaLacteos\Models\TratamientoAguaResidual;

class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',

        //Nuevos campos

        'estado',
        'codigo',
        'ubicacion_id',
        'apellido',
        'cargo',
        'turno',
        'profesion',
        'area_id',
        'telefono',
        'avatar',
        'firma_digital',
        'token_api',
        'preferencias',
        'notificaciones_activas',
        'estado_hisopado_id',

        'fecha_nacimiento',
        'sexo',
        'estado_civil',
        'seguro_social',
        'policlinico_id',
        'fecha_ingreso',

    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'fecha_nacimiento' => 'date',
            'fecha_ingreso' => 'date',
        ];
    }


    public function hasPermission(string $permission): bool
    {
        if ($this->hasRole('admin')) {
            return true;
        }

        if (method_exists($this, 'hasPermissionTo')) {
            return $this->hasPermissionTo($permission);
        }

        if (method_exists($this, 'can')) {
            return $this->can($permission);
        }

        return false;
    }

    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }
    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }
    public function estadoHisopado()
    {

        return $this->belongsTo(Estado::class, 'estado_hisopado_id');
    }

    public function hisopados()
    {
        return $this->hasMany(Hisopado::class, 'user_id');
    }

    // Relaciones nuevas
    public function policlinicoReferencia()
    {
        return $this->belongsTo(Policlinico::class, 'policlinico_id');
    }

    public function atencionesComoMedico()
    {
        return $this->hasMany(AtencionMedica::class, 'medico');
    }

    public function atencionesComoPaciente()
    {
        return $this->hasMany(AtencionMedica::class, 'paciente');
    }

    public function reconsultasComoMedico()
    {
        return $this->hasMany(ReconsultaAtencionMedica::class, 'medico');
    }

    public function examenesOcupacionalesComoEmpleado()
    {
        return $this->hasMany(ExamenOcupacional::class, 'empleado_id');
    }

    public function examenesOcupacionalesComoMedico()
    {
        return $this->hasMany(ExamenOcupacional::class, 'medico_id');
    }

    // En User.php
public function almacenes()
{
    return $this->belongsToMany(
        Almacen::class,
        'CAN_almacen_responsable',
        'user_id',
        'almacen_id'
    )->withTimestamps();
}
    public function higienePersonal()
    {
        return $this->hasMany(HigienePersonal::class, 'empleado_id');
    }
    public function inspeccionCasillero()
    {
        return $this->hasMany(InspeccionCasillero::class, 'user_id');
    }

    public function dotacionGuantes()
    {
        return $this->hasMany(DotacionGuante::class, 'user_id');
    }


    public function tratamientoAguaResidual()
    {
        return $this->hasMany(TratamientoAguaResidual::class, 'user_id');
    }

    // Scopes dinámicos usando "when" para filtros opcionales
    public function scopeFilter($query, array $filters)
    {
        return $query
            ->when($filters['search'] ?? null, fn($q, $search) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('apellido', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->when($filters['name'] ?? null, fn($q, $name) => $q->where('name', 'like', "%{$name}%"))
            ->when($filters['apellido'] ?? null, fn($q, $apellido) => $q->where('apellido', 'like', "%{$apellido}%"))
            ->when($filters['rol_id'] ?? null, fn($q, $rolId) => $q->whereHas('roles', fn($q) => $q->where('id', $rolId)))
            ->when($filters['ubicacion_id'] ?? null, fn($q, $id) => $q->where('ubicacion_id', $id))
            ->when($filters['area_id'] ?? null, fn($q, $id) => $q->where('area_id', $id))
            ->when($filters['estado'] ?? null, fn($q, $estado) => $q->where('estado', $estado))
            ->when($filters['turno'] ?? null, fn($q, $turno) => $q->where('turno', $turno))
            ->when($filters['policlinico_id'] ?? null, fn($q, $id) => $q->where('policlinico_id', $id))
            ->when($filters['fecha_ingreso_desde'] ?? null, fn($q, $fecha) => $q->whereDate('fecha_ingreso', '>=', $fecha))
            ->when($filters['fecha_ingreso_hasta'] ?? null, fn($q, $fecha) => $q->whereDate('fecha_ingreso', '<=', $fecha));
    }
}
