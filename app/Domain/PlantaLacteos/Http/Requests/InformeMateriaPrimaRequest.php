<?php

namespace App\Domain\PlantaLacteos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InformeMateriaPrimaRequest extends FormRequest
{
    // El control de acceso lo hace el middleware AdminOrPermission de la ruta.
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
            'item_materia_prima_id' => 'nullable|integer|exists:PLL_item_materia_primas,id',
            'proveedor_materia_prima_id' => 'nullable|integer|exists:PLL_proveedor_materia_primas,id',
            'almacen_materia_prima_id' => 'nullable|integer|exists:PLL_almacen_materia_prima,id',
            'estado_id' => 'nullable|integer|exists:estados,id',
            'liberacion_id' => 'nullable|integer|exists:estados,id',
            'per_page' => 'nullable|integer|min:5|max:200',
        ];
    }
}
