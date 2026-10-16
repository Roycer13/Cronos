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
        Schema::create('PLL_recepcion_materia_primas', function (Blueprint $table) {
            $table->id();
             $table->dateTime('tiempo')->nullable();
             $table->foreignId('almacen_materia_prima_id')->nullable()->constrained('PLL_almacen_materia_prima');
            $table->foreignId('user_id')->constrained();
            $table->foreignId('item_materia_prima_id')->nullable()->constrained('PLL_item_materia_primas');
            $table->decimal('cantidad', 10, 3)->nullable();
            $table->decimal('unidades', 10, 3)->nullable();
            $table->foreignId('proveedor_materia_prima_id')->nullable()->constrained('PLL_proveedor_materia_primas');
            $table->foreignId('estado_id')->nullable()->constrained('estados');
            $table->foreignId('liberacion_id')->nullable()->constrained('estados');
            $table->string('marca')->nullable();
            $table->boolean('limpieza_transporte')->default(true);
            $table->boolean('sin_elementos')->default(true);
            $table->boolean('cerrado')->default(true);
            $table->boolean('nit')->default(true);
            $table->boolean('rs')->default(true);
            $table->boolean('certificado')->default(true);
            $table->string('observacion')->nullable();
            $table->string('correccion')->nullable();
            $table->foreignId('almacenero_id')->nullable()->constrained('users');
            $table->foreignId('ubicacion_id')->nullable()->constrained('ubicaciones');

            $table->string('codigo_certificado')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
                Schema::dropIfExists('PLL_recepcion_materia_primas');

    }
};
