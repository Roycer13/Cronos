<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
 public function up()
    {
        Schema::create('san_policlinicos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->string('direccion', 255)->nullable();
            $table->foreignId('caja_id')->constrained('san_cajas');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('san_policlinicos');
    }
};