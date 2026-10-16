<?php

namespace App\Domain\ModulosComunes\Documentacion\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SolicitudDocumentoRequest extends FormRequest
{
    public function rules()
    {
        return [
            
            'tipo_solicitud' => 'required|string',
            'documento_id' => 'nullable|exists:documentos,id',
            'justificacion' => 'nullable|string',
            'alcance' => 'nullable|string',
            'limite_fecha_elaboracion' => 'nullable|date',
            'limite_fecha_revision_tecnica' => 'nullable|date',
            'limite_fecha_revision_calidad' => 'nullable|date',
            'limite_fecha_revision_aprobacion' => 'nullable|date',
        ];
    }
}

