<?php

namespace App\Domain\ModulosComunes\ControlPlagas\Models;

use App\Domain\Sistema\Configuracion\Models\Sector;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
 
class Insectocaptor extends Model
{
    use HasFactory, SoftDeletes;
 
    protected $table = 'PLAG_insectocaptor';
 
    protected $fillable = [
        'man_sector_id',
        'codigo_interno',
        'codigo_externo',
        'estado',
        'tipo',
    ];
 
    protected $casts = [
        'estado' => 'boolean',
    ];
 
    public const TIPOS = ['Insectocaptor', 'Insectocutor'];
 
    public function sector()
    {
        return $this->belongsTo(Sector::class, 'man_sector_id');
    }
 
    public function registros()
    {
        return $this->hasMany(RegistroInsecto::class, 'PLAG_insectocaptor_id');
    }
 
    public function scopeActivos($query) { return $query->where('estado', true); }
    public function scopePorSector($query, $s) { return $query->where('man_sector_id', $s); }
    public function scopePorTipo($query, $t) { return $query->where('tipo', $t); }
}