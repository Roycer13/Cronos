<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::create('producto_terminados', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_sap', 50)->unique();
            $table->string('codigo_interno', 50)->nullable();
            $table->string('nombre_sap', 100)->nullable();
            $table->string('nombre_comercial', 150)->nullable(); // ✅ Cambiado a nullable
            $table->string('descripcion_comercial', 255)->nullable();
            $table->text('descripcion_tecnica')->nullable();
            $table->foreignId('ubicacion_id')->constrained('ubicaciones');
            $table->foreignId('categoria_producto_id')->constrained('categoria_productos'); // ✅ Corregido
            $table->foreignId('subcategoria_producto_id')->constrained('subcategoria_productos'); // ✅ Corregido
            $table->foreignId('linea_id')->constrained('lineas')->nullable(); // ✅ Corregido
            $table->foreignId('destino_id')->constrained('destinos')->nullable();
            $table->decimal('cantidad_neto', 10, 3)->nullable();
            $table->foreignId('unidad_id')->nullable()->constrained('unidades');
            $table->decimal('cantidad_bruto', 10, 3)->nullable();
            $table->foreignId('estado_id')->constrained('estados');
            $table->foreignId('usuario_creador_id')->nullable()->constrained('users');
            $table->foreignId('usuario_modificador_id')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('producto_terminados');
    }
};
