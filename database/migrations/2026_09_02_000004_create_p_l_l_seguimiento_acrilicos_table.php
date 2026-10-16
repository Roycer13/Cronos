<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('PLL_seguimiento_acrilicos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('detalle_acrilico_id')->nullable()->constrained('PLL_detalle_acrilicos')->nullOnDelete();
            $table->boolean('integridad_vidrios')->nullable();
            $table->boolean('integridad_luminarias')->nullable();
            $table->text('observaciones')->nullable();
            $table->boolean('informado')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('tiempo')->nullable();
            $table->string('codigo')->nullable();
            $table->string('area')->nullable();
            $table->unsignedInteger('cantidad_vidrios')->nullable();
            $table->unsignedInteger('cantidad_luminarias')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('PLL_seguimiento_acrilicos');
    }
};
