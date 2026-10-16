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
        Schema::create('PLL_movimiento_desinfecciones', function (Blueprint $table) {
            $table->id();
            $table->dateTime('tiempo');
            $table->dateTime('fecha_entrega')->nullable();
            $table->foreignId('user_id')->constrained('users');
            $table->boolean('tipo');
            $table->foreignId('autorizante_id')->nullable()->constrained('users');
            $table->foreignId('entregante_id')->nullable()->constrained('users');
            $table->foreignId('item_desinfeccion_id')->constrained('PLL_item_desinfecciones');
            $table->foreignId('destino_desinfeccion_id')->nullable()->constrained('PLL_destino_desinfecciones');
            $table->foreignId('estado_id')->nullable()->constrained('estados');
            $table->decimal('cantidad_item', 10, 5);
            $table->decimal('cantidad_mezcla', 10, 5)->nullable();
            $table->decimal('saldo', 10, 5)->default(0)->nullable();
            $table->foreignId('ubicacion_id')->nullable()->constrained('ubicaciones');
            $table->decimal('confirmacion', 10, 5)->nullable();
            $table->string('observacion')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_movimiento_desinfecciones');
    }
};
