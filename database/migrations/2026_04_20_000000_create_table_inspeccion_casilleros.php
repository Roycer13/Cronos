<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('InspeccionCasilleros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ubicacion_id')->nullable()->constrained('ubicaciones');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->dateTime('fecha')->nullable();
            $table->boolean('orden')->nullable();
            $table->boolean('limpieza')->nullable();
            $table->boolean('implementos_aseo')->nullable();
            $table->string('observacion')->nullable();
            $table->string('correcion')->nullable();
            $table->foreignId('inspector1_id')->nullable()->constrained('users');
            $table->foreignId('inspector2_id')->nullable()->constrained('users');
            $table->foreignId('inspector3_id')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();

            // Índices para búsquedas frecuentes
            $table->index('fecha');
            $table->index('user_id');
            $table->index('ubicacion_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('InspeccionCasilleros');
    }
};