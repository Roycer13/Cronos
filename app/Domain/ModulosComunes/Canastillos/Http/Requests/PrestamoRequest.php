<?php

namespace App\Domain\ModulosComunes\Canastillos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PrestamoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'almacen_id' => 'required|exists:CAN_almacenes,id',
            'vendedor_id' => 'required|exists:CAN_vendedores,id',
            'observaciones' => 'nullable|string',
            'detalles' => 'required|array|min:1',
            'detalles.*.canastillo_id' => 'required|exists:CAN_canastillos,id',
            'detalles.*.cantidad' => 'required|integer|min:1',
        ];
    }
}
