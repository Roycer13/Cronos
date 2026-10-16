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
        Schema::create('distribucion_documentos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('documento_id')->constrained('documentos');

            $table->string('tipo', 20); // fisica, digital, mixta

            $table->integer('cantidad_copias')->default(1);

            $table->foreignId('area_destinataria_id')
                ->nullable()
                ->constrained('areas');

            $table->foreignId('responsable_user_id')
                ->nullable()
                ->constrained('users');

            $table->text('ubicacion_fisica')->nullable();

            // DISTRIBUCIÓN DIGITAL CONTROLADA
            $table->foreignId('acceso_usuario_id')
                ->nullable()
                ->constrained('users');

            $table->timestamp('fecha_inicio_acceso')->nullable();
            $table->timestamp('fecha_fin_acceso')->nullable();

            $table->boolean('control_descarga')->default(true);
            $table->integer('cantidad_descargas')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('distribucion_documentos');
    }
};
