<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use Illuminate\Database\Eloquent\Model;

class ExtTipoMuestra extends Model
{
    protected $table = 'ext_tipo_muestra';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'norma_referencial',
        'ubicacion_id',
        'unidad',
        'aclaracion_unidad',
        'mesofilos',
        'coliformes',
        'mohos',
        'min_mes',
        'min_mes_exp',
        'max_mes',
        'max_mes_exp',
        'min_colTot',
        'min_colTot_exp',
        'max_colTot',
        'max_colTot_exp',
        'min_mohLev',
        'min_mohLev_exp',
        'max_mohLev',
        'max_mohLev_exp',
    ];

    // Relaciones
    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }

    public function detalles()
    {
        return $this->hasMany(ExtDetalleSolicitudAnalisis::class, 'tipo_muestra_id');
    }
    public function getMinMesConExponenteAttribute()
    {
        return $this->min_mes && $this->min_mes_exp !== null
            ? "{$this->min_mes} x 10^{$this->min_mes_exp}"
            : $this->min_mes;
    }
    // SCOPES
    public function scopeByUbicacion($query, $ubicacionId)
    {
        return $query->where('ubicacion_id', $ubicacionId);
    }

    public function scopeByNombre($query, $nombre)
    {
        return $query->where('nombre', 'like', "%$nombre%");
    }

    public function getAnalysisFlagsFromRanges(): array
    {
        return [
            'mesofilos' => !empty($this->min_mes) || !empty($this->max_mes),
            'coliformes' => !empty($this->min_colTot) || !empty($this->max_colTot),
            'mohos' => !empty($this->min_mohLev) || !empty($this->max_mohLev),
        ];
    }
}
