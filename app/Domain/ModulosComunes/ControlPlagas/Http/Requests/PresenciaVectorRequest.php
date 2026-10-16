<?php

namespace App\Domain\ModulosComunes\ControlPlagas\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PresenciaVectorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    public function rules(): array
    {
        return [
            'man_sector_id' => 'nullable|exists:man_sectores,id',
            'vector'        => 'required|string|max:100',
            'reportado_por' => 'required|string|max:255',
            'fecha'         => 'nullable|date',
            'estado'        => 'nullable|boolean',
            'accion'        => 'nullable|string|max:500',
        ];
    }
    public function messages(): array
    {
        return [
            'vector.required'        => 'Debe indicar el tipo de vector.',
            'reportado_por.required' => 'Debe indicar quién reporta.',
        ];
    }
}
