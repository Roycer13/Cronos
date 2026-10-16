<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('PLL_seguimiento_utensilios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('detalle_utensilio_id')->nullable()->constrained('PLL_detalle_utensilios')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('tiempo')->nullable();
            $table->string('cargo')->nullable();
            $table->string('area')->nullable();
            $table->string('tiene_codigo')->nullable();
            $table->string('buen_estado')->nullable();
            $table->string('observaciones')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('PLL_seguimiento_utensilios');
    }
};

