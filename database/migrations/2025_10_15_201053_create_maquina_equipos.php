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
        Schema::create('maquina_equipos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('codigo_interno')->nullable();
            $table->string('codigo_contable')->nullable();
            $table->string('alias')->nullable();
            $table->string('serie')->nullable();
            $table->string('fecha_compra')->nullable();
            $table->string('modelo')->nullable();
            $table->string('costo')->nullable();
            $table->string('fabricante')->nullable();
            $table->string('criticidad')->nullable();
            $table->boolean('pcc')->default(false);
            $table->string('descripcion')->nullable();
            $table->foreignId('tipo_maquina_equipo_id')->nullable()->constrained('MAN_tipo_maquina_equipos');
            $table->foreignId('estado_id')->nullable()->constrained('estados');
            $table->foreignId('sector_id')->nullable()->constrained('MAN_sectores');
$table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maquina_equipos');
    }
};
