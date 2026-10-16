<?php

namespace App\Domain\PlantaLacteos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DispositivoPhmetroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'verificacion_temperatura1' => 'nullable|numeric|between:-99.99,99.99',
            'verificacion_temperatura2' => 'nullable|numeric|between:-99.99,99.99',
            'verificacion_temperatura3' => 'nullable|numeric|between:-99.99,99.99',
            'verificacion_4' => 'nullable|numeric|between:-99.99,99.99',
            'verificacion_7' => 'nullable|numeric|between:-99.99,99.99',
            'verificacion_10' => 'nullable|numeric|between:-99.99,99.99',
            'requiere_ajuste' => 'nullable|boolean',
            'verificacion_ajuste_temperatura1' => 'nullable|numeric|between:-99.99,99.99',
            'verificacion_ajuste_temperatura2' => 'nullable|numeric|between:-99.99,99.99',
            'verificacion_ajuste_temperatura3' => 'nullable|numeric|between:-99.99,99.99',
            'verificacion_ajuste_4' => 'nullable|numeric|between:-99.99,99.99',
            'verificacion_ajuste_7' => 'nullable|numeric|between:-99.99,99.99',
            'verificacion_ajuste_10' => 'nullable|numeric|between:-99.99,99.99',
            'dispositivos_medicion_id' => 'required|exists:PLL_dispositivos_mediciones,id',
            'estado_id' => 'required|exists:estados,id',
            'fecha_hora' => 'nullable|date_format:Y-m-d\TH:i',
            'observaciones' => 'nullable|string|max:1000',
        ];

        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['dispositivos_medicion_id'] = 'sometimes|required|exists:PLL_dispositivos_mediciones,id';
            $rules['estado_id'] = 'sometimes|required|exists:estados,id';
        }

        return $rules;
    }

    public function prepareForValidation()
    {
        $this->merge([
            'requiere_ajuste' => $this->boolean('requiere_ajuste'),
        ]);
    }
}