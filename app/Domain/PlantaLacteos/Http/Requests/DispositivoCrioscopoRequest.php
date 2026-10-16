<?php

namespace App\Domain\PlantaLacteos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DispositivoCrioscopoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'punto_ajuste_a' => 'nullable|boolean',
            'punto_ajuste_b' => 'nullable|boolean',
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
            'punto_ajuste_a' => $this->boolean('punto_ajuste_a'),
            'punto_ajuste_b' => $this->boolean('punto_ajuste_b'),
        ]);
    }
}