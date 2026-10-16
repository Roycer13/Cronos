<?php

namespace App\Domain\ModulosComunes\Sanidad\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReconsultaAtencionMedicaRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'atencion_medica_id' => 'required|exists:san_atencion_medicas,id',
            'fecha_atencion' => 'required|date',
            'evolucion_mejoria' => 'nullable|string',
            'tratamiento' => 'nullable|string',
            'transferencia' => 'boolean',
            'policlinico_id' => 'nullable|required_if:transferencia,true|exists:san_policlinicos,id',
        ];
    }
}