<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('PLL_arranque_linea', function (Blueprint $table) {
            $table->id();

            $table->datetime('tiempo');
            $table->foreignId('estado_id')
                ->constrained('estados');
            $table->foreignId('user_id')
                ->constrained('users');
            $table->string('observacion')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('PLL_arranque_linea');
    }
};
