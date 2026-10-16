<?php
// database/migrations/xxxx_xx_xx_create_pll_temperaturas_almacen_congelador_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('PLL_lugar_control_temperaturas', function (Blueprint $table) {
            
                $table->id();
                $table->string('nombre');
                $table->string('tipo')->nullable();
                $table->string('alias')->nullable();
                $table->boolean('estado')->default(true);
                $table->timestamps();
            
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('PLL_lugar_control_temperaturas');
    }
};
