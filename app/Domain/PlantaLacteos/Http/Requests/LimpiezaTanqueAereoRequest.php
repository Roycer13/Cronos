<?php
// app/Domain/PlantaLacteos/Http/Requests/LimpiezaTanqueAereoRequest.php

namespace App\Domain\PlantaLacteos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LimpiezaTanqueAereoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {


        return [
            'tiempo' => 'required|date',
            'tanque' => 'nullable|string|max:255',
            'user_id' => 'required|exists:users,id',
            'l_tapa' => 'boolean',
            'd_tapa' => 'boolean',
            'l_paredes' => 'boolean',
            'd_paredes' => 'boolean',
            'l_piso' => 'boolean',
            'd_piso' => 'boolean',
            'l_conexiones' => 'boolean',
            'd_conexiones' => 'boolean',
            'correccion' => 'nullable|string',
            'observacion' => 'nullable|string',
        ];
    }

    public function prepareForValidation()
{
    // Convertir user_id a entero si viene como string
    if ($this->has('user_id')) {
        $this->merge([
            'user_id' => (int) $this->user_id,
            'correccion' => $this->correccion === '' ? null : $this->correccion,
            'observacion' => $this->observacion === '' ? null : $this->observacion,
            'tanque' => $this->tanque === '' ? null : $this->tanque,
        ]);
    }
}
}
