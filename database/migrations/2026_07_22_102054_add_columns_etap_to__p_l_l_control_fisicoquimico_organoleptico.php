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
        Schema::table('PLL_control_fisicoquimico_organoleptico', function (Blueprint $table) {
             $table->string('color_etap')->default('normal')->after('aspecto');
            $table->string('olor_etap')->default('normal')->after('color_etap');
            $table->string('sabor_etap')->default('normal')->after('olor_etap');
            $table->string('aspecto_etap')->default('normal')->after('sabor_etap');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('PLL_control_fisicoquimico_organoleptico', function (Blueprint $table) {
            //
             $table->dropColumn([
                'color_etap',
                'olor_etap',
                'sabor_etap',
                'aspecto_etap'
            ]);
        });
    }
};
