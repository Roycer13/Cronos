<?php
namespace App\Domain\ModulosComunes\ControlPlagas\Models;

use App\Domain\Sistema\Configuracion\Models\Sector;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Domain\Sistema\Configuracion\Models\User;
 
class ArranqueFumigacion extends Model
{
    use HasFactory, SoftDeletes;
 
    protected $table = 'PLAG_arranque_despues_fumigacion';
 
    protected $fillable = [
        'man_sector_id',
        'user_id',
        'fecha',
        'sin_olor',
        'limpio',
        'observacion',
        'correcion',
    ];
 
    protected $casts = [
        'fecha'    => 'datetime',
        'sin_olor' => 'boolean',
        'limpio'   => 'boolean',
    ];
 
    public function sector()
    {
        return $this->belongsTo(Sector::class, 'man_sector_id');
    }
 
    public function inspector()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
 
    public function getConformeAttribute(): bool
    {
        return $this->sin_olor && $this->limpio;
    }
 
    public function scopeConforme($query)
    {
        return $query->where('sin_olor', true)->where('limpio', true);
    }
    public function scopePorSector($query, $s) { return $query->where('man_sector_id', $s); }
    public function scopePorFecha($query, $desde, $hasta)
    {
        if ($desde) $query->whereDate('fecha', '>=', $desde);
        if ($hasta) $query->whereDate('fecha', '<=', $hasta);
        return $query;
    }
}