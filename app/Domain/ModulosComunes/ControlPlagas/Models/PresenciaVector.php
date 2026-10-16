<?php
namespace App\Domain\ModulosComunes\ControlPlagas\Models;

use App\Domain\Sistema\Configuracion\Models\Sector;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Domain\Sistema\Configuracion\Models\User;
 
class PresenciaVector extends Model
{
    use HasFactory, SoftDeletes;
 
    protected $table = 'PLAG_presencia_vectores';
 
    protected $fillable = [
        'man_sector_id',
        'vector',
        'reportado_por',
        'fecha',
        'estado',
        'accion',
        'user_id',
    ];
 
    protected $casts = [
        'fecha'  => 'datetime',
        'estado' => 'boolean',
    ];
 
    public const VECTORES = [
        'Mosca', 'Mosquito', 'Ratón', 'Cucaracha', 'Hormiga',
        'Araña', 'Paloma', 'Polilla', 'Rata', 'Chinche', 'Otros',
    ];
 
    public function sector()
    {
        return $this->belongsTo(Sector::class, 'man_sector_id');
    }
 
    public function inspector()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
 
    public function scopeAtendido($query)   { return $query->where('estado', true); }
    public function scopePendiente($query)  { return $query->where('estado', false); }
    public function scopePorVector($query, $v) { return $query->where('vector', $v); }
    public function scopePorSector($query, $s) { return $query->where('man_sector_id', $s); }
    public function scopePorFecha($query, $desde, $hasta)
    {
        if ($desde) $query->whereDate('fecha', '>=', $desde);
        if ($hasta) $query->whereDate('fecha', '<=', $hasta);
        return $query;
    }
}