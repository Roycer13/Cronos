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
        Schema::create('PLL_recepcion_lotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recepcion_materia_prima_id')
                ->constrained('PLL_recepcion_materia_primas')
                ->onDelete('cascade');
            $table->string('lote')->nullable();
            $table->date('fecha_elaboracion')->nullable();
            $table->date('fecha_vencimiento')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('PLL_recepcion_lotes');
    }
};
