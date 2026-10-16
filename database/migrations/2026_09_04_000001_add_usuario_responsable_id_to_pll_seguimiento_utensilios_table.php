<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('PLL_seguimiento_utensilios', function (Blueprint $table) {
            $table->foreignId('responsable_id')
                ->nullable()
                ->after('user_id')
                ->constrained('users');
        });
    }

    public function down(): void
    {
        Schema::table('PLL_seguimiento_utensilios', function (Blueprint $table) {
            $table->dropForeign(['responsable_id']);
            $table->dropColumn('responsable_id');
        });
    }
};
