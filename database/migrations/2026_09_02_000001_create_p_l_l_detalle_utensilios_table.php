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
        Schema::create('PLL_detalle_utensilios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_utensilio')->nullable();
            $table->string('area')->nullable();
            $table->string('cargo')->nullable();
            $table->string('estado')->nullable();
            $table->string('frecuencia')->nullable();
            $table->string('vigencia_utensilio')->nullable();
            $table->string('codigo')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_detalle_utensilios');
    }
};
