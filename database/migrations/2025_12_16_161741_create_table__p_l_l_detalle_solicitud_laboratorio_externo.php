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
        Schema::create('PLL_detalle_solicitud_laboratorio_externo', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('solicitud_id')->nullable();
            $table->foreign('solicitud_id', 'pll_det_solic_solic_fk')
                ->references('id')->on('PLL_solicitud_laboratorio_externo');

            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id', 'pll_det_solic_user_fk')
                ->references('id')->on('users');

            $table->unsignedBigInteger('item_materia_prima_id')->nullable();
            $table->foreign('item_materia_prima_id', 'pll_det_solic_item_fk')
                ->references('id')->on('PLL_item_materia_primas');

            $table->unsignedBigInteger('producto_terminado_id')->nullable();
            $table->foreign('producto_terminado_id', 'pll_det_solic_prod_fk')
                ->references('id')->on('producto_terminados');
            $table->string('otros')->nullable();
            $table->string('codigo')->nullable();
            $table->string('lote')->nullable();
            $table->string('tipo')->nullable();


            $table->date('fecha_elaboracion')->nullable();
            $table->date('fecha_vencimiento')->nullable();
            $table->date('fecha_muestreo')->nullable();
            $table->dateTime('tiempo_autorizado')->nullable();
            $table->string('observacion')->nullable();
            $table->unsignedBigInteger('autorizante_id')->nullable();
            $table->foreign('autorizante_id', 'pll_det_solic_autor_fk')
                ->references('id')->on('users');

            $table->unsignedBigInteger('estado_id')->nullable();
            $table->foreign('estado_id', 'pll_det_solic_estado_fk')
                ->references('id')->on('estados');

            $table->unsignedBigInteger('tipo_muestra_id')->nullable();
            $table->foreign('tipo_muestra_id', 'pll_det_solic_tipo_fk')
                ->references('id')->on('PLL_tipo_muestra_laboratorio_externo');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_detalle_solicitud_laboratorio_externo');
    }
};
