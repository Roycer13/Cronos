<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('PLL_arranque_linea', function (Blueprint $table) {
            $table->string('CIP')->nullable()->after('observacion');
        });
    }

    public function down(): void
    {
        Schema::table('PLL_arranque_linea', function (Blueprint $table) {
            $table->dropColumn('CIP');
        });
    }
};
