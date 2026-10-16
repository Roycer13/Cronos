<?php

namespace App\Domain\ModulosComunes\Productos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductoTerminadoRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'codigo_sap' => 'required|string|max:50|unique:producto_terminados,codigo_sap',
            'codigo_interno' => 'string|max:50',
            'nombre_sap' => 'nullable|string|max:100',
            'nombre_comercial' => 'nullable|string|max:150',
            'descripcion_comercial' => 'nullable|string|max:255',
            'descripcion_tecnica' => 'nullable|string',
            'ubicacion_id' => 'required|exists:ubicaciones,id',
            'categoria_producto_id' => 'required|exists:categoria_productos,id',
            'subcategoria_producto_id' => 'required|exists:subcategoria_productos,id',
            'linea_id' => 'nullable|exists:lineas,id',
            'destino_id' => 'nullable|exists:destinos,id',
            'cantidad_neto' => 'nullable|numeric|min:0',
            'unidades_id' => 'nullable|exists:unidades,id',
            'cantidad_bruto' => 'nullable|numeric|min:0',
            'estado_id' => 'required|exists:estados,id',
        ];

        // En el update, ignorar el propio registro para unique
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['codigo_sap'] = 'required|string|max:50|unique:producto_terminados,codigo_sap,' . $this->route('productoTerminado');
            $rules['codigo_interno'] = 'required|string|max:50|unique:producto_terminados,codigo_interno,' . $this->route('productoTerminado');
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'codigo_sap.unique' => 'El código SAP ya está en uso.',
            'codigo_interno.unique' => 'El código interno ya está en uso.',
            'ubicacion_id.required' => 'La ubicación es requerida.',
            'categoria_producto_id.required' => 'La categoría es requerida.',
            'subcategoria_producto_id.required' => 'La subcategoría es requerida.',
        ];
    }
}