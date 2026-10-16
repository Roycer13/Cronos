<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('PLL_estado_detalles', function (Blueprint $table) {
            $table->id();

            // ORP
            $table->foreignId('orp_id')
                ->constrained('orps')
                ->onDelete('cascade'); // puedes cambiar a restrictOnDelete() si quieres

            $table->string('preparacion', 50);

            // FIX SQL SERVER: evitar Multiple Cascade Paths
            $table->foreignId('estado_planta_id')
                ->nullable()                           // necesario para nullOnDelete()
                ->constrained('PLL_estado_plantas')
                ->nullOnDelete();                      // CORRECCIÓN

            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');

            $table->decimal('cantidad', 8, 2);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('PLL_estado_detalles');
    }
};
