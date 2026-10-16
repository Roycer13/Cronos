<?php
namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;


class ExtActividadAgua extends Model
{
    protected $table = 'ext_actividad_agua';
    public $timestamps = false;

    protected $fillable = [
        'ext_detalle_solicitud_analisis_id', 'estado', 'ext_verificacion_equipo_id',
        'fecha', 'temperatura', 'por_hum_rel', 'act_agua', 'user_id', 'observaciones',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    // Relaciones
    public function detalle()
    {
        return $this->belongsTo(ExtDetalleSolicitudAnalisis::class, 'ext_detalle_solicitud_analisis_id');
    }

    public function verificacionEquipo()
    {
        return $this->belongsTo(ExtVerifiacionEquipo::class, 'ext_verificacion_equipo_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // SCOPES
    public function scopeByDetalle($query, $detalleId)
    {
        return $query->where('ext_detalle_solicitud_analisis_id', $detalleId);
    }

    public function scopeByEstado($query, $estadoId)
    {
        return $query->where('estado_id', $estadoId);
    }

    public function scopeByUsuario($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRangoFechas($query, $desde, $hasta)
    {
        return $query->whereBetween('fecha', [$desde, $hasta]);
    }
}