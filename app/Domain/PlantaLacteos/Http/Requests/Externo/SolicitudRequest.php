<?php

namespace App\Domain\PlantaLacteos\Http\Requests\Externo;

use Illuminate\Foundation\Http\FormRequest;

class SolicitudRequest extends FormRequest
{

    public function rules(): array
    {
        return [
            'detalles' => 'required|array|min:1',
            'detalles.*.producto_terminado_id' => 'nullable|required_without:detalles.*.personal_ambiente_superficie|exists:producto_terminados,id',
            'detalles.*.fecha_muestreo' => 'required|date',
            'detalles.*.lote' => 'nullable|string|max:255',
            'detalles.*.fecha_elaboracion' => 'nullable|date',
            'detalles.*.fecha_vencimiento' => 'nullable|date',
            'detalles.*.tipo_muestra_id' => 'required|exists:ext_tipo_muestra,id',
            'detalles.*.tipo_analisis' => 'required|array|min:1', // <-- ahora array
            'detalles.*.tipo_analisis.*' => 'string|in:Microbiología,Fisicoquímico,Agua', // cada elemento
            'detalles.*.personal_ambiente_superficie' => 'nullable|string|max:255',
            'observaciones' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'detalles.required' => 'Debe agregar al menos un detalle de análisis.',

            'detalles.*.fecha_muestreo.required' => 'La fecha de muestreo es obligatoria.',
            'detalles.*.tipo_muestra_id.required' => 'Debe seleccionar un tipo de muestra.',
            'detalles.*.tipo_analisis.required' => 'Debe seleccionar al menos un tipo de análisis.',
            'detalles.*.tipo_analisis.*.in' => 'El tipo de análisis debe ser Microbiología o Fisicoquímico.',
        ];
    }
}
