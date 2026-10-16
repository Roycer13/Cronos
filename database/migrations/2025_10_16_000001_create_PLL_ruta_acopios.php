<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::create('PLL_ruta_acopios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('detalle')->nullable();
            $table->string('alias')->nullable();
            $table->boolean('estado')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('PLL_ruta_acopios');
    }
};
