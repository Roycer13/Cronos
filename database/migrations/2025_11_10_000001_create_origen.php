<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::create('PLL_origenes', function (Blueprint $table) {
            $table->id();
            $table->string('alias');
            $table->text('descripcion')->nullable();
            $table->foreignId('maquina_id')->nullable()->constrained('maquina_equipos')->onDelete('cascade');
            $table->foreignId('sector_id')->nullable()->constrained('man_sectores')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('origenes');
    }
};
