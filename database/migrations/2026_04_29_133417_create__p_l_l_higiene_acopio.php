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
        Schema::create('PLL_higiene_acopio', function (Blueprint $table) {
            $table->id();
            $table->dateTime('tiempo');
            $table->foreignId('user_id')->constrained();
            $table->foreignId('estado_id')->constrained('estados');
            $table->foreignId('PLL_ruta_acopios_id')->constrained('PLL_ruta_acopios');

            $table->boolean('superficie_llegada')->default(true);
            $table->string('observacion_llegada')->nullable();
            $table->string('correccion_llegada')->nullable();

            $table->boolean('cofia')->default(true);
            $table->boolean('Barbijo')->default(true);
            $table->boolean('Overol')->default(true);

            $table->boolean('superficie_salida')->default(true);
            $table->string('observacion_salida')->nullable();
            $table->string('correccion_salida')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_higiene_acopio');
    }
};
