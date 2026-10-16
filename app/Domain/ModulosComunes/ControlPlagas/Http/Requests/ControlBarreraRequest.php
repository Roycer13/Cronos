<?php

namespace App\Domain\ModulosComunes\ControlPlagas\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ControlBarreraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    public function rules(): array
    {
        return [
            'barrera_plaga_id' => 'required|exists:PLAG_barrera_plagas,id',
            'fecha'            => 'nullable|date',
            'estado'           => 'nullable|boolean',
            'observacion'      => 'nullable|string|max:500',
            'correcion'        => 'nullable|string|max:500',
        ];
    }
    public function messages(): array
    {
        return [
            'barrera_plaga_id.required' => 'Debe seleccionar una barrera.',
            'barrera_plaga_id.exists'   => 'La barrera seleccionada no existe.',
        ];
    }
}
