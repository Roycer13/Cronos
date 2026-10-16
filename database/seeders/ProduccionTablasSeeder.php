<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Domain\ModulosComunes\Productos\Models\CategoriaProducto;
use App\Domain\ModulosComunes\Productos\Models\SubcategoriaProducto;
use App\Domain\ModulosComunes\Productos\Models\Linea;
use App\Domain\ModulosComunes\Productos\Models\Destino;
use App\Domain\ModulosComunes\Productos\Models\ProductoTerminado;
use Illuminate\Support\Facades\DB;

class ProduccionTablasSeeder extends Seeder
{
    public function run(): void



    {



    DB::table('PLL_estado_plantas')->insert([
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 1, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 2, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 3, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 4, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 5, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 6, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 7, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 8, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 9, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 10, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 11, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 12, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 13, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 14, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 15, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 16, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 17, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 18, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 19, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 20, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 21, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 22, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 23, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 24, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 25, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 26, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 27, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 28, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 29, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 30, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 31, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 32, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 33, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 34, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 35, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 36, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 37, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 38, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 39, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 40, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 41, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 42, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 43, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 44, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 45, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 46, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 47, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 48, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 49, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 50, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 51, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 52, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 53, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 54, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
            ['tiempo' => now(), 'user_id' => 2, 'origen_id' => 55, 'proceso_id' => 30, 'etapa_id' => null,'created_at' => now(), 'updated_at' => now(),],
        ]);

        // Vaciar tablas en orden inverso (si es necesario)
        $dbDriver = config('database.connections.' . config('database.default') . '.driver');
        if ($dbDriver === 'sqlsrv') {
            DB::statement('SET IDENTITY_INSERT categoria_productos OFF');
            DB::statement('SET IDENTITY_INSERT subcategoria_productos OFF');
        }


        // Insertar líneas primero
        $lineas = [
            ['nombre' => 'UHT','codigo' => 'LIN-0001', 'descripcion' => 'Tecnologia de ultrapasteurizado', 'ubicacion_id' => 1, 'estado_id' => 1],
            ['nombre' => 'HTST','codigo' => 'LIN-0002', 'descripcion' => 'Tecnologia de pasteurizado', 'ubicacion_id' => 1, 'estado_id' => 1],
        ];

        foreach ($lineas as $linea) {
            Linea::firstOrCreate(
                ['codigo' => $linea['codigo']],
                $linea
            );
        }

        // Insertar categorías usando firstOrCreate para evitar duplicados
        $categoriasData = [
            ['codigo' => 'CP-LAC-01', 'nombre' => 'Lacteas', 'descripcion' => NULL, 'ubicacion_id' => 1, 'estado_id' => 1],
            ['codigo' => 'CP-LAC-02', 'nombre' => 'Jugos', 'descripcion' => NULL, 'ubicacion_id' => 1, 'estado_id' => 1],
            ['codigo' => 'CP-LAC-03', 'nombre' => 'Leches', 'descripcion' => NULL, 'ubicacion_id' => 1, 'estado_id' => 1],
            ['codigo' => 'CP-LAC-04', 'nombre' => 'Yogurts', 'descripcion' => NULL, 'ubicacion_id' => 1, 'estado_id' => 1],
            ['codigo' => 'CP-LAC-05', 'nombre' => 'Queso', 'descripcion' => NULL, 'ubicacion_id' => 1, 'estado_id' => 1],
            ['codigo' => 'CP-LAC-06', 'nombre' => 'Aguas', 'descripcion' => NULL, 'ubicacion_id' => 1, 'estado_id' => 1],
        ];

        $categorias = [];
        foreach ($categoriasData as $catData) {
            $categoria = CategoriaProducto::firstOrCreate(
                ['codigo' => $catData['codigo']],
                $catData
            );
            $categorias[$catData['codigo']] = $categoria->id;
        }

        // Insertar subcategorías usando las categorías creadas de esta lista

        $subcategoriasData = [
            ['codigo' => 'SCP-001', 'nombre' => 'Bebidas Lácteas', 'descripcion' => 'leche pura', 'categoria_codigo' => 'CP-LAC-01'],
            ['codigo' => 'SCP-002', 'nombre' => 'Jugos', 'descripcion' => 'jugos naturales', 'categoria_codigo' => 'CP-LAC-02'],
            ['codigo' => 'SCP-003', 'nombre' => 'Leches de Almendras', 'descripcion' => 'leche de almendras', 'categoria_codigo' => 'CP-LAC-03'],
            ['codigo' => 'SCP-004', 'nombre' => 'Leche de Soya', 'descripcion' => 'leche de soya', 'categoria_codigo' => 'CP-LAC-03'],
            ['codigo' => 'SCP-005', 'nombre' => 'Leches', 'descripcion' => '', 'categoria_codigo' => 'CP-LAC-03'],
            ['codigo' => 'SCP-006', 'nombre' => 'Leches con Ingredientes', 'descripcion' => '', 	'categoria_codigo' => 	'CP-LAC-03'],
            ['codigo' => 'SCP-007', 'nombre' => 'Leches Saborizadas', 'descripcion' => '', 'categoria_codigo' => 'CP-LAC-03'],
            ['codigo' => 'SCP-008', 'nombre' => 'Néctares', 'descripcion' => '', 'categoria_codigo' => 'CP-LAC-02'],
            ['codigo' => 'SCP-009', 'nombre' => 'Queso', 'descripcion' => '', 'categoria_codigo' => 'CP-LAC-05'],
            ['codigo' => 'SCP-010', 'nombre' => 'Simil Yogurt', 'descripcion' => '', 'categoria_codigo' => 'CP-LAC-01'],
            ['codigo' => 'SCP-011', 'nombre' => 'Yogurt Ambiente', 'descripcion' => '', 'categoria_codigo' => 'CP-LAC-04'],
            ['codigo' => 'SCP-012', 'nombre' => 'Yogurt Botella', 'descripcion' => '', 'categoria_codigo' => 'CP-LAC-04'],
            ['codigo' => 'SCP-013', 'nombre' => 'Yogurt con Ingredientes', 'descripcion' => '', 'categoria_codigo' => 'CP-LAC-04'],
            ['codigo' => 'SCP-014', 'nombre' => 'Gelatina', 'descripcion' => '', 'categoria_codigo' => 'CP-LAC-02'],
            ['codigo' => 'SCP-015', 'nombre' => 'Yogurt Saborizado', 'descripcion' => '', 'categoria_codigo' => 'CP-LAC-04'],
            ['codigo' => 'SCP-016', 'nombre' => 'Bebidas Lácteas UHT', 'descripcion' => '', 'categoria_codigo' => 'CP-LAC-03'],
            ['codigo' => 'SCP-017', 'nombre' => 'SOYA CON INGREDIENTES', 'descripcion' => '', 'categoria_codigo' => 'CP-LAC-03'],
            ['codigo' => 'SCP-0018', 'nombre' => 'Por Definir', 'descripcion' => '', 'categoria_codigo' => 'CP-LAC-01'],
        ];

        $subcategorias = [];
        foreach ($subcategoriasData as $subcatData) {
            $subcategoria = SubcategoriaProducto::firstOrCreate(
                ['codigo' => $subcatData['codigo']],
                [
                    'nombre' => $subcatData['nombre'],
                    'descripcion' => $subcatData['descripcion'],
                    'categoria_id' => $categorias[$subcatData['categoria_codigo']] ?? null,
                ]
            );
            $subcategorias[$subcatData['codigo']] = $subcategoria->id;
        }

        // Insertar destinos
        $destinosData = [
            ['codigo' => 'DES-0001', 'nombre' => 'Comerciales', 'descripcion' => 'Productos que irán directamente al comercio (Supermercado, tiendas, mayoristas, etc)', 'ubicacion_id' => 1, 'estado_id' => 1],
            ['codigo' => 'DES-0002', 'nombre' => 'Subsidio', 'descripcion' => '-', 'ubicacion_id' => 1, 'estado_id' => 1],
            ['codigo' => 'DES-0003', 'nombre' => 'DE - Achocalla', 'descripcion' => 'Desayuno escolar - Achocalla', 'ubicacion_id' => 1, 'estado_id' => 1],
            ['codigo' => 'DES-0004', 'nombre' => 'DE - El Alto', 'descripcion' => 'Desayuno escolar - El Alto', 'ubicacion_id' => 1, 'estado_id' => 1],
            ['codigo' => 'DES-0005', 'nombre' => 'DE - Oruro', 'descripcion' => 'Desayuno escolar - Oruro', 'ubicacion_id' => 1, 'estado_id' => 1],
            ['codigo' => 'DES-0006', 'nombre' => 'DE - Sacaba', 'descripcion' => 'Desayuno escolar - Sacaba', 'ubicacion_id' => 1, 'estado_id' => 1],
            ['codigo' => 'DES-0007', 'nombre' => 'DE - Cochabamba', 'descripcion' => 'Desayuno escolar - Cochabamba', 'ubicacion_id' => 1, 'estado_id' => 1],
            ['codigo' => 'DES-0008', 'nombre' => 'DE - La Paz', 'descripcion' => 'Desayuno escolar - La Paz', 'ubicacion_id' => 1, 'estado_id' => 1],
            ['codigo' => 'DES-0009', 'nombre' => 'DE - Genérico', 'descripcion' => 'Desayuno escolar - Genérico', 'ubicacion_id' => 1, 'estado_id' => 1],
            ['codigo' => 'DES-0010', 'nombre' => 'DE - Varios Municipio', 'descripcion' => 'Desayuno escolar - Varios Municipio', 'ubicacion_id' => 1, 'estado_id' => 1],
            ['codigo' => 'DES-0011', 'nombre' => 'DE - Santa Cruz', 'descripcion' => 'Desayuno escolar - Santa Cruz', 'ubicacion_id' => 1, 'estado_id' => 1],
        ];

        $destinos = [];
        foreach ($destinosData as $destData) {
            $destino = Destino::firstOrCreate(
                ['codigo' => $destData['codigo']],
                $destData
            );
            $destinos[$destData['codigo']] = $destino->id;
        }

        // Insertar productos terminados usando los IDs obtenidos
        $productosTerminadosData = [
            [
                'codigo_sap' => 'PT-0001',
                'codigo_interno' => 'INT-0001',
                'nombre_sap' => 'Leche UHT 1L',
                'nombre_comercial' => 'Leche Entera UHT 1 Litro',
                'descripcion_comercial' => 'Leche entera ultrapasteurizada en envase de 1 litro',
                'descripcion_tecnica' => 'Leche ultrapasteurizada con 3.5% de grasa',
                'ubicacion_id' => 1,
                'categoria_producto_id' => $categorias['CP-LAC-01'],
                'subcategoria_producto_id' => $subcategorias['SCP-005'],
                'linea_id' => Linea::where('codigo', 'LIN-0001')->first()->id,
                'destino_id' => $destinos['DES-0001'],
                'cantidad_neto' => 1.000,
                'unidad_id' => 1,
                'cantidad_bruto' => 1.050,
                'estado_id' => 1,
                'usuario_creador_id' => 1,
                'usuario_modificador_id' => null
            ],
            [
                'codigo_sap' => 'PT-0002',
                'codigo_interno' => 'INT-0002',
                'nombre_sap' => 'Yogurt Natural 500g',
                'nombre_comercial' => 'Yogurt Natural 500 gramos',
                'descripcion_comercial' => 'Yogurt natural sin saborizantes en envase de 500 gramos',
                'descripcion_tecnica' => 'Yogurt natural pasteurizado',
                'ubicacion_id' => 1,
                'categoria_producto_id' => $categorias['CP-LAC-02'],
                'subcategoria_producto_id' => $subcategorias['SCP-008'],
                'linea_id' => Linea::where('codigo', 'LIN-0002')->first()->id,
                'destino_id' => $destinos['DES-0001'],
                'cantidad_neto' => 0.500,
                'unidad_id' => 1,
                'cantidad_bruto' => 0.550,
                'estado_id' => 1,
                'usuario_creador_id' => 1,
                'usuario_modificador_id' => null
            ],
            [
                'codigo_sap' => 'PT-0003',
                'codigo_interno' => 'INT-0003',
                'nombre_sap' => 'Jugo Natural 1L',
                'nombre_comercial' => 'Jugo Natural 1 Litro',
                'descripcion_comercial' => 'Jugo natural sin azúcar en envase de 1 litro',
                'descripcion_tecnica' => 'Jugo natural sin aditivos',
                'ubicacion_id' => 1,
                'categoria_producto_id' => $categorias['CP-LAC-03'],
                'subcategoria_producto_id' => $subcategorias['SCP-007'],
                'linea_id' => Linea::where('codigo', 'LIN-0001')->first()->id,
                'destino_id' => $destinos['DES-0001'],
                'cantidad_neto' => 1.000,
                'unidad_id' => 1,
                'cantidad_bruto' => 1.050,
                'estado_id' => 1,
                'usuario_creador_id' => 1,
                'usuario_modificador_id' => null
            ],
            [
                'codigo_sap' => 'PT-0004',
                'codigo_interno' => 'INT-0004',
                'nombre_sap' => 'Galletas Dulces 200g',
                'nombre_comercial' => 'Galletas Dulces 200 gramos',
                'descripcion_comercial' => 'Galletas dulces en paquete de 200 gramos',
                'descripcion_tecnica' => 'Galletas dulces horneadas',
                'ubicacion_id' => 2,
                'categoria_producto_id' => $categorias['CP-LAC-04'],
                'subcategoria_producto_id' => $subcategorias['SCP-008'],
                'linea_id' => Linea::where('codigo', 'LIN-0001')->first()->id,
                'destino_id' => $destinos['DES-0001'],
                'cantidad_neto' => 0.200,
                'unidad_id' => 1,
                'cantidad_bruto' => 0.220,
                'estado_id' => 1,
                'usuario_creador_id' => 1,
                'usuario_modificador_id' => null
            ],
            [
                'codigo_sap' => 'PT-0005',
                'codigo_interno' => 'INT-0005',
                'nombre_sap' => 'Pan Integral 500g',
                'nombre_comercial' => 'Pan Integral 500 gramos',
                'descripcion_comercial' => 'Pan integral en paquete de 500 gramos',
                'descripcion_tecnica' => 'Pan integral horneado con harina integral',
                'ubicacion_id' => 2,
                'categoria_producto_id' => $categorias['CP-LAC-05'],
                'subcategoria_producto_id' => $subcategorias['SCP-008'],
                'linea_id' => Linea::where('codigo', 'LIN-0001')->first()->id,
                'destino_id' => $destinos['DES-0001'],
                'cantidad_neto' => 0.500,
                'unidad_id' => 1,
                'cantidad_bruto' => 0.550,
                'estado_id' => 1,
                'usuario_creador_id' => 1,
                'usuario_modificador_id' => null
            ],
        ];

        foreach ($productosTerminadosData as $productoData) {
            ProductoTerminado::firstOrCreate(
                ['codigo_sap' => $productoData['codigo_sap']],
                $productoData
            );
        }
    }



}
