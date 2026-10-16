<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalisisMateriaPrima extends Model
{
    use HasFactory;

    protected $table = 'PLL_analisis_materia_primas';

    protected $fillable = [
        'numero_muestra',
        'recepcion_materia_prima_id',
        'tiempo_analisis',
        'temperatura',
        'lote',
        'ph',
        'solidos',
        'viscosidad',
        'densidad',
        'acidez',
        'color',
        'olor',
        'sabor',
        'aspecto',
        'textura',
        'sin_material_extraño',
        'conformidad',
        'observaciones',
        'user_id',
        'numero_bobina',
        'peso_neto',
        'adherencia',
        'frotacion',
        'texto',
        'sentido_embobinado',
        'largo_envase',
        'ancho_envase',
        'largo_taca',
        'ancho_taca',
        'distancia_taca_borde',
        'largo_superior',
        'largo_inferior',
        'ancho',
        'densidad_lineal',
        'numero_paquete',
        'peso_unitario',
        'largo_total',
        'ancho_total',
        'ancho_plegado',
        'micronaje',
        'resistencia_envase',
        'transparencia',
        'calidad_impresion',
        'numero_embalaje',
        'espesor',
        'altura_total',
        'diametro_medio',
        'altura_etiqueta',
        'perimetro_etiqueta',
        'diametro_cuello',
        'altura_plegada',
        'diametro_externo_base',
        'diametro_interno',
        'acabado_fino',
        'sin_deformidad',
        'resistencia_base',


    ];

    protected $casts = [
        'tiempo_analisis' => 'datetime',
        'color' => 'boolean',
        'olor' => 'boolean',
        'sabor' => 'boolean',
        'aspecto' => 'boolean',
        'textura' => 'boolean',
        'sin_material_extraño' => 'boolean',
        'conformidad' => 'boolean',
        'adherencia' => 'boolean',
        'frotacion' => 'boolean',
        'texto' => 'boolean',
        'sentido_embobinado' => 'boolean',
        'resistencia_envase' => 'boolean',
        'transparencia' => 'boolean',
        'calidad_impresion' => 'boolean',
        'acabado_fino' => 'boolean',
        'sin_deformidad' => 'boolean',
        'resistencia_base' => 'boolean',
    ];

    public function recepcionMateriaPrima()
    {
        return $this->belongsTo(RecepcionMateriaPrima::class, 'recepcion_materia_prima_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
