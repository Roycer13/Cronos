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
  
        Schema::create('higiene_personales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ubicacion_id')->constrained('ubicaciones');
            $table->foreignId('empleado_id')->constrained('users');
            $table->foreignId('supervisor_id')->constrained('users');
            $table->dateTime('fecha');
            
            // Checklist básico
            $table->boolean('uniforme')->default(true);
            $table->boolean('limpieza')->default(true);
            $table->boolean('salud')->default(true);
            $table->boolean('epp')->default(true);
            $table->boolean('objetos')->default(true);
            $table->boolean('material_equipo')->default(true);
            
            // Resultado
            $table->boolean('conforme')->default(true);
            $table->text('observaciones')->nullable();
            $table->text('correccion')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('higiene_personales');
    }
};
