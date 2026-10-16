<?php

namespace App\Domain\ModulosComunes\Canastillos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AlmacenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:255',
            'ubicacion' => 'nullable|string|max:255',
            'responsables' => 'nullable|array',
            'responsables.*' => 'exists:users,id',
            'tipo_almacen_id' => 'required|exists:CAN_tipo_almacenes,id',
            'observaciones' => 'nullable|string',
        ];
    }
}
