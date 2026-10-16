<?php
namespace App\Domain\PlantaLacteos\Http\Requests\Externo;

use Illuminate\Foundation\Http\FormRequest;

class MicrobiologiaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $rules = [
            'observaciones' => 'nullable|string',
        ];

        $microbiologia = $this->route('microbiologia')
            ? \App\Domain\PlantaLacteos\Models\ExtMicrobiologia::find($this->route('microbiologia'))
            : null;

        $tipoMuestra = $microbiologia?->detalle?->tipoMuestra;

        if ($this->has('fecha_siembra')) {
            $rules['fecha_siembra'] = 'required|date';
        }

        if ($this->has('fecha_dia2')) {
            $rules['fecha_dia2'] = 'required|date';
            if ($tipoMuestra?->mesofilos) {
                $rules['aer_mes'] = 'required|integer';
            } else {
                $rules['aer_mes'] = 'nullable|integer';
            }

            if ($tipoMuestra?->coliformes) {
                $rules['col_tot'] = 'required|integer';
            } else {
                $rules['col_tot'] = 'nullable|integer';
            }
        }

        if ($this->has('fecha_dia5')) {
            $rules['fecha_dia5'] = 'required|date';
            if ($tipoMuestra?->mohos) {
                $rules['moh_lev'] = 'required|integer';
            } else {
                $rules['moh_lev'] = 'nullable|integer';
            }

            $rules['aer_mes2'] = 'nullable|integer';
            $rules['col_tot2'] = 'nullable|integer';
            $rules['moh_lev2'] = 'nullable|integer';
        }

        return $rules;
    }
}