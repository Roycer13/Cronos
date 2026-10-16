<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('PLL_analisis_materia_primas', function (Blueprint $table) {
            $table->id();
            $table->integer('numero_muestra')->nullable();
            $table->foreignId('recepcion_materia_prima_id')
                  ->constrained('PLL_recepcion_materia_primas');
            $table->dateTime('tiempo_analisis')->nullable();
            $table->decimal('temperatura', 10, 5)->nullable();
            $table->decimal('ph', 10, 5)->nullable();
            $table->decimal('solidos', 10, 5)->nullable();
            $table->decimal('viscosidad', 10, 5)->nullable();
            $table->decimal('densidad', 10, 5)->nullable();
            $table->decimal('acidez', 10, 5)->nullable();

            $table->string('lote')->nullable();

            $table->boolean('color')->nullable();
            $table->boolean('olor')->nullable();
            $table->boolean('sabor')->nullable();
            $table->boolean('aspecto')->nullable();
            $table->boolean('textura')->nullable();
            $table->boolean('sin_material_extraño')->nullable();

            $table->boolean('conformidad')->nullable();
            $table->foreignId('user_id')
            ->constrained('users');

            //para bobinas
            $table->integer('numero_bobina')->nullable();
            $table->decimal('peso_neto', 10, 5)->nullable();
            $table->boolean('adherencia')->nullable();
            $table->boolean('frotacion')->nullable();
            $table->boolean('texto')->nullable();
            $table->boolean('sentido_embobinado')->nullable();

            $table->decimal('largo_envase', 10, 5)->nullable();
            $table->decimal('ancho_envase', 10, 5)->nullable();
            $table->decimal('largo_taca', 10, 5)->nullable();
            $table->decimal('ancho_taca', 10, 5)->nullable();
            $table->decimal('distancia_taca_borde', 10, 5)->nullable();
            $table->decimal('largo_superior', 10, 5)->nullable();
            $table->decimal('largo_inferior', 10, 5)->nullable();
            $table->decimal('ancho', 10, 5)->nullable();
            $table->decimal('densidad_lineal', 10, 5)->nullable();

            //empaque secundaria

            $table->integer('numero_paquete')->nullable();
            $table->decimal('peso_unitario', 10, 5)->nullable();
            $table->decimal('largo_total', 10, 5)->nullable();
            $table->decimal('ancho_total', 10, 5)->nullable();
            $table->decimal('ancho_plegado', 10, 5)->nullable();
            $table->decimal('micronaje', 10, 5)->nullable();

            $table->boolean('resistencia_envase')->nullable();
            $table->boolean('transparencia')->nullable();
            $table->boolean('calidad_impresion')->nullable();

            //envases y accesorios
            $table->integer('numero_embalaje')->nullable();
            $table->decimal('espesor', 10, 5)->nullable();
            $table->decimal('altura_total', 10, 5)->nullable();
            $table->decimal('diametro_medio', 10, 5)->nullable();
            $table->decimal('altura_etiqueta', 10, 5)->nullable();
            $table->decimal('perimetro_etiqueta', 10, 5)->nullable();
            $table->decimal('diametro_cuello', 10, 5)->nullable();
            $table->decimal('altura_plegada', 10, 5)->nullable();
            $table->decimal('diametro_externo_base', 10, 5)->nullable();
            $table->decimal('diametro_interno', 10, 5)->nullable();

            $table->boolean('acabado_fino')->nullable();
            $table->boolean('sin_deformidad')->nullable();
            $table->boolean('resistencia_base')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_analisis_materia_primas');
    }
};
