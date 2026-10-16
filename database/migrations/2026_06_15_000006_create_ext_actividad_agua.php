<?php
// database/migrations/xxxx_xx_xx_create_ext_actividad_agua_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ext_actividad_agua', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ext_detalle_solicitud_analisis_id')->constrained('ext_detalle_solicitud_analisis');
            $table->string('estado')->nullable(); 
            $table->foreignId('ext_verificacion_equipo_id')->nullable()->constrained('ext_verifiacion_equipo'); // nota el nombre de la tabla real
            $table->date('fecha')->nullable();
            $table->decimal('temperatura', 8, 2)->nullable();
            $table->decimal('por_hum_rel', 8, 2)->nullable();
            $table->decimal('act_agua', 8, 2)->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ext_actividad_agua');
    }
};