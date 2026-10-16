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
    Schema::create('PLL_analisis_linea', function (Blueprint $table) {
    $table->id();
    $table->datetime('tiempo_solicitud');

    $table->foreignId('solicitante_id')->constrained('users'); // ← SIN cascade
    $table->foreignId('estado_planta_id')->constrained('PLL_estado_plantas'); // ← SIN cascade
    $table->foreignId('estado_id')->constrained('estados'); // ← SIN cascade

    // Campos adicionales de análisis
    $table->datetime('tiempo_analisis')->nullable();
    $table->foreignId('analista_id')
        ->nullable()
        ->constrained('users')
        ->nullOnDelete(); // ← CORREGIDO: no cascade

    $table->decimal('temperatura', 5, 2)->nullable();
    $table->decimal('ph', 4, 2)->nullable();
    $table->decimal('acidez', 4, 3)->nullable();
    $table->decimal('brix', 4, 2)->nullable();
    $table->decimal('viscosidad', 5, 2)->nullable();
    $table->decimal('densidad', 4, 3)->nullable();
    $table->boolean('color')->nullable();
    $table->boolean('olor')->nullable();
    $table->boolean('sabor')->nullable();
    $table->string('aspecto')->nullable();
    $table->decimal('peso', 6, 2)->nullable();
    $table->decimal('volumen', 6, 2)->nullable();
    $table->text('observaciones')->nullable();
    $table->decimal('tempUHT', 6, 2)->nullable();

    $table->timestamps();
    $table->softDeletes();

    // Índices
    $table->index('tiempo_solicitud');
    $table->index('tiempo_analisis');
    $table->index('estado_planta_id');
    $table->index('estado_id');
    $table->index('solicitante_id');
    $table->index('analista_id');
    $table->index(['tiempo_solicitud', 'estado_planta_id']);
});

}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_analisis_linea');
    }
};
