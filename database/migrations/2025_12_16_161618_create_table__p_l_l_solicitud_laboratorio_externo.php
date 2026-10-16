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
        Schema::create('PLL_solicitud_laboratorio_externo', function (Blueprint $table) {
            $table->id();
            $table->dateTime('tiempo');
            $table->dateTime('tiempo_autorizacion')->nullable();
            $table->foreignId('autorizante_id')->nullable()->constrained('users');
            $table->foreignId('estado_id')->nullable()->constrained('estados');
            $table->string('codigo')->nullable();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('ubicacion_id')->nullable()->constrained('ubicaciones');
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
        Schema::dropIfExists('PLL_solicitud_laboratorio_externo');
    }
};
