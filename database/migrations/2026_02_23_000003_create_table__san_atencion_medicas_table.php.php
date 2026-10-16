<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('san_atencion_medicas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medico')->constrained('users');
            $table->foreignId('paciente')->constrained('users');
            $table->dateTime('fecha_incidente')->nullable();
            $table->dateTime('fecha_atencion');
            $table->string('motivo_consulta')->nullable(); // texto libre, pero podrías cambiar a foreignId si creas catálogo
            $table->text('descripcion')->nullable();
            $table->text('diagnostico')->nullable();
            $table->string('gravedad')->nullable(); // texto libre
            $table->decimal('temperatura', 5, 2)->nullable();
            $table->string('presion_arterial', 10)->nullable();
            $table->unsignedSmallInteger('frecuencia_respiratoria')->nullable();
            $table->unsignedSmallInteger('frecuencia_cardiaca')->nullable();
            $table->text('tratamiento')->nullable();
            $table->boolean('transferencia')->default(false);
            $table->foreignId('policlinico_id')->nullable()->constrained('san_policlinicos');
            $table->foreignId('estado_id')->constrained('estados'); // Asumiendo que tienes tabla 'estados'
            $table->dateTime('fecha_alta')->nullable();
            $table->text('descripcion_alta')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('atencion_medicas');
    }
};
