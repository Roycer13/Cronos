<?php

namespace App\Domain\PlantaLacteos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SolicitudAnalisisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'estado_planta_id' => 'required|integer|exists:PLL_estado_plantas,id'
        ];
    }

    public function messages(): array
    {
        return [
            'estado_planta_id.required' => 'El ID del estado de planta es requerido',
            'estado_planta_id.exists' => 'El estado de planta no existe'
        ];
    }
}