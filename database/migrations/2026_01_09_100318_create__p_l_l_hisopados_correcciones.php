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
        Schema::create('PLL_hisopados_correcciones', function (Blueprint $table) {
            $table->id();

            $table->dateTime('tiempo');
            $table->foreignId('user_id')->constrained('users')->nullable();
            $table->foreignId('hisopado_id')->constrained('PLL_hisopados');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_hisopados_correcciones');
    }
};
