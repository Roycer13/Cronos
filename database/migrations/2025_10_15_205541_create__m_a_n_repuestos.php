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
        Schema::create('MAN_repuestos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('codigo')->nullable();
            $table->string('foto')->nullable();
            $table->string('descripcion')->nullable();
            $table->string('observacion')->nullable();
            $table->string('stock_minimo')->nullable();
            $table->foreignId('unidad_id')->nullable()->constrained('unidades');
            $table->string('precio_relativo')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('MAN_repuestos');
    }
};
