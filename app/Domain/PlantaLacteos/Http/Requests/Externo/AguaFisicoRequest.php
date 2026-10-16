<?php
namespace App\Domain\PlantaLacteos\Http\Requests\Externo;

use Illuminate\Foundation\Http\FormRequest;

class AguaFisicoRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'fecha' => 'required|date',
            'ph' => 'nullable|numeric',
            'dureza' => 'nullable|numeric',
            'cloruros' => 'nullable|numeric',
            'conductividad' => 'nullable|numeric',
            'observaciones' => 'nullable|string',
        ];
    }
}