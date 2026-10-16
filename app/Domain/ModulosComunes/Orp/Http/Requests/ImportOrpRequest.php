<?php

namespace App\Domain\ModulosComunes\Orp\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportOrpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'archivo' => 'required|file|mimes:csv,txt,xlsx,xls|max:10240', // 10MB máximo
        ];
    }

    public function messages(): array
    {
        return [
            'archivo.required' => 'Por favor seleccione un archivo',
            'archivo.mimes' => 'El archivo debe ser CSV, TXT, XLSX o XLS',
            'archivo.max' => 'El archivo no debe superar los 10MB',
        ];
    }
}
