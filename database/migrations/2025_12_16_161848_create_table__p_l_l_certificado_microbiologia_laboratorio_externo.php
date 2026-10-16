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
        Schema::create('PLL_certificado_microbiologia_laboratorio_externo', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ubicacion_id')->nullable();
            $table->unsignedBigInteger('detalle_id')->nullable();
            $table->unsignedBigInteger('microbiologico_id')->nullable();

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

            $table->string('nombre');
            $table->string('codigo');
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::table('PLL_certificado_microbiologia_laboratorio_externo', function (Blueprint $table) {
            $table->foreign('ubicacion_id', 'fk_pll_micro_ubic')->references('id')->on('ubicaciones');
            $table->foreign('detalle_id', 'fk_pll_micro_detalle')->references('id')->on('PLL_detalle_solicitud_laboratorio_externo');
            $table->foreign('microbiologico_id', 'fk_pll_micro_microbiologico')->references('id')->on('PLL_microbiologia_laboratorio_externo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_certificado_microbiologia_laboratorio_externo');
    }
};
