<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('PLL_recepcion_certificados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recepcion_materia_prima_id')
                ->constrained('PLL_recepcion_materia_primas')
                ->cascadeOnDelete();
            $table->string('ruta');
            $table->string('nombre_original');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('tamano')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('PLL_recepcion_certificados');
    }
};
