<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHigienePersonalRequest extends FormRequest
{
    public function rules(): array
    {
        $user = auth()->user();

        return [
            'empleado_id' => [
                'required',
                'exists:users,id',
                Rule::exists('users', 'id')->where('ubicacion_id', $user->ubicacion_id),
            ],
            'fecha' => 'required|date',
            'uniforme' => 'sometimes|boolean',
            'limpieza' => 'sometimes|boolean',
            'lavado_manos' => 'sometimes|boolean',
            'salud' => 'sometimes|boolean',
            'epp' => 'sometimes|boolean',
            'objetos' => 'sometimes|boolean',
            'material_equipo' => 'sometimes|boolean',
            'observaciones' => 'nullable|string|max:1000',
            'correccion' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'empleado_id.required' => 'El empleado es requerido',
            'empleado_id.exists' => 'El empleado seleccionado no existe en esta ubicación',
            'fecha.required' => 'La fecha es requerida',
            'fecha.date' => 'La fecha debe ser una fecha válida',
            'uniforme.required' => 'El campo uniforme es requerido',
            'limpieza.required' => 'El campo limpieza es requerido',
            'salud.required' => 'El campo salud es requerido',
            'epp.required' => 'El campo EPP es requerido',
            'objetos.required' => 'El campo objetos es requerido',
            'material_equipo.required' => 'El campo material/equipo es requerido',
        ];
    }
}
