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
        Schema::create('PLL_recepcion_estado_historial', function (Blueprint $table) {
             $table->id();
            $table->unsignedBigInteger('recepcion_materia_prima_id');
            $table->foreign('recepcion_materia_prima_id', 'pll_recep_hist_recep_mp_fk')
                  ->references('id')->on('PLL_recepcion_materia_primas')->onDelete('cascade');

            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id', 'pll_recep_hist_user_fk')
                  ->references('id')->on('users')->onDelete('cascade');

            $table->unsignedBigInteger('estado_id')->nullable();
            $table->foreign('estado_id', 'pll_recep_hist_estado_fk')
                  ->references('id')->on('estados');

            $table->unsignedBigInteger('liberacion_id')->nullable();
            $table->foreign('liberacion_id', 'pll_recep_hist_liberacion_fk')
                  ->references('id')->on('estados');
            $table->text('observacion')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_recepcion_estado_historial');
    }
};
