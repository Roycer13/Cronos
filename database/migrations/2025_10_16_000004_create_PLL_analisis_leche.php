<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::create('PLL_analisis_leche', function (Blueprint $table) {
            $table->id();
            $table->foreignId('PLL_recepcion_leches_id')->unique()->constrained('PLL_recepcion_leches');
            $table->foreignId('estado_id')->constrained();

            // Usuarios responsables
            $table->foreignId('user_fq_id')->nullable()->constrained('users');
            $table->foreignId('user_mb_siembra_id')->nullable()->constrained('users');
            $table->foreignId('user_mb_lectura_id')->nullable()->constrained('users');

            // Tiempos de análisis
            $table->timestamp('tiempo_fq')->nullable();
            $table->timestamp('tiempo_siembra')->nullable();
            $table->timestamp('tiempo_lectura')->nullable();

            // Análisis Físico-Químico
            $table->decimal('temperatura', 5, 2)->nullable();
            $table->decimal('ph', 4, 2)->nullable();
            $table->decimal('acidez', 5, 3)->nullable();
            $table->decimal('brix', 5, 2)->nullable();
            $table->decimal('densidad', 5, 4)->nullable();
            $table->boolean('prueba_alcohol')->nullable();
            $table->decimal('contenido_graso', 5, 2)->nullable();
            $table->decimal('temperatura_congelacion', 5, 4)->nullable();
            $table->decimal('porcentaje_agua', 5, 3)->nullable();

            // Análisis Microbiológico
            $table->integer('recuento')->nullable();
            $table->boolean('antibioticos')->nullable();

            // Observaciones
            $table->string('observaciones_fq', 50)->nullable();
            $table->string('observaciones_siembra', 50)->nullable();
            $table->string('observaciones_lectura', 50)->nullable();

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('PLL_analisis_leche');
    }
};
