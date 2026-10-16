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
        Schema::create('PLAG_control_vectores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('PLAG_trampa_id')->nullable()->constrained('PLAG_trampas');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->dateTime('fecha')->nullable();
            $table->string('tipo_revision')->nullable();
            $table->string('observacion')->nullable();
            $table->string('observacion_detalle')->nullable();
            $table->string('correcion')->nullable();
            $table->string('responsable_correcion')->nullable();
            $table->boolean('deterioro')->nullable();
            $table->string('responsable_cambio')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLAG_control_vectores');
    }
};
