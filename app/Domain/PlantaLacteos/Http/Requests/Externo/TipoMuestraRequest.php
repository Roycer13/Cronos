<?php
namespace App\Domain\PlantaLacteos\Http\Requests\Externo;

use Illuminate\Foundation\Http\FormRequest;

class TipoMuestraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Ajusta con permisos si es necesario
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:255',
            'norma_referencial' => 'required|string|max:255',
            
            'unidad' => 'nullable|string|max:255',
            'aclaracion_unidad' => 'nullable|string|max:255',
            'min_mes' => 'nullable|string|max:255',
            'min_mes_exp' => 'nullable|integer',
            'max_mes' => 'nullable|string|max:255',
            'max_mes_exp' => 'nullable|integer',
            'min_colTot' => 'nullable|string|max:255',
            'min_colTot_exp' => 'nullable|integer',
            'max_colTot' => 'nullable|string|max:255',
            'max_colTot_exp' => 'nullable|integer',
            'min_mohLev' => 'nullable|string|max:255',
            'min_mohLev_exp' => 'nullable|integer',
            'max_mohLev' => 'nullable|string|max:255',
            'max_mohLev_exp' => 'nullable|integer',
            'mesofilos' => 'nullable|boolean',
            'coliformes' => 'nullable|boolean',
            'mohos' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del tipo de muestra es obligatorio.',
            'norma_referencial.required' => 'La norma referencial es obligatoria.',
            
        ];
    }
}