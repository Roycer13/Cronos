<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Models;

use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ControlVisita extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'control_visitas';
    
    protected $fillable = [
        'ubicacion_id',
        'nombre_visita',
        'empresa_area_trabajo',
        'supervisor_id',
        'fecha',
        'fecha_entrada',
        'fecha_salida',
        'motivo',
        'area_empresa',
        'vestimenta',
        'higiene',
        'salud',
        'epp_entregado',
        'induccion',
        'conforme',
        'observaciones',
        'correcion',
    ];

    protected $casts = [
        'fecha' => 'datetime',
        'fecha_entrada' => 'datetime',
        'fecha_salida' => 'datetime',
        'vestimenta' => 'boolean',
        'higiene' => 'boolean',
        'salud' => 'boolean',
        'epp_entregado' => 'boolean',
        'induccion' => 'boolean',
        'conforme' => 'boolean',
    ];

    // Relaciones
    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class);
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

    public function scopeVisitasActivas($query)
    {
        return $query->whereNull('fecha_salida');
    }

    public function scopeVisitasFinalizadas($query)
    {
        return $query->whereNotNull('fecha_salida');
    }

    public function scopePorMotivo($query, $motivo)
    {
        return $query->where('motivo', 'like', "%{$motivo}%");
    }

    public function scopePorArea($query, $area)
    {
        return $query->where('area', $area);
    }

    // Métodos de ayuda
    public function duracionVisita(): ?int
    {
        if (!$this->fecha_entrada || !$this->fecha_salida) {
            return null;
        }
        
        return $this->fecha_entrada->diffInMinutes($this->fecha_salida);
    }

    public function estaActiva(): bool
    {
        return is_null($this->fecha_salida);
    }

    public function calcularPorcentajeCumplimiento(): int
    {
        $checklist = [
            $this->vestimenta,
            $this->higiene,
            $this->salud,
            $this->epp_entregado,
            $this->induccion,
        ];
        
        $cumplidos = count(array_filter($checklist));
        return round(($cumplidos / 5) * 100);
    }
}