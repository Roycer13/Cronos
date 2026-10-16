<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documentos', function (Blueprint $table) {
            // Agregar las restricciones de clave foránea ahora que version_documentos existe
            // $table->foreign('version_vigente_id')
            //       ->references('id')
            //       ->on('version_documentos')
            //       ->nullOnDelete();

            // $table->foreign('ultima_version_elaboracion_id')
            //       ->references('id')
            //       ->on('version_documentos')
            //       ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('documentos', function (Blueprint $table) {
            $table->dropForeign(['version_vigente_id']);
            $table->dropForeign(['ultima_version_elaboracion_id']);
        });
    }
};
