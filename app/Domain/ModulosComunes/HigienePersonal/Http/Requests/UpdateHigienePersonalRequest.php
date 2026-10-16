<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHigienePersonalRequest extends FormRequest
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
            'uniforme' => 'required|boolean',
            'limpieza' => 'required|boolean',
            'lavado_manos' => 'required|boolean',
            'salud' => 'required|boolean',
            'epp' => 'required|boolean',
            'objetos' => 'required|boolean',
            'material_equipo' => 'required|boolean',
            'observaciones' => 'nullable|string|max:1000',
            'correccion' => 'nullable|string|max:1000',
        ];
    }
}