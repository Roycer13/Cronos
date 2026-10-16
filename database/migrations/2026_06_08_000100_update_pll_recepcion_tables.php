<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Agregar/actualizar columnas en PLL_recepcion_materia_primas
        Schema::table('PLL_recepcion_materia_primas', function (Blueprint $table) {
            // Eliminar columnas viejas que ya no se usan (si existen)
            $oldColumns = ['cantidad_recepcionada_kg_unid', 'cantidad_recepcionada_unidad_otro', 'peso_x10_g'];
            foreach ($oldColumns as $col) {
                if (Schema::hasColumn('PLL_recepcion_materia_primas', $col)) {
                    $table->dropColumn($col);
                }
            }

            // Agregar nuevas columnas
            if (!Schema::hasColumn('PLL_recepcion_materia_primas', 'registro_senasag')) {
                $table->string('registro_senasag', 100)->nullable();
            }
            if (!Schema::hasColumn('PLL_recepcion_materia_primas', 'cantidad_recepcionada_unidades')) {
                $table->decimal('cantidad_recepcionada_unidades', 10, 3)->nullable();
            }
            if (!Schema::hasColumn('PLL_recepcion_materia_primas', 'cantidad_recepcionada_unidad')) {
                $table->string('cantidad_recepcionada_unidad', 50)->nullable();
            }
            if (!Schema::hasColumn('PLL_recepcion_materia_primas', 'cantidad_recepcionada_peso_por_unidad_kg')) {
                $table->decimal('cantidad_recepcionada_peso_por_unidad_kg', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('PLL_recepcion_materia_primas', 'cantidad_recepcionada_total_kg')) {
                $table->decimal('cantidad_recepcionada_total_kg', 12, 3)->nullable();
            }
        });

        // 2. Agregar/actualizar columnas en PLL_recepcion_lotes
        Schema::table('PLL_recepcion_lotes', function (Blueprint $table) {
            // Eliminar columnas viejas
            $oldColumns = ['cantidad_recepcionada_kg_unid', 'peso_x10_g', 'nuevos_ingreso_almacenes'];
            foreach ($oldColumns as $col) {
                if (Schema::hasColumn('PLL_recepcion_lotes', $col)) {
                    $table->dropColumn($col);
                }
            }

            // Conservar ingreso_traspaso si no existe (debería existir)
            if (!Schema::hasColumn('PLL_recepcion_lotes', 'ingreso_traspaso')) {
                $table->string('ingreso_traspaso', 255)->nullable();
            }

            // Definir las columnas nuevas con sus definiciones [tipo, longitud, escala]
            $newColumns = [
                'cantidad_recepcionada_unidades'               => ['decimal', 10, 3],
                'cantidad_recepcionada_unidad'                 => ['string', 50, null],
                'cantidad_recepcionada_peso_por_unidad'        => ['decimal', 10, 2],
                'cantidad_recepcionada_peso_por_unidad_medida' => ['string', 50, null],
                'cantidad_recepcionada_total_kg'               => ['decimal', 12, 3],
                'tipo_material'                                => ['string', 100, null],
                'elementos_extraños'                           => ['text', null, null],
                'textura_apariencia'                           => ['string', 200, null],
                'sabor'                                        => ['string', 100, null],
                'impresion'                                    => ['string', 100, null],
                'color'                                        => ['string', 50, null],
                'olor'                                         => ['string', 50, null],
                'sellado'                                      => ['string', 100, null],
                'largo_total_cm'                               => ['decimal', 8, 2],
                'largo_plegado_cm'                             => ['decimal', 8, 2],
                'ancho_total_cm'                               => ['decimal', 8, 2],
                'ancho_plegado_cm'                             => ['decimal', 8, 2],
                'diametro_cm'                                  => ['decimal', 8, 2],
                'tamano_fuelle_cm'                             => ['decimal', 8, 2],
                'alto_cm'                                      => ['decimal', 8, 2],
                'espesor_micrones'                             => ['decimal', 10, 2],
                'temperatura_c'                                => ['decimal', 6, 2],
                'humedad_promedio'                             => ['decimal', 5, 2],
                'gluten_humedo_promedio'                       => ['decimal', 5, 2],
                'gluten_seco_desarrollo'                       => ['string', 100, null],
                'ph'                                           => ['decimal', 4, 2],
                'densidad'                                     => ['decimal', 8, 4],
                'grados_brix'                                  => ['decimal', 6, 2],
                'prueba_desarrollo'                            => ['string', 100, null],
                'prueba_inmersion_agua_promedio'               => ['decimal', 10, 2],
                'punto_fusion_promedio_c'                      => ['decimal', 8, 2],
                'ficha_tecnica_certificado'                    => ['string', 255, null],
                'conforme_no_conforme'                         => ['boolean', null, null],
                'observaciones'                                => ['text', null, null],
                'aceptado_rechazo'                             => ['string', 20, null],
                'observaciones_conformidad_rechazo'            => ['text', null, null],
                'nombre_conductor'                             => ['string', 150, null],
                'placa'                                        => ['string', 20, null],
                'tipo_movilidad'                               => ['string', 50, null],
                'estado_envase_carroceria'                     => ['string', 200, null],
                'estado_lote'                                  => ['string', 50, null],
            ];

            foreach ($newColumns as $column => $definition) {
                if (!Schema::hasColumn('PLL_recepcion_lotes', $column)) {
                    $type   = $definition[0];
                    $length = $definition[1] ?? null;
                    $scale  = $definition[2] ?? null;

                    switch ($type) {
                        case 'decimal':
                            $table->decimal($column, $length, $scale ?? 0)->nullable();
                            break;
                        case 'string':
                            $table->string($column, $length)->nullable();
                            break;
                        case 'text':
                            $table->text($column)->nullable();
                            break;
                        case 'boolean':
                            $table->boolean($column)->nullable();
                            break;
                    }
                }
            }

            // Agregar foreign key (solo si no existe la columna)
            if (!Schema::hasColumn('PLL_recepcion_lotes', 'nuevo_ingreso_almacen_id')) {
                $table->foreignId('nuevo_ingreso_almacen_id')
                    ->nullable()
                    ->constrained('PLL_almacen_materia_prima');
            }
        });
    }

    public function down(): void
    {
        Schema::table('PLL_recepcion_materia_primas', function (Blueprint $table) {
            $table->dropColumn([
                'registro_senasag',
                'cantidad_recepcionada_unidades',
                'cantidad_recepcionada_unidad',
                'cantidad_recepcionada_peso_por_unidad_kg',
                'cantidad_recepcionada_total_kg'
            ]);
        });

        Schema::table('PLL_recepcion_lotes', function (Blueprint $table) {
            // Eliminar primero la restricción de clave foránea
            $table->dropForeign(['nuevo_ingreso_almacen_id']);
            
            $table->dropColumn([
                'cantidad_recepcionada_unidades',
                'cantidad_recepcionada_unidad',
                'cantidad_recepcionada_peso_por_unidad',
                'cantidad_recepcionada_peso_por_unidad_medida',
                'cantidad_recepcionada_total_kg',
                'tipo_material',
                'elementos_extraños',
                'textura_apariencia',
                'sabor',
                'impresion',
                'color',
                'olor',
                'sellado',
                'largo_total_cm',
                'largo_plegado_cm',
                'ancho_total_cm',
                'ancho_plegado_cm',
                'diametro_cm',
                'tamano_fuelle_cm',
                'alto_cm',
                'espesor_micrones',
                'temperatura_c',
                'humedad_promedio',
                'gluten_humedo_promedio',
                'gluten_seco_desarrollo',
                'ph',
                'densidad',
                'grados_brix',
                'prueba_desarrollo',
                'prueba_inmersion_agua_promedio',
                'punto_fusion_promedio_c',
                'ficha_tecnica_certificado',
                'conforme_no_conforme',
                'observaciones',
                'aceptado_rechazo',
                'observaciones_conformidad_rechazo',
                'nombre_conductor',
                'placa',
                'tipo_movilidad',
                'estado_envase_carroceria',
                'estado_lote',
                'nuevo_ingreso_almacen_id'
            ]);
        });
    }
};