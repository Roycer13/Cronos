<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecepcionLote extends Model
{
    use HasFactory;

    protected $table = 'PLL_recepcion_lotes';

    protected $fillable = [
        'recepcion_materia_prima_id',
        'lote',
        'fecha_elaboracion',
        'fecha_vencimiento',
        'cantidad_recepcionada_unidades',
        'cantidad_recepcionada_unidad',
        'cantidad_recepcionada_peso_por_unidad',
        'cantidad_recepcionada_peso_por_unidad_medida',
        'cantidad_recepcionada_total_kg',
        'nuevo_ingreso_almacen_id',
        'ingreso_traspaso',
        'tipo_material',
        'elementos_extraños',
        'textura_apariencia',
        'sabor',
        'impresion',
        'color',
        'olor',
        'sellado',
        'largo_total_cm',
        'largo_plegado_cm',
        'ancho_total_cm',
        'ancho_plegado_cm',
        'diametro_cm',
        'tamano_fuelle_cm',
        'alto_cm',
        'espesor_micrones',
        'temperatura_c',
        'humedad_promedio',
        'gluten_humedo_promedio',
        'gluten_seco_desarrollo',
        'ph',
        'densidad',
        'grados_brix',
        'prueba_desarrollo',
        'prueba_inmersion_agua_promedio',
        'punto_fusion_promedio_c',
        'ficha_tecnica_certificado',
        'conforme_no_conforme',
        'observaciones',
        'aceptado_rechazo',
        'observaciones_conformidad_rechazo',
        'nombre_conductor',
        'placa',
        'tipo_movilidad',
        'estado_envase_carroceria',
        'estado_lote',
    ];

    protected $casts = [
        'fecha_elaboracion' => 'date',
        'fecha_vencimiento' => 'date',
        'cantidad_recepcionada_unidades' => 'decimal:3',
        'cantidad_recepcionada_peso_por_unidad' => 'decimal:2',
        'cantidad_recepcionada_total_kg' => 'decimal:3',
        'largo_total_cm' => 'decimal:2',
        'largo_plegado_cm' => 'decimal:2',
        'ancho_total_cm' => 'decimal:2',
        'ancho_plegado_cm' => 'decimal:2',
        'diametro_cm' => 'decimal:2',
        'tamano_fuelle_cm' => 'decimal:2',
        'alto_cm' => 'decimal:2',
        'espesor_micrones' => 'decimal:2',
        'temperatura_c' => 'decimal:2',
        'humedad_promedio' => 'decimal:2',
        'gluten_humedo_promedio' => 'decimal:2',
        'ph' => 'decimal:2',
        'densidad' => 'decimal:4',
        'grados_brix' => 'decimal:2',
        'prueba_inmersion_agua_promedio' => 'decimal:2',
        'punto_fusion_promedio_c' => 'decimal:2',
        'conforme_no_conforme' => 'boolean',
    ];

    // Relaciones
    public function recepcionMateriaPrima()
    {
        return $this->belongsTo(RecepcionMateriaPrima::class, 'recepcion_materia_prima_id');
    }

    // ✅ Relación faltante agregada
    public function nuevoIngresoAlmacen()
    {
        return $this->belongsTo(AlmacenMateriaPrima::class, 'nuevo_ingreso_almacen_id');
    }
}