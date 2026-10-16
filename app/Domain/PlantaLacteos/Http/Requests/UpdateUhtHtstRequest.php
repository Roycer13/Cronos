<?php

namespace App\Domain\PlantaLacteos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUhtHtstRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = auth()->user();
        return $user && $user->role && $user->role->rolModuloPermisos
            ->where('modulo_id', 12)
            ->where('permiso_id', 3)
            ->isNotEmpty();
    }

    public function rules(): array
    {
        return [
            'peso' => 'nullable|numeric|prohibits:tempUHT,fecha_vencimiento1',
            'tempUHT' => 'nullable|numeric|prohibits:peso,fecha_vencimiento1',
            'fecha_vencimiento1' => 'nullable|date|prohibits:peso,tempUHT',
        ];
    }

    public function messages(): array
    {
        return [
            'peso.prohibits' => 'No puede enviar peso junto con otros campos.',
            'tempUHT.prohibits' => 'No puede enviar temperatura junto con otros campos.',
            'fecha_vencimiento1.prohibits' => 'No puede enviar fecha de vencimiento junto con otros campos.',
        ];
    }
}