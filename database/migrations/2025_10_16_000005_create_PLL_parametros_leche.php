<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::create('PLL_parametros_leche', function (Blueprint $table) {
            $table->id();
            
            // Parámetros Físico-Químicos
            $table->decimal('temperatura_max', 5, 2)->nullable();
            $table->decimal('ph_min', 4, 2)->nullable();
            $table->decimal('ph_max', 4, 2)->nullable();
            $table->decimal('acidez_min', 5, 3)->nullable();
            $table->decimal('acidez_max', 5, 3)->nullable();
            $table->decimal('brix_min', 5, 2)->nullable();
            $table->decimal('contenido_graso_min', 5, 2)->nullable();
            $table->decimal('temperatura_congelada_min', 5, 2)->nullable();
            $table->decimal('temperatura_congelada_max', 5, 2)->nullable();
            $table->decimal('densidad_min', 5, 4)->nullable();
            $table->decimal('densidad_max', 5, 4)->nullable();
            
            // Parámetros Microbiológicos
            $table->decimal('recuento_maximo', 10, 2)->nullable();
            
            // Control de vigencia
            $table->date('fecha_vigencia');
            $table->boolean('estado')->default(true);
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('PLL_parametros_leche');
    }
};
