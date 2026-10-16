<?php
// database/migrations/xxxx_xx_xx_create_ext_agua_fisico_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ext_agua_fisico', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ext_detalle_solicitud_analisis_id')->constrained('ext_detalle_solicitud_analisis');
            $table->string('estado')->nullable(); 
            $table->date('fecha')->nullable();
            $table->decimal('ph', 8, 2)->nullable();
            $table->decimal('dureza', 8, 2)->nullable();
            $table->decimal('cloruros', 8, 2)->nullable();
            $table->decimal('conductividad', 8, 2)->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ext_agua_fisico');
    }
};