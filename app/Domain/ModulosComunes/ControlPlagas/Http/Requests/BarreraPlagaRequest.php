<?php
 
namespace App\Domain\ModulosComunes\ControlPlagas\Http\Requests;
 
use Illuminate\Foundation\Http\FormRequest;

class BarreraPlagaRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'codigo_interno' => 'nullable|string|max:100',
            'man_sector_id'  => 'nullable|exists:man_sectores,id',
            'tipo'           => 'nullable|string|max:100',
            'estado'         => 'nullable|boolean',
        ];
    }
}