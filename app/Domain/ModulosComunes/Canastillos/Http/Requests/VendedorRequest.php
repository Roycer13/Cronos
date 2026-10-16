<?php

namespace App\Domain\ModulosComunes\Canastillos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VendedorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'codigo' => 'nullable|string|max:50|unique:CAN_vendedores,codigo,' . $this->vendedor?->id,
            'telefono' => 'nullable|string|max:20',
        ];
    }
}
