<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::create('orps', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 50)->unique();
            $table->foreignId('producto_terminado_id')->constrained('producto_terminados');
            $table->decimal('lote', 20, 6);
            $table->string('prioridad', 20)->nullable();
            $table->decimal('cantidad_programada', 10, 2)->nullable();
            $table->decimal('cantidad_producida', 10, 2)->default(0);
            $table->foreignId('unidad_id')->nullable()->constrained('unidades');
            $table->integer('tiempo_elaboracion')->nullable();

            $table->boolean('revisado')->default(false);
            $table->foreignId('revisor_id')->nullable()->constrained('users');
            $table->dateTime('fecha_revision')->nullable();

            $table->foreignId('usuario_creador_id')->constrained('users');
            $table->dateTime('fecha_creacion');
            $table->foreignId('usuario_modificador_id')->nullable()->constrained('users');

            $table->date('fecha_vencimiento1')->nullable();
            $table->date('fecha_vencimiento2')->nullable();
            $table->text('notas_internas')->nullable();

            $table->foreignId('ubicacion_id')->constrained('ubicaciones');
            $table->text('observaciones')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('orps');
    }
};
