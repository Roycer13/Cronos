<?php

namespace App\Domain\PlantaLacteos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnalisisLecheRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Reglas base que aplican siempre
        $rules = [
            'estado_id' => ['sometimes', 'required', 'exists:estados,id'],
        ];

        // Reglas para la etapa FQ (Físico-Químico)
        if ($this->isMethod('PUT') && $this->routeIs('analisis-leche.update-fq')) {
            $rules = array_merge($rules, [
                'temperatura' => ['nullable', 'numeric', 'min:-50', 'max:100'],
                'ph' => ['nullable', 'numeric', 'min:0', 'max:14'],
                'acidez' => ['nullable', 'numeric', 'min:0', 'max:100'],
                'brix' => ['nullable', 'numeric', 'min:0', 'max:100'],
                'densidad' => ['nullable', 'numeric', 'min:0', 'max:10'],
                'prueba_alcohol' => ['nullable', 'boolean'],
                'contenido_graso' => ['nullable', 'numeric', 'min:0', 'max:100'],
                'temperatura_congelacion' => ['nullable', 'numeric', 'min:-10', 'max:10'],
                'porcentaje_agua' => ['nullable', 'numeric', 'min:0', 'max:100'],
                'observaciones_fq' => ['nullable', 'string', 'max:50'],
            ]);
        }

        // Reglas para la etapa de Siembra
        if ($this->isMethod('PUT') && $this->routeIs('analisis-leche.update-siembra')) {
            $rules = array_merge($rules, [
                'tiempo_siembra' => ['required', 'date'],
                'observaciones_siembra' => ['nullable', 'string', 'max:50'],
            ]);
        }

        // Reglas para la etapa de Lectura
        if ($this->isMethod('PUT') && $this->routeIs('analisis-leche.update-lectura')) {
            $rules = array_merge($rules, [
                'tiempo_lectura' => ['required', 'date'],
                'recuento' => ['nullable', 'integer', 'min:0'],
                'antibioticos' => ['nullable'],
                'observaciones_lectura' => ['nullable', 'string', 'max:50'],
            ]);
        }

        return $rules;
    }

    public function prepareForValidation()
    {
        // Convertir campos booleanos
        if ($this->has('prueba_alcohol')) {
            $this->merge([
                'prueba_alcohol' => filter_var($this->prueba_alcohol, FILTER_VALIDATE_BOOLEAN),
            ]);
        }

        // Convertir campos vacíos a null para todos los campos opcionales
        $nullableFields = [
            'temperatura', 'ph', 'acidez', 'brix', 'densidad', 'contenido_graso',
            'temperatura_congelacion', 'porcentaje_agua', 'observaciones_fq',
            'observaciones_siembra', 'observaciones_lectura', 'recuento', 'antibioticos'
        ];

        foreach ($nullableFields as $field) {
            if ($this->has($field) && $this->$field === '') {
                $this->merge([$field => null]);
            }
        }
    }

    public function messages(): array
    {
        return [
            'user_fq_id.required' => 'El analista FQ es requerido para la etapa físico-química.',
            'user_mb_siembra_id.required' => 'El analista de siembra es requerido para la etapa de siembra.',
            'user_mb_lectura_id.required' => 'El analista de lectura es requerido para la etapa de lectura.',
            'tiempo_fq.required' => 'La fecha y hora del análisis FQ son requeridas.',
            'tiempo_siembra.required' => 'La fecha y hora de siembra son requeridas.',
            'tiempo_lectura.required' => 'La fecha y hora de lectura son requeridas.',
        ];
    }
}