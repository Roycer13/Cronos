<?php

namespace App\Domain\ModulosComunes\Documentacion\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDistribucionRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user()->can('documents.distribute');
    }

    public function rules()
    {
        return [
            'tipo' => 'required|string|in:fisica,digital,mixta',
            'cantidad_copias' => 'nullable|integer|min:1',
            'area_destinataria_id' => 'nullable|exists:areas,id',
            'responsable_user_id' => 'nullable|exists:users,id',
            'ubicacion_fisica' => 'nullable|string',
            'acceso_usuario_id' => 'nullable|exists:users,id',
            'fecha_inicio_acceso' => 'nullable|date',
            'fecha_fin_acceso' => 'nullable|date|after_or_equal:fecha_inicio_acceso',
            'control_descarga' => 'nullable|boolean',
        ];
    }
}
