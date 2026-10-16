<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('PLL_aditivos_quimicos', function (Blueprint $table) {
            $table->id();
            $table->dateTime('tiempo');
            $table->decimal('wet_boil_101', 10, 5)->nullable();
            $table->decimal('wet_boil_201', 10, 5)->nullable();
            $table->decimal('wet_boil_402', 10, 5)->nullable();
            $table->decimal('wet_boil_801', 10, 5)->nullable();
            $table->decimal('soda_caustica', 10, 5)->nullable();
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('PLL_aditivos_quimicos');
    }
};
