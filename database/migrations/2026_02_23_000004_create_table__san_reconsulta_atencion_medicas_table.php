<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('san_reconsulta_atencion_medicas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('atencion_medica_id')->constrained('san_atencion_medicas');
            $table->foreignId('medico')->constrained('users');
            $table->dateTime('fecha_atencion');
            $table->text('evolucion_mejoria')->nullable();
            $table->text('tratamiento')->nullable();
            $table->boolean('transferencia')->default(false);
            $table->foreignId('policlinico_id')->nullable()->constrained('san_policlinicos');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('san_reconsulta_atencion_medicas');
    }
};
