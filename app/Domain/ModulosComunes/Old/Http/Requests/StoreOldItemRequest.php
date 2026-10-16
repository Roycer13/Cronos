<?php

namespace App\Domain\ModulosComunes\Old\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOldItemRequest extends FormRequest
{
   
    public function rules(): array
    {
        return [
            'nombre' => 'nullable|string|max:255',
            'old_subarea_id' => 'nullable|exists:old_subareas,id',
            'descripcion' => 'nullable|string',

            // ⚠️ Todos los boolean pueden venir como true/false
            '*' => 'nullable'
        ];
    }
}