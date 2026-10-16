<?php

namespace App\Domain\ModulosComunes\ControlPlagas\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ControlTrampaRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'PLAG_trampa_id'        => 'required|exists:PLAG_trampas,id',
            'tipo_revision'         => 'required|string|max:100',
            'observacion'           => 'required|string|max:255',
            'observacion_detalle'   => 'nullable|string|max:500',
            'correcion'             => 'nullable|string|max:500',
            'responsable_correcion' => 'nullable|string|max:255',
            'deterioro'             => 'nullable|boolean',
            'responsable_cambio'    => 'nullable|string|max:255',
        ];
    }
    public function messages(): array
    {
        return [
            'PLAG_trampa_id.required'  => 'Debe seleccionar una trampa.',
            'tipo_revision.required'   => 'Debe indicar el tipo de revisión.',
            'observacion.required'     => 'Debe seleccionar una observación.',
        ];
    }
}