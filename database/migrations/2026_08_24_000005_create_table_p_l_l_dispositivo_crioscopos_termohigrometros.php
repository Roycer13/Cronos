<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('PLL_dispositivo_termohigrometros', function (Blueprint $table) {
            $table->id();
            $table->dateTime('fecha_hora');

            // Claves foráneas con nombres cortos para evitar error de MySQL
            $table->foreignId('dispositivos_medicion_id')->constrained('PLL_dispositivos_medicion')->name('fk_termohigrometros_dispositivo');

            $table->foreignId('user_id')->nullable()->constrained('users')->name('fk_termohigrometros_usuario');

            $table->foreignId('estado_id')->nullable()->constrained('estados')->name('fk_termohigrometros_estado');

            $table->boolean('requiere_ajuste')->default(false);
            $table->decimal('patron_temperatura', 5, 2)->nullable();
            $table->decimal('equipo_temperatura', 5, 2)->nullable();
            $table->decimal('error_temperatura', 5, 2)->nullable();
            $table->decimal('patron_humedad', 5, 2)->nullable();
            $table->decimal('equipo_humedad', 5, 2)->nullable();
            $table->decimal('error_humedad', 5, 2)->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('PLL_dispositivo_termohigrometros');
    }
};