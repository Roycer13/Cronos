<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pll_servicio_frios', function (Blueprint $table) {
            $table->id();
            $table->dateTime('tiempo');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->foreignId('lugar_id')->nullable()->constrained('PLL_lugar_control_temperaturas');
            $table->decimal('display1', 5, 2)->nullable();
            $table->decimal('display2', 5, 2)->nullable();
            $table->decimal('display3', 5, 2)->nullable();
            $table->decimal('termometro_mano', 5, 2)->nullable();
            $table->boolean('separacion_pared')->default(true)->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pll_servicio_frios');
    }
};