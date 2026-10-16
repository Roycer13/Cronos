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
        Schema::table('PLL_recepcion_materia_primas', function (Blueprint $table) {
            if (!Schema::hasColumn('PLL_recepcion_materia_primas', 'estado_revision_id')) {
                $table->foreignId('estado_revision_id')->nullable()->constrained('estados');
            }

            if (!Schema::hasColumn('PLL_recepcion_materia_primas', 'revisor_id')) {
                $table->foreignId('revisor_id')->nullable()->constrained('users');
            }
        });

        // Opcional: establecer estado "Pendiente" por defecto en registros nuevos.
        // No asumimos un id fijo; dejamos nulos para registros existentes y el servicio se encargará de asignarlo al crear.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('PLL_recepcion_materia_primas', function (Blueprint $table) {
            if (Schema::hasColumn('PLL_recepcion_materia_primas', 'estado_revision_id')) {
                $table->dropForeign(['estado_revision_id']);
                $table->dropColumn('estado_revision_id');
            }

            if (Schema::hasColumn('PLL_recepcion_materia_primas', 'revisor_id')) {
                $table->dropForeign(['revisor_id']);
                $table->dropColumn('revisor_id');
            }
        });
    }
};
