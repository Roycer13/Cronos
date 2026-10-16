<?php
// database/migrations/xxxx_xx_xx_create_ext_solicitud_analisis_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ext_solicitud_analisis', function (Blueprint $table) {
            $table->id();
            $table->dateTime('tiempo');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->foreignId('ubicacion_id')->nullable()->constrained('ubicaciones');
            $table->string('codigo')->unique()->nullable();
            $table->string('estado')->nullable(); 
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ext_solicitud_analisis');
    }
};