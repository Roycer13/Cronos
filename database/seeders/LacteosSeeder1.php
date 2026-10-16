<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;
class LacteosSeeder1 extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //

        $rutas = [
            ['nombre' => 'ACHACACHI', 'detalle' => '3 Compartimientos', 'alias' => null],
            ['nombre' => 'CHOJASIVI', 'detalle' => '2 Compartimientos', 'alias' => null],
            ['nombre' => 'PATACAMAYA', 'detalle' => '-', 'alias' => null],
            ['nombre' => 'VIACHA', 'detalle' => '1 compartimiento', 'alias' => null],
            ['nombre' => 'GUAQUI', 'detalle' => '4 Compartimientos', 'alias' => null],
            ['nombre' => 'PUCARANI A', 'detalle' => '2 Compartimientos', 'alias' => null],
            ['nombre' => 'PUCARANI B', 'detalle' => '2 Compartimientos', 'alias' => null],
        ];

        foreach ($rutas as $ruta) {
            DB::table('PLL_ruta_acopios')->insert([
                'nombre' => $ruta['nombre'],
                'detalle' => $ruta['detalle'],
                'alias' => $ruta['alias'],
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
