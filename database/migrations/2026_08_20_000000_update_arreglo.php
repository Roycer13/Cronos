<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Índices para PLL_analisis_linea
        $this->createIndexIfNotExists('PLL_analisis_linea', 'pll_analisis_linea_created_at_index', 'created_at');
        $this->createIndexIfNotExists('PLL_analisis_linea', 'pll_analisis_linea_updated_at_index', 'updated_at');

        // Índices para orps
        $this->createIndexIfNotExists('orps', 'orps_fecha_vencimiento1_index', 'fecha_vencimiento1');

        // Índices para orp_estados
        $this->createIndexIfNotExists('orp_estados', 'orp_estados_fecha_hora_index', 'fecha_hora');

        // Índices para lineas
        $this->createIndexIfNotExists('lineas', 'lineas_nombre_index', 'nombre');

        // Índices para destinos (si existe la tabla)
        $this->createIndexIfNotExists('destinos', 'destinos_nombre_index', 'nombre');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('PLL_estado_plantas', function (Blueprint $table) {
            $table->dropIndex(['origen_id']);
        });

        Schema::table('PLL_analisis_linea', function (Blueprint $table) {
            $table->dropIndex(['estado_planta_id']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['updated_at']);
        });

        Schema::table('PLL_estado_detalles', function (Blueprint $table) {
            $table->dropIndex(['estado_planta_id']);
            $table->dropIndex(['orp_id']);
        });

        Schema::table('orps', function (Blueprint $table) {
            $table->dropIndex(['ubicacion_id']);
            $table->dropIndex(['producto_terminado_id']);
            $table->dropIndex(['fecha_vencimiento1']);
        });

        Schema::table('orp_estados', function (Blueprint $table) {
            $table->dropIndex(['orp_id']);
            $table->dropIndex(['estado_id']);
            $table->dropIndex(['fecha_hora']);
        });

        Schema::table('producto_terminados', function (Blueprint $table) {
            $table->dropIndex(['linea_id']);
            $table->dropIndex(['destino_id']);
        });

        Schema::table('lineas', function (Blueprint $table) {
            $table->dropIndex(['nombre']);
        });

        if (Schema::hasTable('destinos')) {
            Schema::table('destinos', function (Blueprint $table) {
                $table->dropIndex(['nombre']);
            });
        }
    }
    private function createIndexIfNotExists(string $table, string $indexName, string $column): void
    {
        $query = "IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = '{$indexName}' AND object_id = OBJECT_ID('{$table}'))
                  CREATE INDEX {$indexName} ON {$table} ({$column});";

        DB::statement($query);
    }
};
