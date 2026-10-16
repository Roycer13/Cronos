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
        Schema::create('PLL_item_sustancias', function (Blueprint $table) {
            $table->id();
            $table->string('codigo');
            $table->string('nombre');
            $table->foreignId('unidad_id')->nullable()->constrained('unidades');
            $table->foreignId('estado_id')->nullable()->constrained('estados');
            $table->foreignId('ubicacion_id')->nullable()->constrained('ubicaciones');

            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_item_sustancias');
    }
};
