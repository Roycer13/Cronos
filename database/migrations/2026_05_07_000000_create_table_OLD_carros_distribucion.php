<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
Schema::create('old_distribucion_carros', function (Blueprint $table) {
    $table->id();
    $table->dateTime('fecha');
    $table->foreignId('user')->nullable()->constrained('users')->nullOnDelete();
    $table->string('destino')->nullable();
    $table->string('placa')->nullable();
    $table->boolean('paredes_externas')->default(true);
    $table->boolean('limpieza_interno')->default(true);
    $table->boolean('ausencia_objetos_olores')->default(true);
    $table->boolean('ausenci_objetos y olores')->default(true);
    
    $table->decimal('set_temperatura');

    $table->boolean('bph_chofer')->default(true);
    $table->boolean('bph_ayudante')->default(true);

    

  
    $table->text('observaciones')->nullable();
    $table->text('correciones')->nullable();

    $table->timestamps();
});
    }

    public function down(): void
    {
        Schema::dropIfExists('old_distribucion_carros');
    }
};
