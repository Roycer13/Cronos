<?php

namespace App\Domain\ModulosComunes\Old\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOldRegistroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id',
            'revisor_id'    => 'required|exists:users,id|different:user_id',
            'tiempo_realizado' => 'required|date',
            'registros' => 'required|array|min:1',
            'registros.*.old_item_id' => 'required|exists:old_items,id',
            'registros.*.orden' => 'boolean',
            'registros.*.limpieza' => 'boolean',
            'registros.*.desinfeccion' => 'boolean',
            'registros.*.observacion' => 'nullable|string',
            'registros.*.correcion' => 'nullable|string',
        ];
    }
}
