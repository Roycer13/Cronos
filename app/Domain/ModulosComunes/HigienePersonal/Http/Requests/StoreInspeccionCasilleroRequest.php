<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInspeccionCasilleroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Ajusta según tu lógica de permisos
    }

    public function rules(): array
    {
        return [
            'user_id'           => 'required|exists:users,id',
            'fecha'             => 'required|date',
            'orden'             => 'required|boolean',
            'limpieza'          => 'required|boolean',
            'implementos_aseo'  => 'required|boolean',
            'observacion'       => 'nullable|string|max:500',
            'correccion'         => 'nullable|string|max:500',
            'inspector1_id'     => 'nullable|exists:users,id',
            'inspector2_id'     => 'nullable|exists:users,id',
            'inspector3_id'     => 'nullable|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'Debe seleccionar un empleado.',
            'fecha.required'   => 'La fecha es obligatoria.',
            'orden.required'   => 'El campo Orden es obligatorio.',
            'limpieza.required'=> 'El campo Limpieza es obligatorio.',
            'implementos_aseo.required' => 'El campo Implementos de aseo es obligatorio.',
        ];
    }
}
