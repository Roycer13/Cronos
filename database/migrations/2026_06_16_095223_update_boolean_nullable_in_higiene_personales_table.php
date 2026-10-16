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
            //

            $table->boolean('uniforme')->nullable()->change();
            $table->boolean('limpieza')->nullable()->change();
            $table->boolean('salud')->nullable()->change();
            $table->boolean('epp')->nullable()->change();
            $table->boolean('objetos')->nullable()->change();
            $table->boolean('material_equipo')->nullable()->change();
            $table->boolean('conforme')->nullable()->change();
            $table->boolean('lavado_manos')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
           Schema::table('higiene_personales', function (Blueprint $table) {
            // Revertimos: volvemos a poner NOT NULL y el default true
            $table->boolean('uniforme')->default(true)->change();
            $table->boolean('limpieza')->default(true)->change();
            $table->boolean('salud')->default(true)->change();
            $table->boolean('epp')->default(true)->change();
            $table->boolean('objetos')->default(true)->change();
            $table->boolean('material_equipo')->default(true)->change();
            $table->boolean('conforme')->default(true)->change();
            $table->boolean('lavado_manos')->default(true)->change();
        });
    }
};
