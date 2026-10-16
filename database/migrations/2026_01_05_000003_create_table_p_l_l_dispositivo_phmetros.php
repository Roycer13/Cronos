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
        Schema::create('PLL_dispositivo_phmetros', function (Blueprint $table) {
            $table->id();
            $table->dateTime('fecha_hora')->nullable();
            $table->decimal('verificacion_temperatura1', 5, 2)->nullable();
            $table->decimal('verificacion_temperatura2', 5, 2)->nullable();
            $table->decimal('verificacion_temperatura3', 5, 2)->nullable();
            $table->decimal('verificacion_4', 5, 2)->nullable();
            $table->decimal('verificacion_7', 5, 2)->nullable();
            $table->decimal('verificacion_10', 5, 2)->nullable();
            $table->boolean('requiere_ajuste')->nullable();
            $table->decimal('verificacion_ajuste_temperatura1', 5, 2)->nullable();
            $table->decimal('verificacion_ajuste_temperatura2', 5, 2)->nullable();
            $table->decimal('verificacion_ajuste_temperatura3', 5, 2)->nullable();
            $table->decimal('verificacion_ajuste_4', 5, 2)->nullable();
            $table->decimal('verificacion_ajuste_7', 5, 2)->nullable();
            $table->decimal('verificacion_ajuste_10', 5, 2)->nullable();
            $table->foreignId('dispositivos_medicion_id')->nullable()->constrained('PLL_dispositivos_mediciones');
            $table->foreignId('user_id')->nullable()->constrained();
            $table->foreignId('estado_id')->nullable()->constrained('estados');
            $table->string('observaciones')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dispositivo_phmetros');
    }
};
