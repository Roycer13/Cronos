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
        Schema::create('PLAG_control_vectores_insectos', function (Blueprint $table) {
            $table->id();
            $table->dateTime('fecha')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->foreignId('PLAG_insectocaptor_id')->nullable()->constrained('PLAG_insectocaptor')->name('fk_control_vectores_insecto'); ;
            $table->integer('mosca')->nullable();
            $table->integer('mosquito')->nullable();
            $table->integer('abeja')->nullable();
            $table->integer('mariposa')->nullable();
            $table->integer('otros')->nullable();
            $table->boolean('cambio_adhesivo')->nullable();
            $table->boolean('estado_equipo')->nullable();
            $table->string('observacion')->nullable();
            $table->string('correcion')->nullable();
            $table->timestamps();
            $table->softDeletes();  
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLAG_control_vectores_insectos');
    }
};
