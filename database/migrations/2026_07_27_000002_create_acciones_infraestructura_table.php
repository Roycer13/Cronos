<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('acciones_infraestructura', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ubicacion_id')->constrained('ubicaciones');
            $table->foreignId('inspeccion_infraestructura_id')->constrained('inspeccion_infraestructuras');
            $table->string('criterio');
            $table->text('descripcion');
            $table->string('tipo_accion')->nullable();
            $table->string('responsable')->nullable();
            $table->date('fecha_ejecucion')->nullable();
            $table->string('estado')->default('Pendiente');
            $table->string('referencia')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('acciones_infraestructura');
    }
};