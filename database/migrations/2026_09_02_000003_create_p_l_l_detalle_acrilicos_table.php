<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('PLL_detalle_acrilicos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->nullable();
            $table->string('area')->nullable();
            $table->unsignedInteger('cantidad_vidrios')->nullable();
            $table->unsignedInteger('cantidad_luminarias')->nullable();
            $table->string('vigencia')->nullable();
            $table->string('frecuencia')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('PLL_detalle_acrilicos');
    }
};
