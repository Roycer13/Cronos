<?php
// app/Models/ExtMicrobiologia.php
namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;

class ExtMicrobiologia extends Model
{
    protected $table = 'ext_microbiologia';
    public $timestamps = false;

    protected $fillable = [
        'ext_detalle_solicitud_analisis_id', 'estado', 'fecha_siembra',
        'ana_sem_id', 'fecha_dia2', 'ana_dia2_id', 'aer_mes', 'col_tot',
        'fecha_dia5', 'ana_dia5_id', 'moh_lev', 'aer_mes2', 'col_tot2',
        'moh_lev2', 'observaciones',
    ];

    protected $casts = [
        'fecha_siembra' => 'date',
        'fecha_dia2' => 'date',
        'fecha_dia5' => 'date',
    ];

    // Relaciones
    public function detalle()
    {
        return $this->belongsTo(ExtDetalleSolicitudAnalisis::class, 'ext_detalle_solicitud_analisis_id');
    }


    public function analistaSiembra()
    {
        return $this->belongsTo(User::class, 'ana_sem_id');
    }

    public function analistaDia2()
    {
        return $this->belongsTo(User::class, 'ana_dia2_id');
    }

    public function analistaDia5()
    {
        return $this->belongsTo(User::class, 'ana_dia5_id');
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

    public function scopeByAnalistaSiembra($query, $userId)
    {
        return $query->where('ana_sem_id', $userId);
    }

    public function scopeByAnalistaDia2($query, $userId)
    {
        return $query->where('ana_dia2_id', $userId);
    }

    public function scopeByAnalistaDia5($query, $userId)
    {
        return $query->where('ana_dia5_id', $userId);
    }

    public function scopeRangoFechaSiembra($query, $desde, $hasta)
    {
        return $query->whereBetween('fecha_siembra', [$desde, $hasta]);
    }
}