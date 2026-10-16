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
        Schema::table('PLL_analisis_materia_primas', function (Blueprint $table) {
            $table->string('largo_superior')->nullable()->change();
            $table->string('largo_inferior')->nullable()->change();
            $table->string('ancho')->nullable()->change();
            $table->string('micronaje')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('PLL_analisis_materia_primas', function (Blueprint $table) {
            $table->decimal('largo_superior', 10, 5)->nullable()->change();
            $table->decimal('largo_inferior', 10, 5)->nullable()->change();
            $table->decimal('ancho', 10, 5)->nullable()->change();
            $table->decimal('micronaje', 10, 5)->nullable()->change();
        });
    }
};
