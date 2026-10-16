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
         Schema::create('version_documentos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('documento_id')->constrained('documentos');

            $table->string('numero_version', 20);
            $table->string('archivo_pdf_url', 500)->nullable();
            $table->string('archivo_word_url', 500)->nullable();

            $table->text('cambios')->nullable();

            $table->foreignId('creado_por')->nullable()->constrained('users');
            $table->foreignId('revisado1_por')->nullable()->constrained('users');
            $table->foreignId('revisado2_por')->nullable()->constrained('users');
            $table->foreignId('aprobado_por')->nullable()->constrained('users');

            $table->timestamp('fecha_creacion')->nullable();
            $table->timestamp('fecha_revision')->nullable();
            $table->timestamp('fecha_aprobado')->nullable();

            $table->foreignId('estado_id')->nullable()->constrained('estados');
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
        Schema::dropIfExists('version_documentos');
    }
};
