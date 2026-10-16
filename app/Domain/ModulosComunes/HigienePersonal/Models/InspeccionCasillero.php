<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Models;

use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InspeccionCasillero extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'InspeccionCasilleros';

    protected $fillable = [
        'ubicacion_id',
        'user_id',
        'turno',
        'fecha',
        'orden',
        'limpieza',
        'implementos_aseo',
        'observacion',
        'correcion',
        'inspector1_id',
        'inspector2_id',
        'inspector3_id',
    ];

    protected $casts = [
        'fecha'            => 'datetime',
        'orden'            => 'boolean',
        'limpieza'         => 'boolean',
        'implementos_aseo' => 'boolean',
    ];

    protected $appends = ['conforme'];

    // ──────────── Scopes ────────────
    public function scopePorUbicacion($query, $ubicacionId)
    {
        return $query->where('ubicacion_id', $ubicacionId);
    }

    // ──────────── Relaciones ────────────
    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class);
    }

    public function user() // empleado inspeccionado
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function inspector1()
    {
        return $this->belongsTo(User::class, 'inspector1_id');
    }

    public function inspector2()
    {
        return $this->belongsTo(User::class, 'inspector2_id');
    }

    public function inspector3()
    {
        return $this->belongsTo(User::class, 'inspector3_id');
    }

    // ──────────── Atributo conforme ────────────
    public function getConformeAttribute(): bool
    {
        return $this->orden && $this->limpieza && $this->implementos_aseo;
    }
}