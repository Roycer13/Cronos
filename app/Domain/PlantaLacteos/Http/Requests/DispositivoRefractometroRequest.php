<?php

namespace App\Domain\PlantaLacteos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DispositivoRefractometroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'verificacion_temperatura' => 'nullable|numeric|between:-99.99,99.99',
            'verificacion_concentracion_0' => 'nullable|numeric|between:-99.99,99.99',
            'verificacion_concentracion_25' => 'nullable|numeric|between:-99.99,99.99',
            'requiere_ajuste' => 'nullable|boolean',
            'verificacion_ajuste_temperatura' => 'nullable|numeric|between:-99.99,99.99',
            'verificacion_ajuste_concentracion_0' => 'nullable|numeric|between:-99.99,99.99',
            'verificacion_ajuste_concentracion_25' => 'nullable|numeric|between:-99.99,99.99',
            'dispositivos_medicion_id' => 'required|exists:PLL_dispositivos_mediciones,id',
            'estado_id' => 'required|exists:estados,id',
            'fecha_hora' => 'nullable|date_format:Y-m-d\TH:i',
            'observaciones' => 'nullable|string|max:1000',
        ];

        // Si es update, hacemos algunos campos opcionales
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['dispositivos_medicion_id'] = 'sometimes|required|exists:PLL_dispositivos_mediciones,id';
            $rules['estado_id'] = 'sometimes|required|exists:estados,id';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'fecha_hora.required' => 'La fecha y hora son obligatorias.',
            'dispositivos_medicion_id.required' => 'El dispositivo de medición es obligatorio.',
            'user_id.required' => 'El usuario es obligatorio.',
            'estado_id.required' => 'El estado es obligatorio.',
        ];
    }

    public function prepareForValidation()
    {
        // Convertir valores decimales
        $this->merge([
            'requiere_ajuste' => $this->boolean('requiere_ajuste'),
        ]);
    }
}