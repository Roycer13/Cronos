<?php

namespace Database\Seeders;

use App\Domain\PlantaLacteos\Models\DestinoDesinfeccion;
use App\Domain\PlantaLacteos\Models\ItemDesinfeccion;
use App\Domain\PlantaLacteos\Models\ItemMateriaPrima;
use App\Domain\PlantaLacteos\Models\ItemSustancia;
use App\Domain\PlantaLacteos\Models\ProveedorMateriaPrima;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Unidad;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;

class LacteosSeeder7 extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $estadoActivo = Estado::where('nombre', 'Activo')->first();
        if (!$estadoActivo) {
            throw new \Exception("El estado 'Activo' no existe en la tabla estados.");
        }

        // 1. Crear los Items de Desinfección
        $items = [
            ['codigo' => 'L-1', 'nombre' => 'Alcohol', 'unidad' => 'Litro', 'concentracion' => 96, 'ubicacion_id' => 1],
            ['codigo' => 'L-2', 'nombre' => 'Alcohol para acopio', 'unidad' => 'Litro', 'concentracion' => 83, 'ubicacion_id' => 1],
            ['codigo' => 'L-3', 'nombre' => 'Peróxido de Hidrógeno', 'unidad' => 'Kilogramo', 'concentracion' => 50, 'ubicacion_id' => 1],
            ['codigo' => 'L-4', 'nombre' => 'Hipoclorito de Sodio', 'unidad' => 'Litro', 'concentracion' => 8, 'ubicacion_id' => 1],
            ['codigo' => 'L-5', 'nombre' => 'Ácido Peracético', 'unidad' => 'Litro', 'concentracion' => 15, 'ubicacion_id' => 1],
            ['codigo' => 'L-6', 'nombre' => 'Clorospar', 'unidad' => 'Kilogramo', 'concentracion' => 62, 'ubicacion_id' => 1],
            ['codigo' => 'L-7', 'nombre' => 'Detergente', 'unidad' => 'Litro', 'concentracion' => 100, 'ubicacion_id' => 1],
        ];

        foreach ($items as $item) {
            // Buscar unidad por nombre
            $unidad = Unidad::where('nombre', $item['unidad'])->first();

            if (!$unidad) {
                throw new \Exception("La unidad '{$item['unidad']}' no existe en la tabla unidades.");
            }

            ItemDesinfeccion::updateOrCreate(
                ['codigo' => $item['codigo']], // clave única
                [
                    'nombre' => $item['nombre'],
                    'unidad_id' => $unidad->id,
                    'concentracion' => $item['concentracion'],
                    'ubicacion_id' => $item['ubicacion_id'],
                    'estado_id' => $estadoActivo->id,
                ]
            );
        }

        // 2. Crear los Destinos de Desinfección
        $destinos = [
            // Alcohol (L-1)
            ['codigo' => 'D-1', 'nombre' => 'Solicitud externa', 'concentracion' => 96, 'item_nombre' => 'Alcohol', 'multiplicador'=>1],
            ['codigo' => 'D-2', 'nombre' => 'Centros de acopio', 'concentracion' => 83, 'item_nombre' => 'Alcohol', 'multiplicador'=>1],
            ['codigo' => 'D-3', 'nombre' => 'Desinfección General', 'concentracion' => 75, 'item_nombre' => 'Alcohol', 'multiplicador'=>1],
            ['codigo' => 'D-4', 'nombre' => 'Desinfección de manos', 'concentracion' => 65, 'item_nombre' => 'Alcohol', 'multiplicador'=>1],

            // Alcohol para acopio (L-2)
            ['codigo' => 'D-5', 'nombre' => 'Para centros de acopio', 'concentracion' => 83, 'item_nombre' => 'Alcohol para acopio', 'multiplicador'=>1],

            // Peróxido de Hidrógeno (L-3)
            ['codigo' => 'D-6', 'nombre' => 'Para Elecster UHT', 'concentracion' => 32, 'item_nombre' => 'Peróxido de Hidrógeno', 'multiplicador'=>1],

            // Hipoclorito de Sodio (L-4)
            ['codigo' => 'D-7', 'nombre' => 'Desinfección de Botellas (400 L)', 'concentracion' => 0.0030, 'item_nombre' => 'Hipoclorito de Sodio', 'multiplicador'=>1],
            ['codigo' => 'D-8', 'nombre' => 'Desinfección de máquinas y equipos', 'concentracion' => 0.0100, 'item_nombre' => 'Hipoclorito de Sodio', 'multiplicador'=>1],
            ['codigo' => 'D-9', 'nombre' => 'Desinfección de superficies', 'concentracion' => 0.0200, 'item_nombre' => 'Hipoclorito de Sodio', 'multiplicador'=>1],
            ['codigo' => 'D-10', 'nombre' => 'Desinfección de Sanitarios', 'concentracion' => 0.1000, 'item_nombre' => 'Hipoclorito de Sodio', 'multiplicador'=>1],
            ['codigo' => 'D-11', 'nombre' => 'Cloro concentrado', 'concentracion' => 8, 'item_nombre' => 'Hipoclorito de Sodio', 'multiplicador'=>1],
            ['codigo' => 'D-17', 'nombre' => 'lavado de bandejas (1300 L)', 'concentracion' => 0.03, 'item_nombre' => 'Hipoclorito de Sodio', 'multiplicador'=>1],

            // Ácido Peracético (L-5)
            ['codigo' => 'D-12', 'nombre' => 'Para Desinfección de tanques', 'concentracion' => 0.0300, 'item_nombre' => 'Ácido Peracético', 'multiplicador'=>0,8658],
            ['codigo' => 'D-13', 'nombre' => 'Para desinfección de equipos', 'concentracion' => 0.0120, 'item_nombre' => 'Ácido Peracético', 'multiplicador'=>0,8658],

            // Clorospar (L-6)
            ['codigo' => 'D-14', 'nombre' => 'Desinfección de Botellas', 'concentracion' => 0.0035, 'item_nombre' => 'Clorospar', 'multiplicador'=>1],
            ['codigo' => 'D-15', 'nombre' => 'Desinfección de máquinas y equipos', 'concentracion' => 0.0100, 'item_nombre' => 'Clorospar', 'multiplicador'=>1],
            ['codigo' => 'D-16', 'nombre' => 'Desinfección de superficies', 'concentracion' => 0.0200, 'item_nombre' => 'Clorospar', 'multiplicador'=>1],

            // Detergente (L-7)
            ['codigo' => 'D-18', 'nombre' => 'Limpieza de planta', 'concentracion' => 100, 'item_nombre' => 'Detergente', 'multiplicador'=>1],
            ['codigo' => 'D-19', 'nombre' => 'Lavado de Bandejas', 'concentracion' => 100, 'item_nombre' => 'Detergente', 'multiplicador'=>1],
            ['codigo' => 'D-20', 'nombre' => 'Limpieza de Laboratorio', 'concentracion' => 100, 'item_nombre' => 'Detergente', 'multiplicador'=>1],
            ['codigo' => 'D-21', 'nombre' => 'Diseño y Desarrollo', 'concentracion' => 100, 'item_nombre' => 'Detergente', 'multiplicador'=>1],
        ];

        foreach ($destinos as $destino) {
            // Buscar el item por nombre
            $item = ItemDesinfeccion::where('nombre', $destino['item_nombre'])->first();

            if (!$item) {
                throw new \Exception("El item '{$destino['item_nombre']}' no existe en la tabla items.");
            }

            // Buscar la unidad del item (los destinos usan la misma unidad que su item)
            $unidadItem = $item->unidad;

            DestinoDesinfeccion::updateOrCreate(
                ['codigo' => $destino['codigo']], // clave única
                [
                    'nombre' => $destino['nombre'],
                    'concentracion' => $destino['concentracion'],
                    'unidad_id' => $unidadItem->id,
                    'item_desinfeccion_id' => $item->id,
                    'multiplicador' => $destino['multiplicador'],
                    'ubicacion_id' => $item->ubicacion_id, // Misma ubicación que el item
                ]
            );
        }

    }
}
