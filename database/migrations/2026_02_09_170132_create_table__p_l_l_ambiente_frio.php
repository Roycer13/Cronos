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
        Schema::create('table__p_l_l_ambiente_frio', function (Blueprint $table) {
            $table->id();
            $table->datetime('tiempo');
            $table->foreignId('orp_id')->constrained('orps');
            $table->string('preparacion', 50);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('table__p_l_l_ambiente_frio');
    }
};
