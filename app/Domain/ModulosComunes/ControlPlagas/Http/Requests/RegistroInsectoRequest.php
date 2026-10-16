<?php

namespace App\Domain\ModulosComunes\ControlPlagas\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegistroInsectoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    public function rules(): array
    {
        return [
            'PLAG_insectocaptor_id' => 'required|exists:PLAG_insectocaptor,id',
            'mosca'              => 'nullable|integer|min:0',
            'mosquito'           => 'nullable|integer|min:0',
            'abeja'              => 'nullable|integer|min:0',
            'mariposa'           => 'nullable|integer|min:0',
            'otros'              => 'nullable|integer|min:0',
            'cambio_adhesivo'    => 'nullable|boolean',
            'estado_equipo'      => 'nullable|boolean',
            'observacion'        => 'nullable|string|max:500',
            'correcion'          => 'nullable|string|max:500',
        ];
    }
    public function messages(): array
    {
        return [
            'PLAG_insectocaptor_id.required' => 'Debe seleccionar un equipo',
        ];
    }
}
