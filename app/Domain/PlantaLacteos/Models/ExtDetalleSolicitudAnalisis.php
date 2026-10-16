<?php
// app/Models/ExtDetalleSolicitudAnalisis.php
namespace App\Domain\PlantaLacteos\Models;

use App\Domain\ModulosComunes\Productos\Models\ProductoTerminado;
use Illuminate\Database\Eloquent\Model;

class ExtDetalleSolicitudAnalisis extends Model
{
    protected $table = 'ext_detalle_solicitud_analisis';
    public $timestamps = false;

    protected $fillable = [
        'ext_solicitud_analisis_id', 'producto_terminado_id', 'subcodigo', 'estado',
        'fecha_muestreo', 'lote', 'fecha_elaboracion', 'fecha_vencimiento',
        'tipo_muestra_id', 'tipo_analisis', 'personal_ambiente_superficie',
        'estado_id', 'observaciones', 'certificado_emitido', 'certificado_emitido_en',
    ];

    protected $casts = [
        'fecha_muestreo' => 'date',
        'fecha_elaboracion' => 'date',
        'fecha_vencimiento' => 'date',
        'certificado_emitido' => 'boolean',
        'certificado_emitido_en' => 'datetime',
    ];

    // Relaciones
    public function solicitud()
    {
        return $this->belongsTo(ExtSolicitudAnalisis::class, 'ext_solicitud_analisis_id');
    }

    public function productoTerminado()
    {
        return $this->belongsTo(ProductoTerminado::class, 'producto_terminado_id');
    }

    public function tipoMuestra()
    {
        return $this->belongsTo(ExtTipoMuestra::class, 'tipo_muestra_id');
    }

    public function microbiologias()
    {
        return $this->hasMany(ExtMicrobiologia::class, 'ext_detalle_solicitud_analisis_id');
    }

    public function actividadAgua()
    {
        return $this->hasOne(ExtActividadAgua::class, 'ext_detalle_solicitud_analisis_id');
    }

    public function aguaFisico()
    {
        return $this->hasOne(ExtAguaFisico::class, 'ext_detalle_solicitud_analisis_id');
    }

    // SCOPES
    public function scopeBySolicitud($query, $solicitudId)
    {
        return $query->where('ext_solicitud_analisis_id', $solicitudId);
    }

    public function scopeByEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    public function scopeByEstadoId($query, $estadoId)
    {
        return $query->where('estado_id', $estadoId);
    }

    public function scopeByProducto($query, $productoId)
    {
        return $query->where('producto_terminado_id', $productoId);
    }

    public function scopeByTipoMuestra($query, $tipoMuestraId)
    {
        return $query->where('tipo_muestra_id', $tipoMuestraId);
    }

    public function scopeByLote($query, $lote)
    {
        return $query->where('lote', 'like', "%$lote%");
    }

    public function scopeRangoFechaMuestreo($query, $desde, $hasta)
    {
        return $query->whereBetween('fecha_muestreo', [$desde, $hasta]);
    }
}