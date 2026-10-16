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
         Schema::create('relacion_documentos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('documento_id')->constrained('documentos');
            $table->foreignId('documento_relacion_id')->constrained('documentos');

            $table->string('tipo_relacion', 20); // deriva / soporta / referencia / otro

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('relacion_documentos');
    }
};
