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
        Schema::create('PLL_hisopados', function (Blueprint $table) {
            $table->id();

            $table->dateTime('tiempo');
            $table->dateTime('tiempo_siembra')->nullable();
            $table->dateTime('tiempo_lectura')->nullable();
            $table->integer('coliformes')->nullable();

            $table->foreignId('estado_id')->nullable()->constrained('estados');
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('usuario_siembra_id')->constrained('users');
            $table->foreignId('usuario_lectura_id')->nullable()->constrained('users');

            $table->string('observacion_siembra')->nullable();
            $table->string('observacion_lectura')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_hisopados');
    }
};
