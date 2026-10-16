<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('infraestructuras', function (Blueprint $table) {
            $table->boolean('usa_maquina_equipo')->default(false)->after('usa_senalizacion');
            $table->boolean('usa_extra')->default(false)->after('usa_maquina_equipo');
        });

        Schema::table('inspeccion_infraestructuras', function (Blueprint $table) {
            $table->boolean('maquina_equipo_ok')->nullable()->after('senalizacion_ok');
            $table->text('maquina_equipo_observacion')->nullable()->after('maquina_equipo_ok');
            $table->boolean('extra_ok')->nullable()->after('maquina_equipo_observacion');
            $table->text('extra_observacion')->nullable()->after('extra_ok');
        });
    }

    public function down(): void {
        Schema::table('inspeccion_infraestructuras', function (Blueprint $table) {
            $table->dropColumn(['extra_ok', 'extra_observacion', 'maquina_equipo_ok', 'maquina_equipo_observacion']);
        });

        Schema::table('infraestructuras', function (Blueprint $table) {
            $table->dropColumn(['usa_maquina_equipo', 'usa_extra']);
        });
    }
};
