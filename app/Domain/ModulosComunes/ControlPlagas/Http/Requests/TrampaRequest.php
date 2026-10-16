<?php

namespace App\Domain\ModulosComunes\ControlPlagas\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TrampaRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'man_sector_id' => 'nullable|exists:man_sectores,id',
            'codigo'        => 'nullable|string|max:100',
            'estado'        => 'nullable|boolean',
            'tipo'          => 'nullable|string|max:100',
        ];
    }
}