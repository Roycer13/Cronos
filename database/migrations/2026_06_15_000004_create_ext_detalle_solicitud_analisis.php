<?php
// database/migrations/xxxx_xx_xx_create_ext_detalle_solicitud_analisis_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ext_detalle_solicitud_analisis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ext_solicitud_analisis_id')->constrained('ext_solicitud_analisis');
            $table->foreignId('producto_terminado_id')->nullable()->constrained('producto_terminados');
            $table->string('subcodigo')->nullable();
            $table->string('estado')->nullable(); 
            $table->date('fecha_muestreo')->nullable();
            $table->string('lote')->nullable();
            $table->date('fecha_elaboracion')->nullable();
            $table->date('fecha_vencimiento')->nullable();
            $table->foreignId('tipo_muestra_id')->nullable()->constrained('ext_tipo_muestra');
            $table->string('tipo_analisis')->nullable();
            $table->string('personal_ambiente_superficie')->nullable();
            $table->foreignId('estado_id')->nullable()->constrained('estados'); // Ajusta nombre tabla si es otro
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ext_detalle_solicitud_analisis');
    }
};