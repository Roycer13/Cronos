<?php

namespace App\Domain\ModulosComunes\Productos\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FichaTecnicaNutricionRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'ficha_tecnica_id' => 'required|exists:ficha_tecnicas,id',
            'energia_kcal' => 'nullable|numeric|min:0',
            'proteinas_g' => 'nullable|numeric|min:0',
            'grasa_total_g' => 'nullable|numeric|min:0',
            'grasas_saturadas_g' => 'nullable|numeric|min:0',
            'grasas_monoinsaturadas_g' => 'nullable|numeric|min:0',
            'grasas_poliinsaturadas_g' => 'nullable|numeric|min:0',
            'grasas_trans_g' => 'nullable|numeric|min:0',
            'carbohidratos_g' => 'nullable|numeric|min:0',
            'azucares_g' => 'nullable|numeric|min:0',
            'azucares_anadidos_g' => 'nullable|numeric|min:0',
            'fibra_alimentaria_g' => 'nullable|numeric|min:0',
            'fibra_soluble_g' => 'nullable|numeric|min:0',
            'fibra_insoluble_g' => 'nullable|numeric|min:0',
            'almidon_g' => 'nullable|numeric|min:0',
            'potasio_mg' => 'nullable|numeric|min:0',
            'calcio_mg' => 'nullable|numeric|min:0',
            'fosforo_mg' => 'nullable|numeric|min:0',
            'magnesio_mg' => 'nullable|numeric|min:0',
            'hierro_mg' => 'nullable|numeric|min:0',
            'zinc_mg' => 'nullable|numeric|min:0',
            'sodio_mg' => 'nullable|numeric|min:0',
            'yodo_mcg' => 'nullable|numeric|min:0',
            'selenio_mcg' => 'nullable|numeric|min:0',
            'cobre_mg' => 'nullable|numeric|min:0',
            'manganeso_mg' => 'nullable|numeric|min:0',
            'cromo_mcg' => 'nullable|numeric|min:0',
            'molibdeno_mcg' => 'nullable|numeric|min:0',
            'vitamina_a_mcg' => 'nullable|numeric|min:0',
            'vitamina_d_mcg' => 'nullable|numeric|min:0',
            'vitamina_c_mg' => 'nullable|numeric|min:0',
            'vitamina_e_mg' => 'nullable|numeric|min:0',
            'vitamina_k_mcg' => 'nullable|numeric|min:0',
            'tiamina_mg' => 'nullable|numeric|min:0',
            'riboflavina_mg' => 'nullable|numeric|min:0',
            'niacina_mg' => 'nullable|numeric|min:0',
            'vitamina_b6_mg' => 'nullable|numeric|min:0',
            'acido_folico_mcg' => 'nullable|numeric|min:0',
            'vitamina_b12_mcg' => 'nullable|numeric|min:0',
            'acido_pantotenico_mg' => 'nullable|numeric|min:0',
            'biotina_mcg' => 'nullable|numeric|min:0',
            'colesterol_mg' => 'nullable|numeric|min:0',
            'agua_g' => 'nullable|numeric|min:0',
            'cenizas_g' => 'nullable|numeric|min:0',
            'alcohol_g' => 'nullable|numeric|min:0',
            'cafeina_mg' => 'nullable|numeric|min:0',
        ];
    }
}