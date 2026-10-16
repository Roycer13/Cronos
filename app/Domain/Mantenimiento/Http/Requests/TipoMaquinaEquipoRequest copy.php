<?php

namespace App\Domain\Mantenimiento\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TipoMaquinaEquipoRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Cambia a true si todos los usuarios autenticados pueden crear/editar
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre'=> ['required', 'string', 'max:255'],
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
