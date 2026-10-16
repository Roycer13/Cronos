<?php

namespace App\Domain\ModulosComunes\Old\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReporteRegistroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
            'area_id'     => 'nullable|exists:old_areas,id',
            'subarea_id'  => 'nullable|exists:old_subareas,id',
            'turno'       => 'nullable|integer|min:1|max:3',
            'nivel'       => 'nullable|integer|min:0|max:2',
        ];
    }

    public function messages(): array
    {
        return [
            'fecha_hasta.after_or_equal' => 'La fecha hasta debe ser igual o posterior a la fecha desde.',
        ];
    }
}