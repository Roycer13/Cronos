<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrigenesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $origenes = [
            ['alias' => 'R1', 'descripcion' => 'TANQUE DE 4400L', 'maquina_id' => 150, 'sector_id' => 12],
            ['alias' => 'R2', 'descripcion' => 'TANQUE DE 15000L', 'maquina_id' => 177, 'sector_id' => 1],
            ['alias' => 'R3', 'descripcion' => 'TANQUE DE 19000L', 'maquina_id' => 71, 'sector_id' => 1],
            ['alias' => 'TK 41', 'descripcion' => 'TANQUE DE 10000L', 'maquina_id' => 239, 'sector_id' => 2],
            ['alias' => 'TK MIX3', 'descripcion' => 'TANQUE  DE 5000L', 'maquina_id' => 176, 'sector_id' => 2],
            ['alias' => 'TK MIX2', 'descripcion' => 'TANQUE  DE 5000L', 'maquina_id' => 112, 'sector_id' => 2],
            ['alias' => 'TK 42', 'descripcion' => 'TANQUE DE 5000L', 'maquina_id' => 93, 'sector_id' => 2],
            ['alias' => 'TK MIX1', 'descripcion' => 'TANQUE  DE 2500L', 'maquina_id' => 88, 'sector_id' => 2],
            ['alias' => 'TK MIX4', 'descripcion' => 'TANQUE  DE 7500L', 'maquina_id' => 73, 'sector_id' => 2],
            ['alias' => 'Ttk Quesos', 'descripcion' => 'TANQUE  DE 1000L', 'maquina_id' => 107, 'sector_id' => 105],
            ['alias' => 'Marmita', 'descripcion' => 'TANQUE  DE 1000L', 'maquina_id' => 156, 'sector_id' => 58],
            ['alias' => 'TK10', 'descripcion' => 'TANQUE DE  10000L', 'maquina_id' => 40, 'sector_id' => 5],
            ['alias' => 'TK FP', 'descripcion' => 'TANQUE  DE 2500L', 'maquina_id' => 99, 'sector_id' => 5],
            ['alias' => 'TK5', 'descripcion' => 'TANQUE DE 5000L', 'maquina_id' => 101, 'sector_id' => 5],
            ['alias' => 'TK FG', 'descripcion' => 'TANQUE  DE 5000L', 'maquina_id' => 126, 'sector_id' => 5],
            ['alias' => 'TK MG', 'descripcion' => 'TANQUE  DE 5000L', 'maquina_id' => 127, 'sector_id' => 5],
            ['alias' => 'TK CC', 'descripcion' => 'TANQUE  DE 5000L', 'maquina_id' => 224, 'sector_id' => 9],
            ['alias' => 'TK SC', 'descripcion' => 'TANQUE  DE 5000L', 'maquina_id' => 226, 'sector_id' => 9],
            ['alias' => 'PAST MAGGER', 'descripcion' => 'PASTEURIZADOR  DE MAGGER', 'maquina_id' => 104, 'sector_id' => 2],
            ['alias' => 'PAST TETRA', 'descripcion' => 'PASTEURIZADOR DE TETRA', 'maquina_id' => 171, 'sector_id' => 2],
            ['alias' => 'UHT TETRA', 'descripcion' => 'ESTERILIZADOR DE ELECSTER UHT', 'maquina_id' => 87, 'sector_id' => 6],
            ['alias' => '1A', 'descripcion' => 'ENVASADORA UHT', 'maquina_id' => 64, 'sector_id' => 8],
            ['alias' => '1B', 'descripcion' => 'ENVASADORA UHT', 'maquina_id' => 64, 'sector_id' => 8],
            ['alias' => '1C', 'descripcion' => 'ENVASADORA UHT', 'maquina_id' => 64, 'sector_id' => 8],
            ['alias' => '2A', 'descripcion' => 'ENVASADORA CD', 'maquina_id' => 203, 'sector_id' => 8],
            ['alias' => '2B', 'descripcion' => 'ENVASADORA CD', 'maquina_id' => 203, 'sector_id' => 8],
            ['alias' => '3A', 'descripcion' => 'ENVASADORA JK', 'maquina_id' => 231, 'sector_id' => 8],
            ['alias' => '3B', 'descripcion' => 'ENVASADORA JK', 'maquina_id' => 231, 'sector_id' => 8],
            ['alias' => '5C', 'descripcion' => 'ENVASADORA DE HTST 5', 'maquina_id' => null, 'sector_id' => null],
            ['alias' => '5B', 'descripcion' => 'ENVASADORA DE HTST 5', 'maquina_id' => null, 'sector_id' => null],
            ['alias' => '5A', 'descripcion' => 'ENVASADORA DE HTST 5', 'maquina_id' => null, 'sector_id' => null],
            ['alias' => '4C', 'descripcion' => 'ENVASADORA DE HTST 4', 'maquina_id' => null, 'sector_id' => 7],
            ['alias' => '4B', 'descripcion' => 'ENVASADORA DE HTST 4', 'maquina_id' => 78, 'sector_id' => 7],
            ['alias' => '4A', 'descripcion' => 'ENVASADORA DE HTST 4', 'maquina_id' => 78, 'sector_id' => 7],
            ['alias' => '3C', 'descripcion' => 'ENVASADORA DE HTST 3', 'maquina_id' => 161, 'sector_id' => 7],
            ['alias' => '3B', 'descripcion' => 'ENVASADORA DE HTST 3', 'maquina_id' => 161, 'sector_id' => 7],
            ['alias' => '3A', 'descripcion' => 'ENVASADORA DE HTST 3', 'maquina_id' => 161, 'sector_id' => 7],
            ['alias' => '2C', 'descripcion' => 'ENVASADORA DE HTST 2', 'maquina_id' => 80, 'sector_id' => 7],
            ['alias' => '2B', 'descripcion' => 'ENVASADORA DE HTST 2', 'maquina_id' => 80, 'sector_id' => 7],
            ['alias' => '2A', 'descripcion' => 'ENVASADORA DE HTST 2', 'maquina_id' => 80, 'sector_id' => 7],
            ['alias' => '1C', 'descripcion' => 'ENVASADORA DE HTST 1', 'maquina_id' => 79, 'sector_id' => 7],
            ['alias' => '1B', 'descripcion' => 'ENVASADORA DE HTST 1', 'maquina_id' => 79, 'sector_id' => 7],
            ['alias' => '1A', 'descripcion' => 'ENVASADORA DE HTST 1', 'maquina_id' => 79, 'sector_id' => 7],
            ['alias' => 'TK MP', 'descripcion' => 'TANQUE  DE 2500L', 'maquina_id' => 100, 'sector_id' => 5],
            ['alias' => 'V1', 'descripcion' => 'ENVASADORA DE VASOS', 'maquina_id' => 228, 'sector_id' => 9],
            ['alias' => 'V2', 'descripcion' => 'ENVASADORA DE VASOS', 'maquina_id' => 194, 'sector_id' => 9],
            ['alias' => 'V3', 'descripcion' => 'ENVASADORA DE VASOS', 'maquina_id' => null, 'sector_id' => null],
            ['alias' => 'EMBOTELLADORA', 'descripcion' => 'ENVASADORA DE BOTELLAS', 'maquina_id' => 57, 'sector_id' => 9],
            ['alias' => 'TKAUX1', 'descripcion' => 'AUXILIAR', 'maquina_id' => null, 'sector_id' => null],
            ['alias' => 'TKAUX2', 'descripcion' => 'AUXILIAR', 'maquina_id' => null, 'sector_id' => null],
            ['alias' => 'TK SY', 'descripcion' => 'TANQUE DE SOYA', 'maquina_id' => 162, 'sector_id' => 76],
            ['alias' => 'L1', 'descripcion' => 'ENVASADORA DE PLL-SOYA', 'maquina_id' => 162, 'sector_id' => 76],
            ['alias' => 'L2', 'descripcion' => 'ENVASADORA DE PLL-SOYA', 'maquina_id' => 162, 'sector_id' => 76],
            ['alias' => 'L3', 'descripcion' => 'ENVASADORA DE PLL-SOYA', 'maquina_id' => 162, 'sector_id' => 76],
            ['alias' => 'TK11', 'descripcion' => 'TANQUE DE 10000L', 'maquina_id' => null, 'sector_id' => null],
        ];

        foreach ($origenes as $origen) {
            DB::table('PLL_origenes')->insert([
                'alias' => $origen['alias'],
                'descripcion' => $origen['descripcion'],
                'maquina_id' => $origen['maquina_id'],
                'sector_id' => $origen['sector_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}