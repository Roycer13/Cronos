<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInspeccionCasilleroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {

        return [
            'fecha'             => 'sometimes|required|date',
            'orden'             => 'sometimes|required|boolean',
            'limpieza'          => 'sometimes|required|boolean',
            'implementos_aseo'  => 'sometimes|required|boolean',
            'observacion'       => 'nullable|string|max:500',
            'correccion'         => 'nullable|string|max:500',
            'inspector1_id'     => 'nullable|exists:users,id',
            'inspector2_id'     => 'nullable|exists:users,id',
            'inspector3_id'     => 'nullable|exists:users,id',
        ];
    }
}
