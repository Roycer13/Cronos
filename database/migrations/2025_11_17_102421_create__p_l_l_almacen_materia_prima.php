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
        Schema::create('PLL_almacen_materia_prima', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->foreignId('ubicacion_id')->nullable()->constrained('ubicaciones');


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_almacen_materia_prima');
    }
};
