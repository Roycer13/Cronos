<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('orp_estados', function (Blueprint $table) {
            $table->id();

            $table->foreignId('orp_id')
                ->constrained('orps')
                ->onDelete('cascade'); // Esto NO causa problema porque apunta a orps

            $table->foreignId('estado_id')
                ->constrained('estados')
                ->onDelete('no action'); // ← CORREGIDO

            $table->foreignId('usuario_id')
                ->constrained('users')
                ->onDelete('cascade'); // ok

            $table->dateTime('fecha_hora');
            $table->text('observaciones')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('orp_estados');
    }
};
