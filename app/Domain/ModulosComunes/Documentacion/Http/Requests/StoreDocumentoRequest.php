<?php

namespace App\Domain\ModulosComunes\Documentacion\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentoRequest extends FormRequest
{
  

    public function rules()
    {
        return [
            'codigo' => 'required|string|max:50|unique:documentos,codigo',
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'tipo' => 'required|string|max:50',
            'area_id' => 'required|exists:areas,id',
            'ubicacion_id' => 'nullable|exists:ubicaciones,id',
            'tipo_distribucion' => 'nullable|string|max:20',
            'ubicacion_fisica' => 'nullable|string|max:255',
            'documento_padre_id' => 'nullable|exists:documentos,id',
            'creador_asignado' => 'required|exists:users,id',
            'revisor1_asignado' => 'nullable|exists:users,id',
            'revisor2_asignado' => 'nullable|exists:users,id',
            'aprobador_asignado' => 'nullable|exists:users,id',
            'custodio' => 'nullable|exists:users,id',
        ];
    }
}
