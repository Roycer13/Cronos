<?php

namespace App\Domain\PlantaLacteos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RecepcionLecheRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ruta_id' => ['required', 'exists:PLL_ruta_acopios,id'],
            'grupo_recepcion' => ['required', 'in:Camión,Tubo'],
            'subrutas_seleccionadas' => ['required', 'array', 'min:1'],
            'subrutas_seleccionadas.*' => ['exists:PLL_subruta_acopios,id'],
            'cantidad' => ['nullable', 'numeric', 'min:0.01'],
            'observaciones' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function prepareForValidation()
    {
        // Convertir campos vacíos a null
        if ($this->has('observaciones') && $this->observaciones === '') {
            $this->merge(['observaciones' => null]);
        }

        if ($this->has('cantidad') && $this->cantidad === '') {
            $this->merge(['cantidad' => null]);
        }
    }
}
