<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('inspeccion_infraestructuras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ubicacion_id')->constrained('ubicaciones');
            $table->foreignId('infraestructura_id')->constrained('infraestructuras');
            $table->foreignId('user_id')->constrained('users');
            $table->dateTime('fecha');

            $table->boolean('pisos_ok')->nullable();
            $table->text('pisos_observacion')->nullable();
            $table->boolean('paredes_ok')->nullable();
            $table->text('paredes_observacion')->nullable();
            $table->boolean('techos_ok')->nullable();
            $table->text('techos_observacion')->nullable();
            $table->boolean('puertas_ok')->nullable();
            $table->text('puertas_observacion')->nullable();
            $table->boolean('ventanas_ok')->nullable();
            $table->text('ventanas_observacion')->nullable();
            $table->boolean('drenajes_ok')->nullable();
            $table->text('drenajes_observacion')->nullable();
            $table->boolean('iluminacion_ok')->nullable();
            $table->text('iluminacion_observacion')->nullable();
            $table->boolean('ventilacion_ok')->nullable();
            $table->text('ventilacion_observacion')->nullable();
            $table->boolean('lavamanos_ok')->nullable();
            $table->text('lavamanos_observacion')->nullable();
            $table->boolean('servicios_sanitarios_ok')->nullable();
            $table->text('servicios_sanitarios_observacion')->nullable();
            $table->boolean('almacenamiento_ok')->nullable();
            $table->text('almacenamiento_observacion')->nullable();
            $table->boolean('senalizacion_ok')->nullable();
            $table->text('senalizacion_observacion')->nullable();

            $table->text('observacion_general')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('inspeccion_infraestructuras');
    }
};