<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('infraestructuras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ubicacion_id')->constrained('ubicaciones');
            $table->string('nombre');
            $table->string('nivel')->nullable();
            $table->integer('periodicidad_dias')->default(30);
            $table->timestamp('ultima_inspeccion')->nullable();

            $table->boolean('usa_pisos')->default(false);
            $table->boolean('usa_paredes')->default(false);
            $table->boolean('usa_techos')->default(false);
            $table->boolean('usa_puertas')->default(false);
            $table->boolean('usa_ventanas')->default(false);
            $table->boolean('usa_drenajes')->default(false);
            $table->boolean('usa_iluminacion')->default(false);
            $table->boolean('usa_ventilacion')->default(false);
            $table->boolean('usa_lavamanos')->default(false);
            $table->boolean('usa_servicios_sanitarios')->default(false);
            $table->boolean('usa_almacenamiento')->default(false);
            $table->boolean('usa_senalizacion')->default(false);

            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('infraestructuras');
    }
};