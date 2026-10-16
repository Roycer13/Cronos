// database/migrations/xxxx_create_documentos_table.php
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
        Schema::create('documentos', function (Blueprint $table) {
            $table->id();

            $table->string('codigo', 50)->unique();
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->string('tipo', 50);

            $table->foreignId('area_id')->nullable()->constrained('areas');
            $table->foreignId('ubicacion_id')->nullable()->constrained('ubicaciones');
            $table->foreignId('estado_id')->nullable()->constrained('estados');
            
            // ¡¡¡DEBES AGREGAR ESTAS DOS LÍNEAS!!!
            $table->unsignedBigInteger('version_vigente_id')->nullable();
            $table->unsignedBigInteger('ultima_version_elaboracion_id')->nullable();
            
            $table->foreignId('creador_asignado')->nullable()->constrained('users');
            $table->foreignId('revisor1_asignado')->nullable()->constrained('users');
            $table->foreignId('revisor2_asignado')->nullable()->constrained('users');
            $table->foreignId('aprobador_asignado')->nullable()->constrained('users');

            $table->foreignId('documento_padre_id')->nullable()->constrained('documentos');
            $table->foreignId('custodio')->nullable()->constrained('users');

            $table->string('tipo_distribucion', 20)->nullable();
            $table->string('ubicacion_fisica')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documentos');
    }
};