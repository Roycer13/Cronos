<?php

namespace App\Domain\ModulosComunes\Canastillos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TipoAlmacenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:255|unique:CAN_tipo_almacenes,nombre,' . $this->tipo_almacen?->id,
        ];
    }
}
