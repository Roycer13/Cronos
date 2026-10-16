<?php

namespace App\Domain\ModulosComunes\Documentacion\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVersionDocumentoRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user()->can('create', \App\Domain\ModulosComunes\Documentacion\Models\VersionDocumento::class);
    }

    public function rules()
    {
        return [
            'cambios' => 'required|string|max:1000',
            'archivo_pdf' => 'nullable|file|mimes:pdf|max:10240', // 10MB
            'archivo_word' => 'nullable|file|mimes:doc,docx|max:10240',
            'observaciones' => 'nullable|string|max:500',
            'revisado1_por' => 'nullable|exists:users,id',
            'revisado2_por' => 'nullable|exists:users,id',
            'aprobado_por' => 'nullable|exists:users,id',
        ];
    }

    public function attributes()
    {
        return [
            'cambios' => 'descripción de cambios',
            'archivo_pdf' => 'archivo PDF',
            'archivo_word' => 'archivo Word',
        ];
    }
}