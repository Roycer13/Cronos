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
        Schema::create('PLL_fisicoquimico_laboratorio_externo', function (Blueprint $table) {
            $table->id();
            $table->dateTime('tiempo')->nullable();
            $table->foreignId('detalle_id')->nullable()->constrained('PLL_detalle_solicitud_laboratorio_externo');

            $table->foreignId('estado_id')->nullable()->constrained('estados');
            $table->decimal('temperatura', 4, 2)->nullable();
            $table->decimal('humedad_relativa', 4, 2)->nullable();
            $table->decimal('actividad_agua', 4, 2)->nullable();

            $table->string('observacion')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_fisicoquimico_laboratorio_externo');
    }
};
