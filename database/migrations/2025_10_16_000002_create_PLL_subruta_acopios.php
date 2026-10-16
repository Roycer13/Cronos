<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::create('PLL_subruta_acopios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('PLL_ruta_acopios_id')->constrained('PLL_ruta_acopios');
            $table->string('nombre', 255);
            $table->string('alias', 100)->nullable();
            $table->text('detalle')->nullable();
            $table->string('grupo', 100)->nullable();
            $table->boolean('estado')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('PLL_subruta_acopios');
    }
};
