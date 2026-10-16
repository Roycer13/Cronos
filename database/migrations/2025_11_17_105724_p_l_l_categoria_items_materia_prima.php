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
        //

        Schema::create('PLL_categoria_materia_primas', function (Blueprint $table) {
            $table->id();
             $table->string('nombre');
            $table->string('descripcion')->nullable();

            $table->foreignId('ubicacion_id')->nullable()->constrained('ubicaciones');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //

        Schema::dropIfExists('PLL_categoria_materia_primas');
    }
};
