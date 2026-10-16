<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('PLL_detalle_arranque_linea', function (Blueprint $table) {
            $table->string('inicio_final', 20)->default('inicio')->after('numero');
        });
    }

    public function down(): void
    {
        Schema::table('PLL_detalle_arranque_linea', function (Blueprint $table) {
            $table->dropColumn('inicio_final');
        });
    }
};
