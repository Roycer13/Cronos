<?php

namespace App\Domain\Mantenimiento\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OtRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Cambia a true si todos los usuarios autenticados pueden crear/editar
        return true;
    }

    public function rules(): array
    {
         return [
            'solicitud_ot_id' => [
                'required',
                'exists:MAN_solicitud_ots,id',
                // Solo permitir si no existe otra OT con esa solicitud
                Rule::unique('MAN_ots', 'solicitud_ot_id'),
            ],
            'user_id' => ['required', 'exists:users,id'],
            'prioridad_id' => ['required', 'exists:prioridades,id'],
            'tipo_orden' => ['nullable', 'in:Correctiva,Preventiva'],
            'estado_id' => ['nullable', 'exists:estados,id'],
        ];
    }


     public function messages(): array
    {
        return [
            'solicitud_ot_id.unique' => 'Esta solicitud ya tiene una Orden de Trabajo asignada.',
            'solicitud_ot_id.exists' => 'La solicitud seleccionada no existe.',
            'prioridad_id.required' => 'Debe seleccionar una prioridad.',
            'user_id.required' => 'Debe asignar un usuario responsable.',
        ];
    }

    public function prepareForValidation()
    {
        // Convertir campos booleanos vacíos a false
        if ($this->has('notificaciones_activas')) {
            $this->merge([
                'notificaciones_activas' => filter_var($this->notificaciones_activas, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }
}
