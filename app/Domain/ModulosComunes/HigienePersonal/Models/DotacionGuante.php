<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DotacionGuante extends Model
{
    use HasFactory;

    protected $table = 'dotacion_guantes';

    protected $fillable = [
        'user_id',
        'user_encargado_id',
        'tiempo',
        'tipo',
        'amarillo_naranja',   // antes 'amarillo'
        'azul',               // antes 'rojo'
        'naranja',            // se conserva igual
        'alta_temperatura',   // antes 'otros'
        'observaciones',
        'tiempo_devolucion',  // nuevo campo
        'estado_id',          // nuevo campo
    ];

    protected $casts = [
        'tiempo'             => 'datetime',
        'tiempo_devolucion'  => 'datetime',
        'amarillo_naranja'   => 'boolean',
        'azul'               => 'boolean',
        'naranja'            => 'boolean',
        'alta_temperatura'   => 'boolean',
        'estado_id'          => 'integer',
    ];

    // ──────────── Scopes ────────────
    public function scopePorUsuario($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopePorEncargado($query, $encargadoId)
    {
        return $query->where('user_encargado_id', $encargadoId);
    }

    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('tiempo', $fecha);
    }

    // ──────────── Relaciones ────────────
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function encargado()
    {
        return $this->belongsTo(User::class, 'user_encargado_id');
    }

    // Relación con la tabla 'estados' (asumiendo que el modelo Estado existe)
    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }
}
