<?php

namespace App\Domain\ModulosComunes\Canastillos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CanastilloRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:255',
            'alias' => 'nullable|string|max:255',
            'tamaño' => 'nullable|string|max:50',
            'precio' => 'nullable|numeric|min:0',
            'color' => 'nullable|string|max:50',
            'detalle' => 'nullable|string',
        ];
    }
}
