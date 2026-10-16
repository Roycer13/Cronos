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
        Schema::create('MAN_detalle_almacen_repuestos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('almacen_repuesto_id')->nullable()->constrained('MAN_almacen_repuestos');
            $table->foreignId('repuesto_id')->nullable()->constrained('MAN_repuestos');

            $table->decimal('cantidad', 10, 2)->nullable();
            $table->decimal('saldo', 10, 2)->nullable();



            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('MAN_detalle_almacen_repuestos');
    }
};
