<?php

namespace App\Domain\ModulosComunes\Canastillos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AjusteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'almacen_id' => 'required|exists:CAN_almacenes,id',
            'tipo_ajuste' => 'required|in:ingreso,salida',
            'observaciones' => 'nullable|string',
            'detalles' => 'required|array|min:1',
            'detalles.*.canastillo_id' => 'required|exists:CAN_canastillos,id',
            'detalles.*.cantidad' => 'required|integer|min:1',
        ];
    }
}
