<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasIndex('orp_estados', 'orp_estados_orp_fecha_index')) {
            Schema::table('orp_estados', function (Blueprint $table) {
                $table->index(['orp_id', 'fecha_hora'], 'orp_estados_orp_fecha_index');
            });
        }

        if (!Schema::hasIndex('PLL_estado_plantas', 'pll_estado_plantas_origen_id_latest_index')) {
            Schema::table('PLL_estado_plantas', function (Blueprint $table) {
                $table->index(['origen_id', 'id'], 'pll_estado_plantas_origen_id_latest_index');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasIndex('orp_estados', 'orp_estados_orp_fecha_index')) {
            Schema::table('orp_estados', function (Blueprint $table) {
                $table->dropIndex('orp_estados_orp_fecha_index');
            });
        }

        if (Schema::hasIndex('PLL_estado_plantas', 'pll_estado_plantas_origen_id_latest_index')) {
            Schema::table('PLL_estado_plantas', function (Blueprint $table) {
                $table->dropIndex('pll_estado_plantas_origen_id_latest_index');
            });
        }
    }
};