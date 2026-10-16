<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('PLL_parametros_linea', function (Blueprint $table) {
            $table->foreignId('etapa_id')->nullable()->change();
            $table->foreignId('producto_terminado_id')->nullable()->change();
            $table->decimal('temperatura_min', 10, 5)->nullable()->change();
            $table->decimal('temperatura_max', 10, 5)->nullable()->change();
            $table->decimal('ph_min', 10, 5)->nullable()->change();
            $table->decimal('ph_max', 10, 5)->nullable()->change();
            $table->decimal('acidez_min', 10, 5)->nullable()->change();
            $table->decimal('acidez_max', 10, 5)->nullable()->change();
            $table->decimal('brix_min', 10, 5)->nullable()->change();
            $table->decimal('brix_max', 10, 5)->nullable()->change();
            $table->decimal('viscosidad_min', 10, 5)->nullable()->change();
            $table->decimal('viscosidad_max', 10, 5)->nullable()->change();
            $table->decimal('densidad_min', 10, 5)->nullable()->change();
            $table->decimal('densidad_max', 10, 5)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('PLL_parametros_linea', function (Blueprint $table) {
            $table->foreignId('etapa_id')->nullable()->change();
            $table->foreignId('producto_terminado_id')->nullable(false)->change();
            $table->decimal('temperatura_min', 10, 5)->nullable(false)->change();
            $table->decimal('temperatura_max', 10, 5)->nullable(false)->change();
            $table->decimal('ph_min', 10, 5)->nullable(false)->change();
            $table->decimal('ph_max', 10, 5)->nullable(false)->change();
            $table->decimal('acidez_min', 10, 5)->nullable(false)->change();
            $table->decimal('acidez_max', 10, 5)->nullable(false)->change();
            $table->decimal('brix_min', 10, 5)->nullable(false)->change();
            $table->decimal('brix_max', 10, 5)->nullable(false)->change();
            $table->decimal('viscosidad_min', 10, 5)->nullable(false)->change();
            $table->decimal('viscosidad_max', 10, 5)->nullable(false)->change();
            $table->decimal('densidad_min', 10, 5)->nullable(false)->change();
            $table->decimal('densidad_max', 10, 5)->nullable(false)->change();
        });
    }
};
