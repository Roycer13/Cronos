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
        Schema::create('PLL_movimiento_sustancias', function (Blueprint $table) {
            $table->id();
            $table->dateTime('tiempo');
            $table->foreignId('user_id')->constrained();
            $table->foreignId('sustancia_id')->nullable()->constrained('PLL_item_sustancias');
            $table->decimal('cantidad', 8, 4);
            $table->foreignId('estado_id')->nullable()->constrained('estados');
            $table->boolean('tipo');
            $table->foreignId('autorizante_id')->nullable()->constrained('users');
            $table->foreignId('entregante_id')->nullable()->constrained('users');
            $table->dateTime('fecha_entrega')->nullable();
            $table->decimal('saldo', 10, 4)->default(0)->nullable();
            $table->string('observacion')->nullable();
            $table->foreignId('ubicacion_id')->nullable()->constrained('ubicaciones');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_movimiento_sustancias');
    }
};
