<?php
// database/migrations/xxxx_xx_xx_create_ext_verifiacion_equipo_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ext_verifiacion_equipo', function (Blueprint $table) {
            $table->id();
            $table->dateTime('fecha');
            $table->string('sal_1')->nullable();
            $table->decimal('temperatura_1', 8, 2)->nullable();
            $table->decimal('por_hum_rel_1', 8, 2)->nullable();
            $table->decimal('act_agua_1', 8, 2)->nullable();
            $table->string('sal_2')->nullable();
            $table->decimal('temperatura_2', 8, 2)->nullable();
            $table->decimal('por_hum_rel_2', 8, 2)->nullable();
            $table->decimal('act_agua_2', 8, 2)->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ext_verifiacion_equipo');
    }
};