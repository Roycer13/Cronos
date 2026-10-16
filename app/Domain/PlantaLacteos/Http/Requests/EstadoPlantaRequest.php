<?php

namespace App\Domain\PlantaLacteos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EstadoPlantaRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'origen_id' => 'required|exists:PLL_origenes,id',
            'proceso_id' => 'required|exists:estados,id',
            'etapa_id' => 'nullable|exists:estados,id',
            'observaciones' => 'nullable|string|max:500',
            'detalles' => 'array|required_if:proceso_id,' . $this->getProduccionId(),
            'detalles.*.orp_id' => 'required|exists:orps,id',
            'detalles.*.preparacion' => 'required|string|max:50',
            'detalles.*.cantidad' => 'nullable|numeric|min:0',

            // Campos para pasteurización
            'pasteurizador_id' => 'nullable|exists:PLL_origenes,id',
            'origen_id_pasteurizacion' => 'nullable|exists:PLL_origenes,id',
        ];
    }

    private function getProduccionId()
    {
        // Buscar el ID del estado "Produccion" en la base de datos
        return \App\Domain\Sistema\Configuracion\Models\Estado::where('nombre', 'Produccion')
            ->value('id') ?? 7;
    }

    public function messages()
    {
        return [
            'detalles.required_if' => 'Los detalles son requeridos cuando el estado es Producción.',
            'detalles.*.orp_id.required' => 'El ORP en el detalle es requerido.',
            'detalles.*.preparacion.required' => 'La preparación en el detalle es requerida.',
            'detalles.*.cantidad.required' => 'La cantidad en el detalle es requerida.',
        ];
    }
}
