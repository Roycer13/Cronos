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
        Schema::create('PLL_conteos', function (Blueprint $table) {
            $table->id();
            $table->dateTime('tiempo');
            $table->integer('cantidad');
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('orp_id')->constrained('orps');
            $table->foreignId('estado_id')->nullable()->constrained('estados');
            $table->string('tipo')->nullable();
            $table->string('observacion')->nullable();
            $table->string('ubicacion')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_conteos');
    }
};
