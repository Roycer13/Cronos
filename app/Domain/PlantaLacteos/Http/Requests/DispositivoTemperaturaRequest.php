<?php

namespace App\Domain\PlantaLacteos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DispositivoTemperaturaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'patron_1' => 'nullable|numeric|between:-99.99,99.99',
            'inst_1' => 'nullable|numeric|between:-99.99,99.99',
            'error_1' => 'nullable|numeric|between:-99.99,99.99',
            'patron_2' => 'nullable|numeric|between:-99.99,99.99',
            'inst_2' => 'nullable|numeric|between:-99.99,99.99',
            'error_2' => 'nullable|numeric|between:-99.99,99.99',
            'patron_3' => 'nullable|numeric|between:-99.99,99.99',
            'inst_3' => 'nullable|numeric|between:-99.99,99.99',
            'error_3' => 'nullable|numeric|between:-99.99,99.99',
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
}