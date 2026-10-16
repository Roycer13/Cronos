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
        Schema::create('PLAG_control_barreras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barrera_plaga_id')->nullable()->constrained('PLAG_barrera_plagas');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->dateTime('fecha')->nullable();
            $table->boolean('estado')->nullable();
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
        Schema::dropIfExists('PLAG_control_barreras');
    }
};
