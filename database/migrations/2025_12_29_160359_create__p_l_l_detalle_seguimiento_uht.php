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
        Schema::create('PLL_detalle_seguimiento_uht', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seguimiento_uht_id')->constrained('PLL_seguimiento_uht');

            $table->foreignId('orp_id')->constrained('orps');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_detalle_seguimiento_uht');
    }
};
