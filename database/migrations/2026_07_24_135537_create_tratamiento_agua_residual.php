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
        Schema::create('PLL_tratamiento_agua_residual', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->dateTime('tiempo_analisis')->nullable();
            $table->string('turno')->nullable();
            $table->decimal('flujometro_aire', 10, 5)->nullable();
            $table->decimal('flujometro_agua', 10, 5)->nullable();

             $table->decimal('t_nivel', 10, 5)->nullable();
            $table->decimal('reactor', 10, 5)->nullable();
            $table->decimal('t_balanceo', 10, 5)->nullable();

            $table->boolean('purgado')->nullable();
            $table->string('observaciones')->nullable();

            $table->timestamps();


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_tratamiento_agua_residual');
    }
};
