<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('PLL_detalle_op_arranque', function (Blueprint $table) {
            $table->id();

            $table->foreignId('arranque_linea_id')->constrained('PLL_arranque_linea');
            $table->string('numero');
            $table->string('tipo');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('PLL_detalle_op_arranque');
    }
};
