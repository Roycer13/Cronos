<?php 
namespace App\Domain\PlantaLacteos\Http\Requests\Externo;

use Illuminate\Foundation\Http\FormRequest;

class CambiarEstadoSolicitudRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'estado' => 'required|string|in:Aceptado,Rechazado,Observado',
            'observaciones' => 'nullable|string',
        ];
    }
}