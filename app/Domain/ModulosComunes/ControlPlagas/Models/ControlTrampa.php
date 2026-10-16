<?php

namespace App\Domain\ModulosComunes\ControlPlagas\Models;
 
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Domain\Sistema\Configuracion\Models\User;
 
class ControlTrampa extends Model
{
    use HasFactory, SoftDeletes;
 
    protected $table = 'PLAG_control_vectores';
 
    protected $fillable = [
        'PLAG_trampa_id',
        'user_id',
        'fecha',
        'tipo_revision',
        'observacion',
        'observacion_detalle',
        'correcion',
        'responsable_correcion',
        'deterioro',
        'responsable_cambio',
    ];
 
    protected $casts = [
        'fecha'     => 'datetime',
        'deterioro' => 'boolean',
    ];
 
    public const TIPOS_REVISION = [
        'Revisión Interna',
        'Revisión Externa',
    ];
 
    public const OBSERVACIONES_GLOSAS = [
        'SM - Sin movimiento',
        'SC - Sin consumo',
        'CR - Consumo por roedor',
        'CB - Consumo por babosa',
        'CV - Captura viva',
        'CD - Cebo deteriorado',
        'TD - Trampa deteriorado',
        'TO - Trampa obstruida',
        'AT - Ausencia de trampa',
        'PD - Pegante Deteriorado',
        'O - Otros (Especificar en detalle)',
    ];
 
    public function trampa()
    {
        return $this->belongsTo(Trampa::class, 'PLAG_trampa_id');
    }
 
    public function inspector()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
 
    public function scopePorFecha($query, $desde, $hasta)
    {
        if ($desde) $query->whereDate('fecha', '>=', $desde);
        if ($hasta) $query->whereDate('fecha', '<=', $hasta);
        return $query;
    }
    public function scopeConDeterioro($query)   { return $query->where('deterioro', true); }
    public function scopePorTrampa($query, $id) { return $query->where('PLAG_trampa_id', $id); }
    public function scopePorTipoRevision($query, $t) { return $query->where('tipo_revision', $t); }
}