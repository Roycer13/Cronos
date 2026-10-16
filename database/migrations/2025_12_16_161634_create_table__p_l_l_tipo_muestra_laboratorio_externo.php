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
        Schema::create('PLL_tipo_muestra_laboratorio_externo', function (Blueprint $table) {
            $table->id();

            $table->string('nombre');
            $table->string('norma_microbiologico')->nullable();
            $table->string('norma_fisicoquimico')->nullable();
            $table->integer('min_mesofilos')->nullable();
            $table->integer('max_mesofilos')->nullable();
            $table->integer('min_coliformes')->nullable();
            $table->integer('max_coliformes')->nullable();
            $table->integer('max_mohos')->nullable();
            $table->integer('min_mohos')->nullable();
            $table->boolean('mesofilos');
            $table->boolean('coliformes');
            $table->boolean('mohos');
            $table->boolean('mesofilos2');
            $table->boolean('coliformes2');
            $table->boolean('mohos2');
            $table->boolean('temperatura');
            $table->boolean('humedad');
            $table->boolean('actividad_agua');
            $table->boolean('ph');
            $table->boolean('dureza');
            $table->boolean('cloruros');
            $table->foreignId('unidad_id')->nullable()->constrained('unidades');
            $table->foreignId('ubicacion_id')->nullable()->constrained('ubicaciones');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_tipo_muestra_laboratorio_externo');
    }
};
