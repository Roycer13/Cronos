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
        Schema::create('MAN_movimiento_repuestos', function (Blueprint $table) {
            $table->id();
            $table->dateTime('tiempo');
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('ot_id')->nullable()->constrained('MAN_ots');
            $table->foreignId('proveedor_id')->nullable()->constrained('MAN_proveedores');
            $table->dateTime('tiempo_entrega')->nullable();
            $table->dateTime('tiempo_aprovado')->nullable();
            $table->foreignId('encargado_almacen_id')->constrained('users');
            $table->foreignId('autorizante_id')->constrained('users');
            $table->boolean('tipo');
            $table->string('observacion')->nullable();
            $table->string('tipo_descripcion')->nullable();
            $table->foreignId('estado_id')->nullable()->constrained('estados');


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('MAN_movimiento_repuestos');
    }
};
