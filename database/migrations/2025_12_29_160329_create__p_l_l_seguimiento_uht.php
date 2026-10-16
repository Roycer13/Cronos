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
        Schema::create('PLL_seguimiento_uht', function (Blueprint $table) {
            $table->id();


            $table->dateTime('tiempo');
            $table->integer('numero');
            $table->foreignId('origen_id')->constrained('PLL_origenes');
            $table->foreignId('user_id')->constrained('users');

            $table->string('lote')->nullable();

            $table->dateTime('tiempo_siembra')->nullable();
            $table->dateTime('tiempo_dia_2')->nullable();
            $table->dateTime('tiempo_dia_5')->nullable();
            $table->foreignId('usuario_siembra_id')->nullable()->constrained('users');
            $table->foreignId('usuario_dia_2_id')->nullable()->constrained('users');
            $table->foreignId('usuario_dia_5_id')->nullable()->constrained('users');

            $table->integer('aerovios')->nullable();
            $table->integer('mohos')->nullable();

            $table->foreignId('estado_id')->nullable()->constrained('estados');

            $table->string('observacion_siembra')->nullable();
            $table->string('observacion_lectura')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_seguimiento_uht');
    }
};
