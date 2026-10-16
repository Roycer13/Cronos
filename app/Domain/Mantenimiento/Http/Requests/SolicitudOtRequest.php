<?php

namespace App\Domain\Mantenimiento\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SolicitudOtRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Cambia a true si todos los usuarios autenticados pueden crear/editar
        return true;
    }

    public function rules(): array
    {
        return [


            'user_id'=> ['required'],
            'descripcion'=> ['required'],
            // 'sector_id'=> ['required'],




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
