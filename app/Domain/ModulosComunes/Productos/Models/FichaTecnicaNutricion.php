<?php

namespace App\Domain\ModulosComunes\Productos\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;

class FichaTecnicaNutricion extends Model
{
    use SoftDeletes;

    protected $table = 'ficha_tecnica_nutricion';

    protected $fillable = [
        'ficha_tecnica_id',
        'energia_kcal',
        'proteinas_g',
        'grasa_total_g',
        'grasas_saturadas_g',
        'grasas_monoinsaturadas_g',
        'grasas_poliinsaturadas_g',
        'grasas_trans_g',
        'carbohidratos_g',
        'azucares_g',
        'azucares_anadidos_g',
        'fibra_alimentaria_g',
        'fibra_soluble_g',
        'fibra_insoluble_g',
        'almidon_g',
        'potasio_mg',
        'calcio_mg',
        'fosforo_mg',
        'magnesio_mg',
        'hierro_mg',
        'zinc_mg',
        'sodio_mg',
        'yodo_mcg',
        'selenio_mcg',
        'cobre_mg',
        'manganeso_mg',
        'cromo_mcg',
        'molibdeno_mcg',
        'vitamina_a_mcg',
        'vitamina_d_mcg',
        'vitamina_c_mg',
        'vitamina_e_mg',
        'vitamina_k_mcg',
        'tiamina_mg',
        'riboflavina_mg',
        'niacina_mg',
        'vitamina_b6_mg',
        'acido_folico_mcg',
        'vitamina_b12_mcg',
        'acido_pantotenico_mg',
        'biotina_mcg',
        'colesterol_mg',
        'agua_g',
        'cenizas_g',
        'alcohol_g',
        'cafeina_mg'
    ];

    protected $casts = [
        'energia_kcal' => 'decimal:2',
        'proteinas_g' => 'decimal:2',
        'grasa_total_g' => 'decimal:2',
        'grasas_saturadas_g' => 'decimal:2',
        'grasas_monoinsaturadas_g' => 'decimal:2',
        'grasas_poliinsaturadas_g' => 'decimal:2',
        'grasas_trans_g' => 'decimal:2',
        'carbohidratos_g' => 'decimal:2',
        'azucares_g' => 'decimal:2',
        'azucares_anadidos_g' => 'decimal:2',
        'fibra_alimentaria_g' => 'decimal:2',
        'fibra_soluble_g' => 'decimal:2',
        'fibra_insoluble_g' => 'decimal:2',
        'almidon_g' => 'decimal:2',
        'potasio_mg' => 'decimal:2',
        'calcio_mg' => 'decimal:2',
        'fosforo_mg' => 'decimal:2',
        'magnesio_mg' => 'decimal:2',
        'hierro_mg' => 'decimal:2',
        'zinc_mg' => 'decimal:2',
        'sodio_mg' => 'decimal:2',
        'yodo_mcg' => 'decimal:2',
        'selenio_mcg' => 'decimal:2',
        'cobre_mg' => 'decimal:2',
        'manganeso_mg' => 'decimal:2',
        'cromo_mcg' => 'decimal:2',
        'molibdeno_mcg' => 'decimal:2',
        'vitamina_a_mcg' => 'decimal:2',
        'vitamina_d_mcg' => 'decimal:2',
        'vitamina_c_mg' => 'decimal:2',
        'vitamina_e_mg' => 'decimal:2',
        'vitamina_k_mcg' => 'decimal:2',
        'tiamina_mg' => 'decimal:2',
        'riboflavina_mg' => 'decimal:2',
        'niacina_mg' => 'decimal:2',
        'vitamina_b6_mg' => 'decimal:2',
        'acido_folico_mcg' => 'decimal:2',
        'vitamina_b12_mcg' => 'decimal:2',
        'acido_pantotenico_mg' => 'decimal:2',
        'biotina_mcg' => 'decimal:2',
        'colesterol_mg' => 'decimal:2',
        'agua_g' => 'decimal:2',
        'cenizas_g' => 'decimal:2',
        'alcohol_g' => 'decimal:2',
        'cafeina_mg' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relaciones
    public function fichaTecnica()
    {
        return $this->belongsTo(FichaTecnica::class, 'ficha_tecnica_id');
    }

    // SCOPES
    public function scopePorFichaTecnica($query, $fichaTecnicaId)
    {
        return $query->where('ficha_tecnica_id', $fichaTecnicaId);
    }

}
