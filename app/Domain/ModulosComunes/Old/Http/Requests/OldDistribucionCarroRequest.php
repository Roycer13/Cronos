<?php

namespace App\Domain\ModulosComunes\Old\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OldDistribucionCarroRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'fecha' => 'required|date',
            'destino' => 'nullable|string|max:255',
            'placa' => 'nullable|string|max:255',
            'paredes_externas' => 'boolean',
            'limpieza_interno' => 'boolean',
            'ausencia_objetos_olores' => 'boolean',
            'ausenci_objetos y olores' => 'boolean',
            'set_temperatura' => 'nullable|numeric',
            'bph_chofer' => 'boolean',
            'bph_ayudante' => 'boolean',
            'observaciones' => 'nullable|string',
            'correciones' => 'nullable|string',
        ];
    }

    public function attributes()
    {
        return [
            'fecha' => 'Fecha',
            'destino' => 'Destino',
            'placa' => 'Placa',
            'paredes_externas' => 'Paredes Externas',
            'limpieza_interno' => 'Limpieza Interno',
            'ausencia_objetos_olores' => 'Ausencia de Objetos y Olores',
            'set_temperatura' => 'Set de Temperatura',
            'bph_chofer' => 'BPH Chofer',
            'bph_ayudante' => 'BPH Ayudante',
            'observaciones' => 'Observaciones',
            'correciones' => 'Correcciones',
        ];
    }
}
