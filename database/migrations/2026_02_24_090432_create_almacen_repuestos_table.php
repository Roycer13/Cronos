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
        Schema::create('MAN_almacen_repuestos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ot_id')->nullable()->constrained('MAN_ots');
            $table->foreignId('proveedor_id')->nullable()->constrained('MAN_proveedores');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->foreignId('ubicacion_id')->nullable()->constrained('ubicaciones');
            $table->foreignId('almacenero_id')->nullable()->constrained('users');
            $table->foreignId('autorizante_id')->nullable()->constrained('users');
            $table->foreignId('estado_id')->nullable()->constrained('estados');
            $table->string('observacion')->nullable();
            $table->boolean('tipo')->nullable();
            $table->string('tipo_descripcion')->nullable();
            $table->dateTime('tiempo')->nullable();
            $table->dateTime('tiempo_autorizacion')->nullable();
            $table->dateTime('tiempo_entregado')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('MAN_almacen_repuestos');
    }
};
