<?php

namespace App\Domain\ModulosComunes\ControlPlagas\Models;

use App\Domain\Sistema\Configuracion\Models\Sector;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BarreraPlaga extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'PLAG_barrera_plagas';

    protected $fillable = [
        'codigo_interno',
        'man_sector_id',
        'tipo',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function sector()
    {
        return $this->belongsTo(Sector::class, 'man_sector_id');
    }

    public function controles()
    {
        return $this->hasMany(ControlBarrera::class, 'barrera_plaga_id');
    }

    public function scopeActivos($query)
    {
        return $query->where('estado', true);
    }

    public function scopePorSector($query, $sectorId)
    {
        return $query->where('man_sector_id', $sectorId);
    }

    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }
}