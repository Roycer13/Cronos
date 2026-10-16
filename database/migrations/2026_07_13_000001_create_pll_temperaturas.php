<?php
// database/migrations/xxxx_xx_xx_create_pll_temperaturas_almacen_congelador_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pll_temperaturas_almacen_congelador', function (Blueprint $table) {
            $table->id();
            $table->dateTime('tiempo');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->foreignId('lugar_id')->nullable()->constrained('PLL_lugar_control_temperaturas');
            $table->decimal('temperatura', 5, 2)->nullable();
            $table->decimal('humedad', 5, 2)->nullable();
            $table->boolean('ident')->default(true);
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pll_temperaturas_almacen_congelador');
    }
};