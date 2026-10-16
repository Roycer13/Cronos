<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReporteRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
            'empleado_id' => 'nullable|exists:users,id',
            'area_id' => 'nullable|exists:areas,id',
            'turno' => 'nullable|string',
            'conforme' => 'nullable|boolean',
        ];
    }
}
