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
        Schema::create('CAN_almacenes', function (Blueprint $table) {
            $table->id();

            $table->string('nombre')->nullable();
            $table->string('ubicacion')->nullable();
            $table->foreignId('tipo_almacen_id')->nullable()->constrained('CAN_tipo_almacenes');
            $table->integer('cantidad')->nullable();
            $table->string('observaciones')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::drop('CAN_almacenes');
    }
};
