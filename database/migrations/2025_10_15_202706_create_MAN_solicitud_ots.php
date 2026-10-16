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
        Schema::create('MAN_solicitud_ots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->dateTime('tiempo')->nullable();
            $table->foreignId('maquina_equipo_id')->nullable()->constrained('maquina_equipos');
            $table->foreignId('sector_id')->nullable()->constrained('MAN_sectores');
            $table->string('descripcion')->nullable();
            $table->string('observacion')->nullable();
            $table->foreignId('estado_id')->nullable()->constrained('estados');
            $table->dateTime('tiempo_respuesta')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('MAN_solicitud_ots');
    }
};
