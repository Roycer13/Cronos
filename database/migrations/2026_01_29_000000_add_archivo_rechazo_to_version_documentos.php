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
        Schema::table('version_documentos', function (Blueprint $table) {
            // Agregar columna para guardar el archivo de rechazo/corrección
            $table->string('archivo_rechazo_url', 500)->nullable()->after('archivo_word_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('version_documentos', function (Blueprint $table) {
            $table->dropColumn('archivo_rechazo_url');
        });
    }
};
