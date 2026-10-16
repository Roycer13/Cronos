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
        Schema::create('PLL_dispositivo_temperaturas', function (Blueprint $table) {
            $table->id();
            $table->dateTime('fecha_hora')->nullable();
            $table->decimal('patron_1', 5, 2)->nullable();
            $table->decimal('inst_1', 5, 2)->nullable();
            $table->decimal('error_1', 5, 2)->nullable();
            $table->decimal('patron_2', 5, 2)->nullable();
            $table->decimal('inst_2', 5, 2)->nullable();
            $table->decimal('error_2', 5, 2)->nullable();
            $table->decimal('patron_3', 5, 2)->nullable();
            $table->decimal('inst_3', 5, 2)->nullable();
            $table->decimal('error_3', 5, 2)->nullable();
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
        Schema::dropIfExists('dispositivo_temperaturas');
    }
};
