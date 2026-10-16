<?php
namespace App\Domain\ModulosComunes\ControlPlagas\Models;

use App\Domain\Sistema\Configuracion\Models\Sector;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
 
class Trampa extends Model
{
    use HasFactory, SoftDeletes;
 
    protected $table = 'PLAG_trampas';
 
    protected $fillable = [
        'man_sector_id',
        'codigo',
        'estado',
        'tipo',
    ];
 
    protected $casts = [
        'estado' => 'boolean',
    ];
 
    public const TIPOS = ['Trampa de pegamento', 'Trampa de cebo', 'Trampa viva', 'Trampa de luz'];
 
    public function sector()
    {
        return $this->belongsTo(Sector::class, 'man_sector_id');
    }
 
    public function controles()
    {
        return $this->hasMany(ControlTrampa::class, 'PLAG_trampa_id');
    }
 
    public function scopeActivas($query) { return $query->where('estado', true); }
    public function scopePorSector($query, $s) { return $query->where('man_sector_id', $s); }
    public function scopePorTipo($query, $t) { return $query->where('tipo', $t); }
}
 