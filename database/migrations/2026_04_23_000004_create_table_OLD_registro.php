<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('old_registros', function (Blueprint $table) {
            $table->id();
            $table->dateTime('tiempo_realizado')->nullable();
            $table->dateTime('tiempo_verificado')->nullable();

            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->foreignId('revisor_id')->nullable()->constrained('users');
           
            $table->foreignId('old_item_id')->nullable()->constrained('old_items');

             $table->boolean('orden')->default(false);
            $table->boolean('limpieza')->default(false);
            $table->boolean('desinfeccion')->default(false);

            $table->string('observacion')->nullable();
            $table->string('correcion')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('old_registros');
    }
};
