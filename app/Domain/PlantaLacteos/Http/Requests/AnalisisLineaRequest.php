<?php

namespace App\Domain\PlantaLacteos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnalisisLineaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'temperatura' => 'nullable|numeric|between:0,200',
            'ph' => 'nullable|numeric|between:0,14',
            'acidez' => 'nullable|numeric|between:0,10',
            'brix' => 'nullable|numeric|between:0,100',
            'viscosidad' => 'nullable|numeric|between:0,1000',
            'densidad' => 'nullable|numeric|between:0,10',
            'color' => 'nullable|boolean',
            'olor' => 'nullable|boolean',
            'sabor' => 'nullable|boolean',
            'aspecto' => 'nullable|string|max:255',
            'peso' => 'nullable|numeric|between:0,10000',
            'volumen' => 'nullable|numeric|between:0,10000',
            'observaciones' => 'nullable|string',
            'tempUHT' => 'nullable|numeric|between:0,200',
        ];
    }

    public function messages(): array
    {
        return [
            'temperatura.between' => 'La temperatura debe estar entre 0 y 200.',
            'ph.between' => 'El pH debe estar entre 0 y 14.',
            'acidez.between' => 'La acidez debe estar entre 0 y 10.',
            'brix.between' => 'Los grados Brix deben estar entre 0 y 100.',
            'viscosidad.between' => 'La viscosidad debe estar entre 0 y 1000.',
            'densidad.between' => 'La densidad debe estar entre 0 y 10.',
            'peso.between' => 'El peso debe estar entre 0 y 10000.',
            'volumen.between' => 'El volumen debe estar entre 0 y 10000.',
            'tempUHT.between' => 'La temperatura UHT debe estar entre 0 y 200.',
        ];
    }
}