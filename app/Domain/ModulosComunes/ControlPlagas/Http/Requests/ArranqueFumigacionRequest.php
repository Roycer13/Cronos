<?php

namespace App\Domain\ModulosComunes\ControlPlagas\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ArranqueFumigacionRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'man_sector_id' => 'nullable|exists:man_sectores,id',
            'sin_olor'      => 'nullable|boolean',
            'limpio'        => 'nullable|boolean',
            'observacion'   => 'nullable|string|max:500',
            'correcion'     => 'nullable|string|max:500',
        ];
    }
}