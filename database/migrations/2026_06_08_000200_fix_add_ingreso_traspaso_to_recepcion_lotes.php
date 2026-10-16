<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Fix: ingreso_traspaso was dropped and re-added in the same Schema::table()
     * closure in the previous migration, causing the add to be skipped.
     */
    public function up(): void
    {
        Schema::table('PLL_recepcion_lotes', function (Blueprint $table) {
            if (!Schema::hasColumn('PLL_recepcion_lotes', 'ingreso_traspaso')) {
                $table->string('ingreso_traspaso', 255)->nullable()->after('nuevo_ingreso_almacen_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('PLL_recepcion_lotes', function (Blueprint $table) {
            if (Schema::hasColumn('PLL_recepcion_lotes', 'ingreso_traspaso')) {
                $table->dropColumn('ingreso_traspaso');
            }
        });
    }
};
