<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('PLL_estado_plantas', function (Blueprint $table) {
            $table->id();
            $table->timestamp('tiempo');

            $table->foreignId('user_id')
                ->constrained(); // ← SIN DELETE → SQL Server lo trata como RESTRICT

            $table->foreignId('origen_id')
                ->constrained('PLL_origenes'); // ← SIN DELETE

            // ESTA SE QUEDA IGUAL
            $table->foreignId('proceso_id')
                ->constrained('estados'); // ← SIN DELETE

            // ESTA ES LA ÚNICA QUE REQUIERE ACCIÓN
            $table->foreignId('etapa_id')
                ->nullable()
                ->constrained('estados')
                ->nullOnDelete();

            $table->text('observaciones')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('PLL_estado_plantas');
    }
};
