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
        Schema::create('PLL_microbiologia_laboratorio_externo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('detalle_id')->nullable()->constrained('PLL_detalle_solicitud_laboratorio_externo');

            $table->foreignId('estado_id')->nullable()->constrained('estados');
            $table->dateTime('tiempo_siembra')->nullable();
            $table->dateTime('tiempo_dia_2')->nullable();
            $table->dateTime('tiempo_dia_5')->nullable();
            $table->foreignId('usuario_siembra_id')->nullable()->constrained('users');
            $table->foreignId('usuario_dia_2_id')->nullable()->constrained('users');
            $table->foreignId('usuario_dia_5_id')->nullable()->constrained('users');


            $table->integer('aerovios')->nullable();
            $table->integer('aerovios_2')->nullable();
            $table->integer('coliformes')->nullable();
            $table->integer('coliformes_2')->nullable();
            $table->integer('mohos')->nullable();
            $table->integer('mohos_2')->nullable();

             $table->foreignId('user_id')->nullable()->constrained('users');


            $table->string('observacion_siembra')->nullable();
            $table->string('observacion_lectura')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_microbiologia_laboratorio_externo');
    }
};
