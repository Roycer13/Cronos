<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('agua_helada', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ubicacion_id')->constrained('ubicaciones');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->dateTime('fecha')->useCurrent();
            $table->decimal('p1_dir', 5, 2)->nullable();
            $table->decimal('p2_d1', 5, 2)->nullable();
            $table->decimal('p3_d2', 5, 2)->nullable();
            $table->decimal('p4_dir', 5, 2)->nullable();
            $table->decimal('p5_dir', 5, 2)->nullable();
            $table->decimal('p6_d3', 5, 2)->nullable();
            $table->decimal('p7_dir', 5, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('agua_helada');
    }
};