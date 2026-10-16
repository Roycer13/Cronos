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
        Schema::create('CAN_almacen_responsable', function (Blueprint $table) {
               $table->id();
            $table->foreignId('almacen_id')->constrained('CAN_almacenes');
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('CAN_almacen_responsable');
    }
};
