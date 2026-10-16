<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ext_tipo_muestra', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('norma_referencial');
            $table->foreignId('ubicacion_id')->nullable()->constrained('ubicaciones');
            $table->string('unidad')->nullable();
            $table->string('aclaracion_unidad')->nullable();
            $table->string('min_mes')->nullable();
            $table->integer('min_mes_exp')->nullable();
            $table->string('max_mes')->nullable();
            $table->integer('max_mes_exp')->nullable();
            $table->string('min_colTot')->nullable();
            $table->integer('min_colTot_exp')->nullable();
            $table->string('max_colTot')->nullable();
            $table->integer('max_colTot_exp')->nullable();
            $table->string('min_mohLev')->nullable();
            $table->integer('min_mohLev_exp')->nullable();
            $table->string('max_mohLev')->nullable();
            $table->integer('max_mohLev_exp')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ext_tipo_muestra');
    }
};