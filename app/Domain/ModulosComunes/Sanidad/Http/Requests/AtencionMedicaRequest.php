<?php

namespace App\Domain\ModulosComunes\Sanidad\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AtencionMedicaRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'paciente' => 'required|exists:users,id',
            'fecha_incidente' => 'nullable|date',
            'fecha_atencion' => 'required|date',
            'motivo_consulta' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string',
            'diagnostico' => 'nullable|string',
            'gravedad' => 'nullable|string|max:50',
            'temperatura' => 'nullable|numeric|min:25|max:45',
            'presion_arterial' => 'nullable|string|max:10',
            'frecuencia_respiratoria' => 'nullable|integer|min:0|max:200',
            'frecuencia_cardiaca' => 'nullable|integer|min:0|max:300',
            'tratamiento' => 'nullable|string',
            'transferencia' => 'boolean',
            'policlinico_id' => 'nullable|required_if:transferencia,true|exists:san_policlinicos,id',
            'estado_id' => 'required|exists:estados,id',
            'fecha_alta' => 'nullable|date|after_or_equal:fecha_atencion',
            'descripcion_alta' => 'nullable|string',
        ];
    }
}