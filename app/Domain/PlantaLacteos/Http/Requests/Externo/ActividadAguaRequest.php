<?php
namespace App\Domain\PlantaLacteos\Http\Requests\Externo;

use Illuminate\Foundation\Http\FormRequest;

class ActividadAguaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'fecha' => 'required|date',
            'temperatura' => 'nullable|numeric',
            'por_hum_rel' => 'nullable|numeric',
            'act_agua' => 'nullable|numeric',
            'observaciones' => 'nullable|string',
            // ext_verificacion_equipo_id puede ser opcional, lo decides
        ];
    }
}

