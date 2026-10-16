<?php

namespace Database\Seeders;

use App\Domain\PlantaLacteos\Models\ItemMateriaPrima;
use App\Domain\PlantaLacteos\Models\ItemSustancia;
use App\Domain\PlantaLacteos\Models\ProveedorMateriaPrima;
use App\Domain\Sistema\Configuracion\Models\Unidad;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;

class LacteosSeeder6 extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $items = [
            ['codigo' => 'MB01', 'nombre' =>     'PLATE COUNT AGAR', 'unidad' => 'Frasco', 'ubicacion_id'=> 1],
            ['codigo' => 'MB02', 'nombre' =>     'POTATO DEXTROSE AGAR', 'unidad' => 'Frasco', 'ubicacion_id'=> 1],
            ['codigo' => 'MB03', 'nombre' =>     'VIOLET RED BILE AGAR', 'unidad' => 'Frasco', 'ubicacion_id'=> 1],
            ['codigo' => 'LB01', 'nombre' =>     'CLORURO DE POTASIO', 'unidad' => 'Gramo', 'ubicacion_id'=> 1],
            ['codigo' => 'LB02', 'nombre' =>     'ACIDO CLORHIDRICO HCl', 'unidad' => 'Ampolla', 'ubicacion_id'=> 1],
            ['codigo' => 'LB03', 'nombre' =>     'ACIDO SULFURICO', 'unidad' => 'Gramo', 'ubicacion_id'=> 1],
            ['codigo' => 'LB04', 'nombre' =>     'HIDROXIDO DE SODIO', 'unidad' => 'Gramo', 'ubicacion_id'=> 1],
            ['codigo' => 'LB05', 'nombre' =>     'ALCOHOL ISOAMILICO', 'unidad' => 'Gramo', 'ubicacion_id'=> 1],
            ['codigo' => 'LB06', 'nombre' =>     'YODURO DE POTASIO', 'unidad' => 'Gramo', 'ubicacion_id'=> 1],
            ['codigo' => 'LB07', 'nombre' =>     'FENOLFTALEINA', 'unidad' => 'Gramo', 'ubicacion_id'=> 1],
            ['codigo' => 'LB08', 'nombre' =>     'A 0,000ºC', 'unidad' => 'Frasco', 'ubicacion_id'=> 1],
            ['codigo' => 'LB09', 'nombre' =>     'B -0557ºC', 'unidad' => 'Frasco', 'ubicacion_id'=> 1],
            ['codigo' => 'LB10', 'nombre' =>     'REFRIGERANTE COOLING BATH FLUID', 'unidad' => 'Frasco', 'ubicacion_id'=> 1],
            ['codigo' => 'LB11', 'nombre' =>     'HI7010 PH 10,01', 'unidad' => 'Gramo', 'ubicacion_id'=> 1],
            ['codigo' => 'LB12', 'nombre' =>     'HI7007 PH 7,01', 'unidad' => 'Gramo', 'ubicacion_id'=> 1],
            ['codigo' => 'LB13', 'nombre' =>     'HI7004 PH 4,01', 'unidad' => 'Gramo', 'ubicacion_id'=> 1],
            ['codigo' => 'SE01', 'nombre' =>     'TEST KIT DE CLORURO', 'unidad' => 'Unidad', 'ubicacion_id'=> 1],
            ['codigo' => 'SE02', 'nombre' =>     'TEST KIT DE DUREZA', 'unidad' => 'Unidad', 'ubicacion_id'=> 1],
            ['codigo' => 'MB04', 'nombre' =>     'AGUA PEPTONADA', 'unidad' => 'Frasco', 'ubicacion_id'=> 1],
            ['codigo' => 'MB05', 'nombre' =>     'TEST KIT DE ANTIBIÓTICOS', 'unidad' => 'Unidad', 'ubicacion_id'=> 1],
            ['codigo' => 'LB14', 'nombre' =>     'NARANJA DE METILO', 'unidad' => 'Gramo', 'ubicacion_id'=> 1],

        ];

         foreach ($items as $item) {

            // Buscar unidad por nombre
            $unidad = Unidad::where('nombre', $item['unidad'])->first();

            if (!$unidad) {
                throw new \Exception("La unidad '{$item['unidad']}' no existe en la tabla unidades.");
            }

            ItemSustancia::updateOrCreate(
                ['codigo' => $item['codigo']], // clave única
                [
                    'nombre' => $item['nombre'],
                    'unidad_id' => $unidad->id,
                     'ubicacion_id' => $item['ubicacion_id'],
                ]
            );
        }
    }
}
