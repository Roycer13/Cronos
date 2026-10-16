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
  
      Schema::create('asistencia_capacitacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('capacitacion_id')->constrained('capacitaciones');
            $table->foreignId('trabajador_id')->constrained('users');
            $table->boolean('asistio')->default(false);
            $table->boolean('aprobo')->default(false);
            $table->integer('nota')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Evitar registros duplicados
            $table->unique(['capacitacion_id', 'trabajador_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('control_vistas');
    }
};
