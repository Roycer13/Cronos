<?php
namespace App\Domain\PlantaLacteos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DispositivoTermohigrometroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha_hora' => 'required|date',
            'dispositivos_medicion_id' => 'required|exists:PLL_dispositivos_mediciones,id',
            'user_id' => 'nullable|exists:users,id',
            'estado_id' => 'nullable|exists:estados,id',
            'requiere_ajuste' => 'boolean',
            'patron_temperatura' => 'nullable|numeric|between:-100,200',
            'equipo_temperatura' => 'nullable|numeric|between:-100,200',
            'error_temperatura' => 'nullable|numeric|between:-100,200',
            'patron_humedad' => 'nullable|numeric|between:0,100',
            'equipo_humedad' => 'nullable|numeric|between:0,100',
            'error_humedad' => 'nullable|numeric|between:-100,100',
            'observaciones' => 'nullable|string|max:2000',
        ];
    }
}