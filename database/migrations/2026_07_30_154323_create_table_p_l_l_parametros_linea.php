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
        Schema::create('PLL_parametros_linea', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etapa_id')->nullable()->constrained('estados')->nullOnDelete();
            $table->foreignId('producto_terminado_id')->constrained('producto_terminados');
            $table->decimal('temperatura_min', 10, 5);
            $table->decimal('temperatura_max', 10, 5);
            $table->decimal('ph_min', 10, 5);
            $table->decimal('ph_max', 10, 5);
            $table->decimal('acidez_min', 10, 5);
            $table->decimal('acidez_max', 10, 5);
            $table->decimal('brix_min', 10, 5);
            $table->decimal('brix_max', 10, 5);
            $table->decimal('viscosidad_min', 10, 5);
            $table->decimal('viscosidad_max', 10, 5);
            $table->decimal('densidad_min', 10, 5);
            $table->decimal('densidad_max', 10, 5);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_parametros_linea');
    }
};
