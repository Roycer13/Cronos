<?php

namespace App\Domain\ModulosComunes\ControlPlagas\Models;
 
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Domain\Sistema\Configuracion\Models\User;
 
class ControlBarrera extends Model
{
    use HasFactory, SoftDeletes;
 
    protected $table = 'PLAG_control_barreras';
 
    protected $fillable = [
        'barrera_plaga_id',
        'user_id',
        'fecha',
        'estado',
        'observacion',
        'correcion',
    ];
 
    protected $casts = [
        'fecha'  => 'datetime',
        'estado' => 'boolean',
    ];
 
    public function barrera()
    {
        return $this->belongsTo(BarreraPlaga::class, 'barrera_plaga_id');
    }
 
    public function inspector()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
 
    public function scopeConforme($query)    { return $query->where('estado', true); }
    public function scopeNoConforme($query)  { return $query->where('estado', false); }
    public function scopePorFecha($query, $desde, $hasta)
    {
        if ($desde) $query->whereDate('fecha', '>=', $desde);
        if ($hasta) $query->whereDate('fecha', '<=', $hasta);
        return $query;
    }
    public function scopePorBarrera($query, $id) { return $query->where('barrera_plaga_id', $id); }
}