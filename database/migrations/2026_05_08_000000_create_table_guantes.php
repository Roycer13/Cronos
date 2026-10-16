<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
Schema::create('dotacion_guantes', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->nullable()->constrained('users');
    $table->foreignId('user_encargado_id')->nullable()->constrained('users');
    $table->dateTime('tiempo');
    $table->string('tipo');
    $table->boolean('amarillo')->default(false);
    $table->boolean('rojo')->default(false);
    $table->boolean('naranja')->default(false);
    $table->boolean('otros')->default(false);
    $table->string('observaciones')->nullable();
    

    $table->timestamps();
    $table->softDeletes();

    $table->index('user_id');
    $table->index('user_encargado_id');
    $table->index('tiempo');
});
    }

    public function down(): void
    {
        Schema::dropIfExists('dotacion_guantes');
    }
};
