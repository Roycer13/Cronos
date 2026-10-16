<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('PLL_detalle_arranque_linea', function (Blueprint $table) {
            $table->string('inicio_final', 20)->nullable()->change();
        });

        DB::table('PLL_detalle_arranque_linea')
            ->where('numero', 1)
            ->whereRaw("LOWER(inicio_final) = 'inicio'")
            ->update(['inicio_final' => 'INICIO']);

        DB::table('PLL_detalle_arranque_linea')
            ->where('numero', '>', 1)
            ->whereRaw("LOWER(inicio_final) = 'inicio'")
            ->update(['inicio_final' => null]);
    }

    public function down(): void
    {
        DB::table('PLL_detalle_arranque_linea')
            ->where('inicio_final', 'INICIO')
            ->update(['inicio_final' => 'inicio']);

        Schema::table('PLL_detalle_arranque_linea', function (Blueprint $table) {
            $table->string('inicio_final', 20)->default('inicio')->nullable(false)->change();
        });
    }
};
