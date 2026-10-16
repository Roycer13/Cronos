<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::create('subcategoria_productos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50);
            $table->string('codigo', 10)->unique();
            $table->string('descripcion', 255)->nullable();
            $table->foreignId('categoria_id')->constrained('categoria_productos'); // ✅ Corregido
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('subcategoria_productos');
    }
};
