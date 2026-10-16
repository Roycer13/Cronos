<?php

namespace App\Domain\Mantenimiento\Http\Requests;

use App\Domain\Mantenimiento\Models\DetalleAlmacenRepuestos;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class AlmacenMovimientoRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'ubicacion_id' => 'required|exists:ubicaciones,id',
            'tipo' => 'required|in:0,1',
            'tipo_descripcion' => 'required|in:OT salida,OT devolución,Compra,Baja,Ajuste',
            'estado_id' => 'nullable|exists:estados,id',
            'observacion' => 'nullable|string|max:500',
            'detalles' => 'required|array|min:1',
            'detalles.*.repuesto_id' => 'required|exists:MAN_repuestos,id',
            'detalles.*.cantidad' => 'required|numeric|min:0.01',
        ];

        if (in_array($this->tipo_descripcion, ['OT salida', 'OT devolución'])) {
            $rules['ot_id'] = 'required|exists:MAN_ots,id';
        }

        if ($this->tipo_descripcion === 'Compra') {
            $rules['proveedor_id'] = 'required|exists:MAN_proveedores,id';
        }

        return $rules;
    }

    public function withValidator(Validator $validator)
    {
        $validator->after(function ($validator) {
            // Validar stock solo para movimientos de salida (tipo 0)
            if ($this->tipo == 0) {
                foreach ($this->detalles as $index => $detalle) {
                    $stockDisponible = $this->getStockDisponible($detalle['repuesto_id'], $this->ubicacion_id);
                    if ($detalle['cantidad'] > $stockDisponible) {
                        $validator->errors()->add(
                            "detalles.{$index}.cantidad",
                            "La cantidad solicitada ({$detalle['cantidad']}) excede el stock disponible ({$stockDisponible}) en esta ubicación."
                        );
                    }
                }
            }
        });
    }

    private function getStockDisponible($repuestoId, $ubicacionId)
    {
        $ultimoDetalle = DetalleAlmacenRepuestos::whereHas('almacenRepuesto', function ($q) use ($ubicacionId) {
            $q->where('ubicacion_id', $ubicacionId)
              ->whereHas('estado', function ($eq) {
                  $eq->where('nombre', 'Entregado');
              });
        })
            ->where('repuesto_id', $repuestoId)
            ->latest('id')
            ->first();

        return $ultimoDetalle ? $ultimoDetalle->saldo : 0;
    }

    public function messages()
    {
        return [
            'ubicacion_id.required' => 'La ubicación es obligatoria.',
            'tipo.required' => 'El tipo de movimiento es obligatorio.',
            'tipo_descripcion.required' => 'La descripción del tipo es obligatoria.',
            'tipo_descripcion.in' => 'Tipo de movimiento no válido.',
            'ot_id.required' => 'Debe seleccionar una Orden de Trabajo.',
            'proveedor_id.required' => 'Debe seleccionar un proveedor.',
            'detalles.required' => 'Debe agregar al menos un detalle.',
            'detalles.*.repuesto_id.required' => 'Seleccione un repuesto en cada fila.',
            'detalles.*.cantidad.required' => 'La cantidad es obligatoria.',
            'detalles.*.cantidad.min' => 'La cantidad debe ser mayor a cero.',
        ];
    }
}
