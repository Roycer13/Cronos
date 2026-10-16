<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dotacion_guantes', function (Blueprint $table) {
            $table->renameColumn('amarillo', 'amarillo_naranja');
            $table->renameColumn('rojo', 'azul');
            $table->renameColumn('otros', 'alta_temperatura');
            $table->dateTime('tiempo_devolucion')->nullable()->after('tiempo');
            $table->foreignId('estado_id')->nullable()->constrained('estados')->after('tiempo_devolucion');
        });
    }

    public function down(): void
    {
        Schema::table('dotacion_guantes', function (Blueprint $table) {
            $table->dropForeign(['estado_id']);
            $table->dropColumn('estado_id');
            $table->dropColumn('tiempo_devolucion');
            $table->renameColumn('amarillo_naranja', 'amarillo');
            $table->renameColumn('azul', 'rojo');
            $table->renameColumn('alta_temperatura', 'otros');
        });
    }
};
