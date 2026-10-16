<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('PLL_control_fisicoquimico_organoleptico', function (Blueprint $table) {
            $table->id();
            $table->dateTime('tiempo');
            $table->foreignId('user_id')->constrained('users');
            $table->decimal('ph_pozo', 10, 5)->nullable();
            $table->decimal('dureza_pozo', 10, 5)->nullable();
            $table->decimal('conductividad_pozo', 10, 5)->nullable();
            $table->decimal('ph_etap', 10, 5)->nullable();
            $table->decimal('dureza_etap', 10, 5)->nullable();
            $table->decimal('cloruros_etap', 10, 5)->nullable();
            $table->decimal('conductividad_etap', 10, 5)->nullable();
            $table->string('color')->default('normal');
            $table->string('olor')->default('normal');
            $table->string('sabor')->default('normal');
            $table->string('aspecto')->default('normal');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('PLL_control_fisicoquimico_organoleptico');
    }
};
