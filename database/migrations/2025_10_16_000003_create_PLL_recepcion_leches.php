<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::create('PLL_recepcion_leches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('PLL_subruta_acopios_id')->constrained('PLL_subruta_acopios');
            $table->timestamp('tiempo');
            $table->foreignId('estado_id')->constrained('estados');
            $table->foreignId('user_id')->constrained();
            $table->decimal('cantidad', 10, 2)->nullable();
            $table->text('observaciones')->nullable();
            $table->string('tipo_recepcion')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('PLL_recepcion_leches');
    }
};
