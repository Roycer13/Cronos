<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateControlVisitaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre_visita'        => 'required|string|max:255',
            'empresa_area_trabajo' => 'required|string|max:255',
            'fecha'                => 'required|date',
            'fecha_entrada'        => 'required|date',
            'fecha_salida'         => 'nullable|date|after:fecha_entrada',
            'motivo'               => 'required|string|max:255',
            'area_empresa'         => 'required|string|max:255',
            'vestimenta'           => 'boolean',
            'higiene'              => 'boolean',
            'salud'                => 'boolean',
            'epp_entregado'        => 'boolean',
            'induccion'            => 'boolean',
            'observaciones'        => 'nullable|string|max:1000',
            'correcion'            => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre_visita.required'        => 'El nombre del visitante es obligatorio.',
            'empresa_area_trabajo.required'  => 'La empresa o área de trabajo es obligatoria.',
            'fecha.required'                 => 'La fecha es obligatoria.',
            'fecha_entrada.required'         => 'La fecha de entrada es obligatoria.',
            'fecha_salida.after'             => 'La fecha de salida debe ser posterior a la de entrada.',
            'motivo.required'                => 'El motivo de la visita es obligatorio.',
            'area_empresa.required'          => 'El área de la empresa es obligatoria.',
        ];
    }
}