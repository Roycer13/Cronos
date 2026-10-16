<?php
namespace App\Domain\PlantaLacteos\Http\Requests\Externo;

use Illuminate\Foundation\Http\FormRequest;

class CambiarEstadoDetalleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'estado' => 'required|string', // Ajusta según los estados permitidos
            'observaciones' => 'nullable|string',
        ];
    }
}
