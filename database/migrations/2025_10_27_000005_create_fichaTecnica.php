<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::create('ficha_tecnicas', function (Blueprint $table) {
    $table->id();
    $table->foreignId('producto_terminado_id')->unique()->constrained('producto_terminados'); // ✅ Corregido
    $table->string('version', 20)->default('0.0');
    $table->foreignId('version_anterior_id')->nullable()->constrained('ficha_tecnicas'); // ✅ Corregido
    $table->foreignId('usuario_aprobador_id')->nullable()->constrained('users');
    $table->text('descripcion_producto')->nullable();
    $table->string('presentacion', 255)->nullable();
    $table->text('ingredientes')->nullable(); // ✅ Cambiado a nullable
    $table->text('aditivos')->nullable();
    $table->text('alergenos')->nullable();
    $table->text('observaciones')->nullable();
    $table->boolean('aprobado')->default(false);
    $table->string('sabor', 20)->nullable();
    $table->string('color', 20)->nullable();
    $table->string('textura', 20)->nullable();
    $table->string('olor', 20)->nullable();
    $table->text('almacenamiento_recomendado')->nullable();
    $table->boolean('refrigerado')->default(false);
    $table->boolean('congelado')->default(false);
    $table->string('apilamiento_maximo', 100)->nullable();
    $table->integer('vida_util_dias');
    $table->integer('vida_util_alertas_dias')->default(30);
    $table->string('imagen_url', 255)->nullable();
    $table->timestamps();
    $table->softDeletes();
});
    }

    public function down()
    {
        Schema::dropIfExists('ficha_tecnicas');
    }
};
