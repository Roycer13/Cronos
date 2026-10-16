<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::create('ficha_tecnica_nutricion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ficha_tecnica_id')->constrained('ficha_tecnicas'); // ✅ Corregido

            // Información energética
            $table->decimal('energia_kcal', 8, 2)->nullable();

            // Macronutrientes
            $table->decimal('proteinas_g', 8, 2)->nullable();
            $table->decimal('grasa_total_g', 8, 2)->nullable();
            $table->decimal('grasas_saturadas_g', 8, 2)->nullable();
            $table->decimal('grasas_monoinsaturadas_g', 8, 2)->nullable();
            $table->decimal('grasas_poliinsaturadas_g', 8, 2)->nullable();
            $table->decimal('grasas_trans_g', 8, 2)->nullable();
            $table->decimal('carbohidratos_g', 8, 2)->nullable();
            $table->decimal('azucares_g', 8, 2)->nullable();
            $table->decimal('azucares_anadidos_g', 8, 2)->nullable();
            $table->decimal('fibra_alimentaria_g', 8, 2)->nullable();
            $table->decimal('fibra_soluble_g', 8, 2)->nullable();
            $table->decimal('fibra_insoluble_g', 8, 2)->nullable();
            $table->decimal('almidon_g', 8, 2)->nullable();

            // Minerales
            $table->decimal('potasio_mg', 8, 2)->nullable();
            $table->decimal('calcio_mg', 8, 2)->nullable();
            $table->decimal('fosforo_mg', 8, 2)->nullable();
            $table->decimal('magnesio_mg', 8, 2)->nullable();
            $table->decimal('hierro_mg', 8, 2)->nullable();
            $table->decimal('zinc_mg', 8, 2)->nullable();
            $table->decimal('sodio_mg', 8, 2)->nullable();
            $table->decimal('yodo_mcg', 8, 2)->nullable();
            $table->decimal('selenio_mcg', 8, 2)->nullable();
            $table->decimal('cobre_mg', 8, 2)->nullable();
            $table->decimal('manganeso_mg', 8, 2)->nullable();
            $table->decimal('cromo_mcg', 8, 2)->nullable();
            $table->decimal('molibdeno_mcg', 8, 2)->nullable();

            // Vitaminas
            $table->decimal('vitamina_a_mcg', 8, 2)->nullable();
            $table->decimal('vitamina_d_mcg', 8, 2)->nullable();
            $table->decimal('vitamina_c_mg', 8, 2)->nullable();
            $table->decimal('vitamina_e_mg', 8, 2)->nullable();
            $table->decimal('vitamina_k_mcg', 8, 2)->nullable();
            $table->decimal('tiamina_mg', 8, 2)->nullable();
            $table->decimal('riboflavina_mg', 8, 2)->nullable();
            $table->decimal('niacina_mg', 8, 2)->nullable();
            $table->decimal('vitamina_b6_mg', 8, 2)->nullable();
            $table->decimal('acido_folico_mcg', 8, 2)->nullable();
            $table->decimal('vitamina_b12_mcg', 8, 2)->nullable();
            $table->decimal('acido_pantotenico_mg', 8, 2)->nullable();
            $table->decimal('biotina_mcg', 8, 2)->nullable();

            // Otros componentes
            $table->decimal('colesterol_mg', 8, 2)->nullable();
            $table->decimal('agua_g', 8, 2)->nullable();
            $table->decimal('cenizas_g', 8, 2)->nullable();
            $table->decimal('alcohol_g', 8, 2)->nullable();
            $table->decimal('cafeina_mg', 8, 2)->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('ficha_tecnica_nutricion');
    }
};
