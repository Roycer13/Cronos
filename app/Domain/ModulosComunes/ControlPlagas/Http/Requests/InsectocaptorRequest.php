<?php

namespace App\Domain\ModulosComunes\ControlPlagas\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InsectocaptorRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'man_sector_id'  => 'nullable|exists:man_sectores,id',
            'codigo_interno' => 'nullable|string|max:100',
            'codigo_externo' => 'nullable|string|max:100',
            'estado'         => 'nullable|boolean',
            'tipo'           => 'required|string|in:Insectocaptor,Insectocutor',
        ];
    }
    public function messages(): array
    {
        return [
            'tipo.required' => 'Debe seleccionar el tipo de equipo.',
            'tipo.in'       => 'El tipo debe ser Insectocaptor o Insectocutor.',
        ];
    }
}