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
        Schema::create('PLL_destino_desinfecciones', function (Blueprint $table) {
            $table->id();


            $table->string('codigo');
            $table->string('nombre');
            $table->decimal('concentracion', 6, 2);
            $table->decimal('multiplicador', 10, 4)->nullable();
            $table->foreignId('unidad_id')->nullable()->constrained('unidades');
            $table->foreignId('estado_id')->nullable()->constrained('estados');
            $table->foreignId('ubicacion_id')->nullable()->constrained('ubicaciones');
            $table->foreignId('item_desinfeccion_id')->constrained('PLL_item_desinfecciones');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_destino_desinfecciones');
    }
};
