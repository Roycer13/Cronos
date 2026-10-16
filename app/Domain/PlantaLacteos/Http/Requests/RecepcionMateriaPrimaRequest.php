<?php

namespace App\Domain\PlantaLacteos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RecepcionMateriaPrimaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'item_materia_prima_id'   => 'required|integer|exists:PLL_item_materia_primas,id',
            'proveedor_materia_prima_id' => 'required|integer|exists:PLL_proveedor_materia_primas,id',
            'almacenero_id'           => 'required|integer|exists:users,id',

            'tiempo'                  => 'nullable|date',
            'cantidad'                => 'nullable|numeric',
            'unidades'                => 'nullable|numeric',
            'marca'                   => 'nullable|string|max:255',
            'limpieza_transporte'     => 'nullable|boolean',
            'sin_elementos'           => 'nullable|boolean',
            'cerrado'                 => 'nullable|boolean',
            'nit'                     => 'nullable|boolean',
            'rs'                      => 'nullable|boolean',
            'certificado'             => 'nullable|boolean',
            'observacion'             => 'nullable|string',
            'correccion'              => 'nullable|string',
            'codigo_certificado'      => 'nullable|string|max:255',
            'certificado_pdf'         => 'nullable|file|mimes:pdf|max:10240',
            'estado_id'               => 'nullable|integer',
            'liberacion_id'           => 'nullable|integer',
            'ubicacion_id'            => 'nullable|integer',
            'almacen_materia_prima_id'=> 'nullable|integer',

            'registro_senasag'        => 'nullable|string|max:100',
            'cantidad_recepcionada_unidades' => 'nullable|numeric',
            'cantidad_recepcionada_unidad' => 'nullable|string|in:BIDONES,BOLSAS,CAJAS,OTROS',
            'cantidad_recepcionada_peso_por_unidad_kg' => 'nullable|numeric',
            'cantidad_recepcionada_total_kg' => 'nullable|numeric',

            'lotes'                   => 'nullable|array',
            'lotes.*.lote'            => 'nullable|string|max:255',
            'lotes.*.fecha_elaboracion' => 'nullable|date',
            'lotes.*.fecha_vencimiento' => 'nullable|date',

            'lotes.*.cantidad_recepcionada_unidades' => 'nullable|numeric',
            'lotes.*.cantidad_recepcionada_unidad' => 'nullable|string|in:BIDONES,BOLSAS,CAJAS,OTROS',
            'lotes.*.cantidad_recepcionada_peso_por_unidad' => 'nullable|numeric',
            'lotes.*.cantidad_recepcionada_peso_por_unidad_medida' => 'nullable|string|in:KG,LITRO,MILITROS,OTROS',
            'lotes.*.cantidad_recepcionada_total_kg' => 'nullable|numeric',
            'lotes.*.nuevo_ingreso_almacen_id' => 'nullable|integer|exists:PLL_almacen_materia_prima,id',
            'lotes.*.ingreso_traspaso' => 'nullable|string|max:255',
            'lotes.*.tipo_material'   => 'nullable|string|max:100',
            'lotes.*.elementos_extraños' => 'nullable|string',
            'lotes.*.textura_apariencia' => 'nullable|string|max:200',
            'lotes.*.sabor'           => 'nullable|string|max:100',
            'lotes.*.impresion'       => 'nullable|string|max:100',
            'lotes.*.color'           => 'nullable|string|max:50',
            'lotes.*.olor'            => 'nullable|string|max:50',
            'lotes.*.sellado'         => 'nullable|string|max:100',
            'lotes.*.largo_total_cm'  => 'nullable|numeric',
            'lotes.*.largo_plegado_cm'=> 'nullable|numeric',
            'lotes.*.ancho_total_cm'  => 'nullable|numeric',
            'lotes.*.ancho_plegado_cm'=> 'nullable|numeric',
            'lotes.*.diametro_cm'     => 'nullable|numeric',
            'lotes.*.tamano_fuelle_cm'=> 'nullable|numeric',
            'lotes.*.alto_cm'         => 'nullable|numeric',
            'lotes.*.espesor_micrones'=> 'nullable|numeric',
            'lotes.*.temperatura_c'   => 'nullable|numeric',
            'lotes.*.humedad_promedio'=> 'nullable|numeric',
            'lotes.*.gluten_humedo_promedio' => 'nullable|numeric',
            'lotes.*.gluten_seco_desarrollo' => 'nullable|string|max:100',
            'lotes.*.ph'              => 'nullable|numeric',
            'lotes.*.densidad'        => 'nullable|numeric',
            'lotes.*.grados_brix'     => 'nullable|numeric',
            'lotes.*.prueba_desarrollo' => 'nullable|string|max:100',
            'lotes.*.prueba_inmersion_agua_promedio' => 'nullable|numeric',
            'lotes.*.punto_fusion_promedio_c' => 'nullable|numeric',
            'lotes.*.ficha_tecnica_certificado' => 'nullable|string|max:255',
            'lotes.*.conforme_no_conforme' => 'nullable|boolean',
            'lotes.*.observaciones'   => 'nullable|string',
            'lotes.*.aceptado_rechazo'=> 'nullable|string|max:20',
            'lotes.*.observaciones_conformidad_rechazo' => 'nullable|string',
            'lotes.*.nombre_conductor'=> 'nullable|string|max:150',
            'lotes.*.placa'           => 'nullable|string|max:20',
            'lotes.*.tipo_movilidad'  => 'nullable|string|max:50',
            'lotes.*.estado_envase_carroceria' => 'nullable|string|max:200',
            'lotes.*.estado_lote'     => 'nullable|string|max:50',
        ];
    }

    public function prepareForValidation()
    {
        $input = $this->all();
        array_walk_recursive($input, function (&$value) {
            if ($value === '') {
                $value = null;
            }
        });

        // Autocalcular total de la recepción
        if (isset($input['cantidad_recepcionada_unidades'], $input['cantidad_recepcionada_peso_por_unidad_kg']) &&
            $input['cantidad_recepcionada_unidades'] !== null && $input['cantidad_recepcionada_peso_por_unidad_kg'] !== null) {
            $input['cantidad_recepcionada_total_kg'] = (float) $input['cantidad_recepcionada_unidades'] * (float) $input['cantidad_recepcionada_peso_por_unidad_kg'];
        }

        // Autocalcular total para cada lote
        if (isset($input['lotes']) && is_array($input['lotes'])) {
            foreach ($input['lotes'] as &$lote) {
                if (isset($lote['cantidad_recepcionada_unidades'], $lote['cantidad_recepcionada_peso_por_unidad']) &&
                    $lote['cantidad_recepcionada_unidades'] !== null && $lote['cantidad_recepcionada_peso_por_unidad'] !== null) {
                    $lote['cantidad_recepcionada_total_kg'] = (float) $lote['cantidad_recepcionada_unidades'] * (float) $lote['cantidad_recepcionada_peso_por_unidad'];
                }
            }
        }

        $this->replace($input);
    }
}
