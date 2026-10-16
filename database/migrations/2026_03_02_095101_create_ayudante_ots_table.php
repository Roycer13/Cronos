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
        Schema::create('MAN_ayudante_ots', function (Blueprint $table) {
            $table->id();

            $table->foreignId('ot_id')->nullable()->constrained('MAN_ots');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->dateTime('tiempo_inicio')->nullable();
            $table->dateTime('tiempo_fin')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('MAN_ayudante_ots');
    }
};
