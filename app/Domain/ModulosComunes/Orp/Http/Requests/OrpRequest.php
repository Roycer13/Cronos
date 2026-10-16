<?php

namespace App\Domain\ModulosComunes\Orp\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $orpId = $this->route('orp') ? $this->route('orp')->id : null;

        return [
            'codigo' => 'required|string|max:50|unique:orps,codigo,' . $orpId,
            'producto_terminado_id' => 'required|exists:producto_terminados,id',
            'lote' => 'required|numeric|min:0',
            // 'prioridad' => 'nullable|string|max:20|in:alta,media,baja,urgente',
            'cantidad_programada' => 'nullable|numeric|min:0',
            'cantidad_producida' => 'nullable|numeric|min:0',
            'unidad_id' => 'nullable|exists:unidades,id',
            'tiempo_elaboracion' => 'nullable|integer|min:0',

            'revisado' => 'boolean',
            'revisor_id' => 'nullable|exists:users,id',
            'fecha_revision' => 'nullable|date',

            'usuario_modificador_id' => 'nullable|exists:users,id',

            'fecha_vencimiento1' => 'nullable|date',
            'fecha_vencimiento2' => 'nullable|date',
            'notas_internas' => 'nullable|string',

            // 'ubicacion_id' => 'required|exists:ubicaciones,id',
            'observaciones' => 'nullable|string'
        ];
    }

    public function messages(): array
    {
        return [
            'codigo.required' => 'El código es obligatorio',
            'producto_terminado_id.required' => 'El producto terminado es obligatorio',
            'lote.required' => 'El lote es obligatorio',
            'usuario_creador_id.required' => 'El usuario creador es obligatorio',
            'fecha_creacion.required' => 'La fecha de creación es obligatoria',
            'ubicacion_id.required' => 'La ubicación es obligatoria'
        ];
    }
}
