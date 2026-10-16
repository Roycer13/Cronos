<?php

namespace App\Domain\PlantaLacteos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ArranqueLineaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tiempo' => ['required', 'date_format:Y-m-d'],
            'observacion' => ['nullable', 'string', 'max:1000'],
            'detalles' => ['required', 'array'],
            'detalles.*.origen_id' => ['required', 'integer', 'exists:PLL_origenes,id'],
            'detalles.*.tiempo' => ['nullable', 'date_format:Y-m-d\\TH:i'],
            'detalles.*.h202' => ['nullable', 'boolean'],
            'orps' => ['nullable', 'array'],
            'orps.*' => ['integer', 'distinct', 'exists:orps,id'],
            'ops' => ['nullable', 'array'],
            'ops.*.numero' => ['nullable', 'string', 'max:255'],
            'ops.*.tipo' => ['nullable', 'string', 'max:255'],
        ];
    }
}
