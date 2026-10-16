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
        Schema::create('PLAG_arranque_despues_fumigacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('man_sector_id')->nullable()->constrained('man_sectores');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->dateTime('fecha')->nullable();
            $table->boolean('sin_olor')->nullable();
            $table->boolean('limpio')->nullable();
            $table->string('observacion')->nullable();
            $table->string('correcion')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLAG_arranque_despues_fumigacion');
    }
};
