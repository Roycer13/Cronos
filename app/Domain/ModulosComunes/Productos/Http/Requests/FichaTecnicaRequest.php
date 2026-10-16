<?php

namespace App\Domain\ModulosComunes\Productos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FichaTecnicaRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'producto_terminado_id' => 'required|exists:producto_terminados,id|unique:ficha_tecnicas,producto_terminado_id',
            'version' => 'required|string|max:20',
            'version_anterior_id' => 'nullable|exists:ficha_tecnicas,id',
            'usuario_aprobador_id' => 'nullable|exists:users,id',
            'descripcion_producto' => 'nullable|string',
            'presentacion' => 'nullable|string|max:255',
            'ingredientes' => 'nullable|string',
            'aditivos' => 'nullable|string',
            'alergenos' => 'nullable|string',
            'observaciones' => 'nullable|string',
            'aprobado' => 'boolean',
            'sabor' => 'nullable|string|max:20',
            'color' => 'nullable|string|max:20',
            'textura' => 'nullable|string|max:20',
            'olor' => 'nullable|string|max:20',
            'almacenamiento_recomendado' => 'nullable|string',
            'refrigerado' => 'boolean',
            'congelado' => 'boolean',
            'apilamiento_maximo' => 'nullable|string|max:100',
            'vida_util_dias' => 'required|integer|min:1',
            'vida_util_alertas_dias' => 'integer|min:1',
            'imagen_url' => 'nullable|string|max:255',
        ];

        // En update, ignorar el propio registro para unique en producto_terminado_id
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['producto_terminado_id'] = 'required|exists:producto_terminados,id|unique:ficha_tecnicas,producto_terminado_id,' . $this->route('fichaTecnica');
        }

        return $rules;
    }
}