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
        //
        Schema::create('CAN_canastillos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->nullable();
            $table->string('alias')->nullable();
            $table->string('tamaño')->nullable();
            $table->string('precio')->nullable();
            $table->string('color')->nullable();
            $table->string('detalle')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::drop('CAN_canastillos');
    }
};
