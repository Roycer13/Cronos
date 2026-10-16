<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDotacionGuanteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id'            => 'required|exists:users,id',
            'tiempo'             => 'required|date',
            'tipo'               => 'required|string|in:Dotacion,Cambio',
            'amarillo_naranja'   => 'boolean',
            'azul'               => 'boolean',
            'naranja'            => 'boolean',
            'alta_temperatura'   => 'boolean',
            'observaciones'      => 'nullable|string|max:1000',
            'tiempo_devolucion'  => 'nullable|date',
            'estado_id'          => 'nullable|exists:estados,id',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required'    => 'El empleado es obligatorio.',
            'user_id.exists'      => 'El empleado seleccionado no es válido.',
            'tiempo.required'     => 'La fecha y hora es obligatoria.',
            'tipo.required'       => 'El tipo de guante es obligatorio.',
        ];
    }
}
