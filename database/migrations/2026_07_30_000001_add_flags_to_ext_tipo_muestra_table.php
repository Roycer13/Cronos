<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ext_tipo_muestra', function (Blueprint $table) {
            $table->boolean('mesofilos')->default(false)->after('aclaracion_unidad');
            $table->boolean('coliformes')->default(false)->after('mesofilos');
            $table->boolean('mohos')->default(false)->after('coliformes');
        });
    }

    public function down(): void
    {
        Schema::table('ext_tipo_muestra', function (Blueprint $table) {
            $table->dropColumn(['mesofilos', 'coliformes', 'mohos']);
        });
    }
};
