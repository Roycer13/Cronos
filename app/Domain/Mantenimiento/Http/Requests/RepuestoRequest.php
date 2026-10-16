<?php

namespace App\Domain\Mantenimiento\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RepuestoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Obtén el modelo desde el parámetro de ruta 'repuesto' (singular)
        $repuesto = $this->route('repuesto');

        // Regla unique con el nombre correcto de la tabla
        $uniqueRule = Rule::unique('MAN_repuestos', 'codigo');

        // Si es una actualización (PUT/PATCH), ignora el registro actual
        if ($repuesto) {
            $uniqueRule->ignore($repuesto);
        }

        return [
            'nombre' => ['required', 'string', 'max:255'],
            'codigo' => ['required', 'string', 'max:255', $uniqueRule],
            'foto' => ['nullable', 'string'],
            'descripcion' => ['nullable', 'string'],
            'observacion' => ['nullable', 'string'],
            'stock_minimo' => ['nullable', 'integer'],
            'unidad_id' => ['nullable', 'exists:unidades,id'],
            'precio_relativo' => ['nullable', 'numeric'],
        ];
    }

    public function prepareForValidation()
    {
        // Solo si el campo existe en el request, lo transformamos
        if ($this->has('notificaciones_activas')) {
            $this->merge([
                'notificaciones_activas' => filter_var($this->notificaciones_activas, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }
}
