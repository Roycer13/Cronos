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
        Schema::create('PLAG_barrera_plagas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_interno')->nullable();
            $table->foreignId('man_sector_id')->nullable()->constrained('man_sectores');
            $table->string('tipo')->nullable();
            $table->boolean('estado')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLAG_barrera_plagas');
    }
};
