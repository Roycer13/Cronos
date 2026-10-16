<?php
namespace App\Domain\ModulosComunes\Old\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOldItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'nullable|string|max:255',
            'old_subarea_id' => 'nullable|exists:old_subareas,id',

            // 👇 importante
            '*' => 'nullable'
        ];
    }
}