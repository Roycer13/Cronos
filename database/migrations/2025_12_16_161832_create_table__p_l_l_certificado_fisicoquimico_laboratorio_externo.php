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
        Schema::create('PLL_certificado_fisicoquimico_laboratorio_externo', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('ubicacion_id')->nullable();
            $table->unsignedBigInteger('detalle_id')->nullable();
            $table->boolean('temperatura');
            $table->boolean('humedad');
            $table->boolean('actividad_agua');
            $table->boolean('ph');
            $table->boolean('dureza');
            $table->boolean('cloruros');
            $table->unsignedBigInteger('fisicoquimico_id')->nullable();

            $table->string('codigo');
            $table->string('nombre');
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::table('PLL_certificado_fisicoquimico_laboratorio_externo', function (Blueprint $table) {
            $table->foreign('ubicacion_id', 'fk_pll_cert_ubicacion')->references('id')->on('ubicaciones');
            $table->foreign('detalle_id', 'fk_pll_cert_detalle')->references('id')->on('PLL_detalle_solicitud_laboratorio_externo');
            $table->foreign('fisicoquimico_id', 'fk_pll_cert_fisicoquimico')->references('id')->on('PLL_fisicoquimico_laboratorio_externo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_certificado_fisicoquimico_laboratorio_externo');
    }
};
