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
        //
        Schema::create('CAN_movimientos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('almacen_id')->nullable()->constrained('CAN_almacenes');
            $table->foreignId('almacen2_id')->nullable()->constrained('CAN_almacenes');
            $table->foreignId('responsable_id')->nullable()->constrained('users');
            $table->foreignId('responsable2_id')->nullable()->constrained('users');
            $table->foreignId('vendedor_id')->nullable()->constrained('CAN_vendedores');
            $table->string('tipo_movimiento')->nullable();
            $table->string('tipo_descripcion')->nullable();

            $table->string('observaciones')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::drop('CAN_movimientos');
    }
};
