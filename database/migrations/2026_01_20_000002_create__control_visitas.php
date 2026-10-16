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
  
      Schema::create('control_visitas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ubicacion_id')->constrained('ubicaciones');
            $table->string('nombre_visita');
            $table->string('empresa_area_trabajo');
            $table->foreignId('supervisor_id')->constrained('users');
            $table->dateTime('fecha');
            
            // Checklist básico
            $table->dateTime('fecha_entrada');
            $table->dateTime('fecha_salida')->nullable();
            $table->string('motivo');
            $table->string('area_empresa');
            
            // Evaluación de ingreso
            $table->boolean('vestimenta')->default(true);
            $table->boolean('higiene')->default(true);
            $table->boolean('salud')->default(true);
            $table->boolean('epp_entregado')->default(true);
            $table->boolean('induccion')->default(true);
            
            $table->boolean('conforme')->default(true);
            $table->text('observaciones')->nullable();
            $table->text('correcion')->nullable();
            
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
