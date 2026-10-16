<?php

namespace App\Domain\PlantaLacteos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InfraestructuraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ubicacion_id' => 'required|exists:ubicaciones,id',
            'nombre' => 'required|string|max:255',
            'nivel' => 'nullable|string',
            'periodicidad_dias' => 'required|integer|min:1',
            'activo' => 'boolean',
            'usa_pisos' => 'boolean',
            'usa_paredes' => 'boolean',
            'usa_techos' => 'boolean',
            'usa_puertas' => 'boolean',
            'usa_ventanas' => 'boolean',
            'usa_drenajes' => 'boolean',
            'usa_iluminacion' => 'boolean',
            'usa_ventilacion' => 'boolean',
            'usa_lavamanos' => 'boolean',
            'usa_servicios_sanitarios' => 'boolean',
            'usa_almacenamiento' => 'boolean',
            'usa_senalizacion' => 'boolean',
            'usa_maquina_equipo' => 'boolean',
            'usa_extra' => 'boolean',
        ];
    }
}
