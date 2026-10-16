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
        Schema::create('PLL_limpieza_tanques_aereos', function (Blueprint $table) {
            $table->id();

            $table->dateTime('tiempo');

            $table->string('tanque')->nullable();
            $table->foreignId('user_id')->constrained();

            $table->boolean('l_tapa')->default(true);
            $table->boolean('d_tapa')->default(true);

            $table->boolean('l_paredes')->default(true);
            $table->boolean('d_paredes')->default(true);

            $table->boolean('l_piso')->default(true);
            $table->boolean('d_piso')->default(true);

            $table->boolean('l_conexiones')->default(true);
            $table->boolean('d_conexiones')->default(true);

            $table->string('correccion')->nullable();
            $table->string('observacion')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        Schema::dropIfExists('PLL_limpieza_tanques_aereos');

    }
};
