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
        Schema::table('higiene_personales', function (Blueprint $table) {
            $table->boolean('lavado_manos')->default(true)->after('limpieza');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('higiene_personales', function (Blueprint $table) {
            $table->dropColumn('lavado_manos');
        });
    }
};
