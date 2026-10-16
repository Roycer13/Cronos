<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('PLL_recepcion_materia_primas', function (Blueprint $table) {
            $table->foreignId('estado_analisis_id')
                ->nullable()
                ->constrained('estados');

            $table->decimal('dilucion', 8, 4)->nullable();

            $table->string('plan_muestreo')->nullable();
            $table->string('nivel_inspeccion')->nullable();
            $table->string('nca')->nullable();          // El nombre puede ir en mayúsculas
            $table->string('cantidad_preliminar')->nullable();

            $table->dateTime('tiempo_analisis')->nullable();
            $table->foreignId('analista_id')
                ->nullable()
                ->constrained('users');
            $table->string('observaciones_analisis')->nullable();
            $table->string('correcciones_analisis')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('PLL_recepcion_materia_primas', function (Blueprint $table) {
            $table->dropForeign(['estado_analisis_id']);
            $table->dropColumn([
                'estado_analisis_id',
                'dilucion',
                'plan_muestreo',
                'nivel_inspeccion',
                'NCA',
                'cantidad_preliminar',
                'tiempo_analisis',
                'analista_id',
                'observaciones_analisis',
                'correcciones_analisis'
            ]);
        });
    }
};
