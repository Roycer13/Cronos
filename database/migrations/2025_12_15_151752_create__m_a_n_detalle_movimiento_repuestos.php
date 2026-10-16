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
        Schema::create('MAN_detalle_movimiento_repuestos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('repuesto_id')->constrained('MAN_repuestos');
            $table->foreignId('movimiento_id')->constrained('MAN_movimiento_repuestos');
            $table->decimal('cantidad', 10, 5);
            $table->decimal('saldo', 10, 5);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('MAN_detalle_movimiento_repuestos');
    }
};
