<?php

namespace App\Domain\Sistema\Configuracion\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Cambia a true si todos los usuarios autenticados pueden crear/editar
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id; // Para actualizar, ignorar el propio email/codigo

        return [
            'name' => ['required', 'string', 'max:255'],
            'apellido' => ['required', 'string', 'max:255'],
            'codigo' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('users', 'codigo')->ignore($userId),
            ],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => [$this->isMethod('post') ? 'nullable' : 'nullable', 'string', 'confirmed'],
            'rol_id' => ['required', 'string'],
            'ubicacion_id' => ['required', 'exists:ubicaciones,id'],
            'area_id' => ['nullable', 'exists:areas,id'],
            'cargo' => ['nullable', 'string', 'max:255'],
            'turno' => ['nullable', 'string', 'max:50'],
            'profesion' => ['nullable', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'estado' => ['nullable', 'string', 'max:50'],
            'avatar' => ['nullable', 'string', 'max:255'],
            'firma_digital' => ['nullable', 'string', 'max:255'],
            'token_api' => ['nullable', 'string', 'max:255'],
            'preferencias' => ['nullable', 'array'],
            'notificaciones_activas' => ['nullable', 'boolean'],
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
