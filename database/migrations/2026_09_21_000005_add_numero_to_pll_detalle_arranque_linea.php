<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('PLL_detalle_arranque_linea', function (Blueprint $table) {
            $table->unsignedInteger('numero')->default(1)->after('origen_id');
            $table->dateTime('tiempo')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('PLL_detalle_arranque_linea', function (Blueprint $table) {
            $table->dateTime('tiempo')->nullable(false)->change();
            $table->dropColumn('numero');
        });
    }
};
