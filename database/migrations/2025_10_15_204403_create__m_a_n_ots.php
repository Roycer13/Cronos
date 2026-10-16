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
        Schema::create('MAN_ots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('solicitud_ot_id')->nullable()->constrained('MAN_solicitud_ots');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->foreignId('prioridad_id')->nullable()->constrained('prioridades');
            $table->string('tipo_orden')->nullable();
            $table->foreignId('estado_id')->nullable()->constrained('estados');
            $table->string('numero')->nullable();
            $table->string('notas')->nullable();
            $table->dateTime('tiempo_completado')->nullable();
            $table->dateTime('tiempo_visto')->nullable();
            $table->dateTime('tiempo_revisado')->nullable();
            $table->dateTime('tiempo_cerrado')->nullable();
            $table->string('diagnostico')->nullable();
            $table->string('accion')->nullable();
            $table->string('sugerencia')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('MAN_ots');
    }
};
