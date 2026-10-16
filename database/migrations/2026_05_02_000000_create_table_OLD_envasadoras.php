<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
Schema::create('old_envasadoras_htst', function (Blueprint $table) {
    $table->id();

    $table->enum('tipo_maquina', ['cabezal', 'vasos', 'botella']);
    $table->date('fecha');

    $table->foreignId('orp_id')
        ->nullable()
        ->constrained('orps')
        ->nullOnDelete();

    $table->decimal('valor_produccion', 10, 2)->nullable();
    $table->enum('tipo_medicion', ['peso', 'volumen'])->nullable();

    $table->foreignId('maquinista_id')->constrained('users');

    $table->foreignId('usuario_verificador')
        ->nullable()
        ->constrained('users')
        ->nullOnDelete();

    $table->timestamp('tiempo_inicio_limpieza')->nullable();
    $table->timestamp('tiempo_fin_limpieza')->nullable();

    $table->string('tipo_limpieza')->nullable();

    $table->timestamp('calibracion_inicio')->nullable();
    $table->timestamp('calibracion_fin')->nullable();
    $table->timestamp('envasado_inicio')->nullable();
    $table->timestamp('envasado_fin')->nullable();

    $table->decimal('merma', 10, 2)->nullable();

    $table->json('checks')->nullable();
    $table->json('origenes')->nullable();

    $table->text('observaciones')->nullable();
    $table->text('correciones')->nullable();

    $table->timestamps();
});
    }

    public function down(): void
    {
        Schema::dropIfExists('old_envasadoras_htst');
    }
};
