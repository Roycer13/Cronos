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
        Schema::create('solicitud_documentos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_solicitud', 50)->unique();
            $table->timestamp('fecha_solicitud')->nullable();

            $table->foreignId('solicitante_id')->constrained('users');
            $table->string('tipo_solicitud', 20); // creacion / modificacion

            $table->foreignId('documento_id')->nullable()->constrained('documentos');

            $table->text('justificacion')->nullable();
            $table->text('alcance')->nullable();

            $table->foreignId('estado_id')->constrained('estados');

            // PLAZOS Y FECHAS DE FLUJO
            $table->date('limite_fecha_elaboracion')->nullable();
            $table->date('fecha_elaboracion')->nullable();

            $table->date('limite_fecha_revision_tecnica')->nullable();
            $table->date('fecha_revision_tecnica')->nullable();

            $table->date('limite_fecha_revision_calidad')->nullable();
            $table->date('fecha_revision_calidad')->nullable();

            $table->date('limite_fecha_revision_aprobacion')->nullable();
            $table->date('fecha_revision_aprobacion')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('solicitud_documentos');
    }
};
