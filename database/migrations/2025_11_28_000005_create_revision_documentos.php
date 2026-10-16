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
        Schema::create('revision_documentos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('documento_id')->constrained('documentos');

            $table->date('fecha_evaluacion')->nullable();
            $table->text('analisis_vigencia')->nullable();
            $table->text('evaluacion_efectividad')->nullable();
            $table->text('modificaciones_proceso')->nullable();
            $table->text('resultado_revision_auditoria')->nullable();
            $table->text('retroalimentacion')->nullable();

            $table->string('decision', 20)->nullable(); // mantener / modificar / obsoleto
            $table->text('justificacion')->nullable();

            $table->date('proxima_fecha_revision')->nullable();

            $table->foreignId('responsable_revision_id')->constrained('users');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('revision_documentos');
    }
};
