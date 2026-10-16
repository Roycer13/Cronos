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
        Schema::create('PLL_dispositivo_crioscopos', function (Blueprint $table) {
            $table->id();
            $table->dateTime('fecha_hora')->nullable();
            $table->foreignId('user_id')->nullable()->constrained();
            $table->boolean('punto_ajuste_a')->default(true);
            $table->boolean('punto_ajuste_b')->default(true);
            $table->foreignId('dispositivos_medicion_id')->nullable()->constrained('PLL_dispositivos_mediciones');
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
        Schema::dropIfExists('dispositivo_crioscopos');
    }
};
