<?php

namespace App\Domain\ModulosComunes\ControlPlagas\Models;
 
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Domain\Sistema\Configuracion\Models\User;
 
class RegistroInsecto extends Model
{
    use HasFactory, SoftDeletes;
 
    protected $table = 'PLAG_control_vectores_insectos';

    protected $fillable = [
        'fecha',
        'user_id',
        'PLAG_insectocaptor_id',
        'mosca',
        'mosquito',
        'abeja',
        'mariposa',
        'otros',
        'cambio_adhesivo',
        'estado_equipo',
        'observacion',
        'correcion',
    ];

    protected $casts = [
        'fecha'           => 'datetime',
        'cambio_adhesivo' => 'boolean',
        'estado_equipo'   => 'boolean',
        'mosca'           => 'integer',
        'mosquito'        => 'integer',
        'abeja'           => 'integer',
        'mariposa'        => 'integer',
        'otros'           => 'integer',
    ];

    public function insectocaptor()
    {
        return $this->belongsTo(Insectocaptor::class, 'PLAG_insectocaptor_id');
    }
 
    public function inspector()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
 
    public function getTotalInsectosAttribute(): int
    {
        return (int)$this->mosca + (int)$this->mosquito +
               (int)$this->abeja + (int)$this->mariposa + (int)$this->otros;
    }
 
    public function scopePorFecha($query, $desde, $hasta)
    {
        if ($desde) $query->whereDate('fecha', '>=', $desde);
        if ($hasta) $query->whereDate('fecha', '<=', $hasta);
        return $query;
    }
    public function scopeConFalla($query) { return $query->where('estado_equipo', false); }
}