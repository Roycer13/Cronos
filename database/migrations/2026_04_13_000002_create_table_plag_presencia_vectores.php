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
        Schema::create('PLAG_presencia_vectores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('man_sector_id')->nullable()->constrained('man_sectores');
            $table->string('vector')->nullable();
            $table->string('reportado_por')->nullable();
            $table->dateTime('fecha')->nullable();
            $table->boolean('estado')->nullable();
            $table->string('accion')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLAG_presencia_vectores');
    }
};
