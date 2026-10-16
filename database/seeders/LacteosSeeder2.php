<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;

class LacteosSeeder2 extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //

    $subrutas = [
            // 🔹 ACHACACHI (id 1)
            ['nombre' => 'Achacachi - 1', 'detalle' => '-', 'ruta_id' => 1],
            ['nombre' => 'Achacachi - 2', 'detalle' => '-', 'ruta_id' => 1],
            ['nombre' => 'Achacachi - 3', 'detalle' => '-', 'ruta_id' => 1],
            ['nombre' => 'Chijipina Grande', 'detalle' => '-', 'ruta_id' => 1],
            ['nombre' => 'Avichaca', 'detalle' => '-', 'ruta_id' => 1],
            ['nombre' => 'Aprolon', 'detalle' => '-', 'ruta_id' => 1],
            ['nombre' => 'Majatachi', 'detalle' => '-', 'ruta_id' => 1],
            ['nombre' => 'Chijipina Chico', 'detalle' => '-', 'ruta_id' => 1],
            ['nombre' => 'Cota Cota Alta', 'detalle' => '-', 'ruta_id' => 1],
            ['nombre' => 'Igachi', 'detalle' => '-', 'ruta_id' => 1],
            ['nombre' => 'Aux 1', 'detalle' => 'eventual', 'ruta_id' => 1],
            ['nombre' => 'Aux 2', 'detalle' => 'eventual', 'ruta_id' => 1],

            // 🔹 CHOJASIVI (id 2)
            ['nombre' => 'Chojasivi-1', 'detalle' => '-', 'ruta_id' => 2],
            ['nombre' => 'Chojasivi-2', 'detalle' => '-', 'ruta_id' => 2],
            ['nombre' => 'Criollita', 'detalle' => '-', 'ruta_id' => 2],
            ['nombre' => 'Masaya 2', 'detalle' => '-', 'ruta_id' => 2],
            ['nombre' => 'Tiquipa', 'detalle' => '-', 'ruta_id' => 2],
            ['nombre' => 'Chojasivi', 'detalle' => '-', 'ruta_id' => 2],
            ['nombre' => 'Masaya 1', 'detalle' => '-', 'ruta_id' => 2],
            ['nombre' => 'Korila', 'detalle' => '-', 'ruta_id' => 2],
            ['nombre' => 'Catavii', 'detalle' => '-', 'ruta_id' => 2],
            ['nombre' => 'Chojasivi 3', 'detalle' => '-', 'ruta_id' => 2],
            ['nombre' => 'Chojasivi 4', 'detalle' => '-', 'ruta_id' => 2],
            ['nombre' => 'Chojasivi 5', 'detalle' => '-', 'ruta_id' => 2],

            // 🔹 PATACAMAYA (id 3)
            ['nombre' => 'Patacamaya-1', 'detalle' => '-', 'ruta_id' => 3],
            ['nombre' => 'Villaroel', 'detalle' => '-', 'ruta_id' => 3],
            ['nombre' => 'Culli Culli', 'detalle' => '-', 'ruta_id' => 3],

            // 🔹 VIACHA (id 4)
            ['nombre' => 'Viacha-1', 'detalle' => '-', 'ruta_id' => 4],
            ['nombre' => 'viacha-2', 'detalle' => '-', 'ruta_id' => 4],
            ['nombre' => 'Chonchocoro', 'detalle' => '-', 'ruta_id' => 4],
            ['nombre' => 'Hilata San Jorge', 'detalle' => '-', 'ruta_id' => 4],
            ['nombre' => 'Pillina laja', 'detalle' => '-', 'ruta_id' => 4],
            ['nombre' => 'Santa rosa', 'detalle' => '-', 'ruta_id' => 4],
            ['nombre' => 'San Cristobal', 'detalle' => '-', 'ruta_id' => 4],
            ['nombre' => 'Muruamaya', 'detalle' => '-', 'ruta_id' => 4],
            ['nombre' => 'Auxiliar1', 'detalle' => 'Auxiliar', 'ruta_id' => 4],
            ['nombre' => 'Auxiliar2', 'detalle' => 'A', 'ruta_id' => 4],

            // 🔹 GUAQUI (id 5)
            ['nombre' => 'Guaqui-1', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'Guaqui-2', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'Guaqui-3', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'Guaqui-4', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'Pillapi(Quiaqui)', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'Belen A', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'Corpa', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'Humamarca 1', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'Humamarca 2', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'Chambi Chico', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'Aposto Santiago', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'Belen B', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'Kasa Achuata', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'Caluyo 3', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'Isla Jawira', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'Tihuanahu', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'Curva Pucara', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'Caluyo 2', 'detalle' => '-', 'ruta_id' => 5],
            ['nombre' => 'San Antonio', 'detalle' => '-', 'ruta_id' => 5],

            // 🔹 PUCARANI (id 6)
            ['nombre' => 'Pucarani-1', 'detalle' => '-', 'ruta_id' => 6],
            ['nombre' => 'Pucarani-2', 'detalle' => '-', 'ruta_id' => 6],
            ['nombre' => 'Collpajahua', 'detalle' => '-', 'ruta_id' => 6],
            ['nombre' => 'Cantuyo', 'detalle' => '-', 'ruta_id' => 6],
            ['nombre' => 'Cota Cota', 'detalle' => '-', 'ruta_id' => 6],
            ['nombre' => 'Caicoma', 'detalle' => '-', 'ruta_id' => 6],
            ['nombre' => 'Ullajara', 'detalle' => '-', 'ruta_id' => 6],
            ['nombre' => 'Poke', 'detalle' => '-', 'ruta_id' => 6],
            ['nombre' => 'Antajahua', 'detalle' => '-', 'ruta_id' => 6],
            ['nombre' => 'Chiaruyo', 'detalle' => '-', 'ruta_id' => 6],
            // 🔹 PUCARANI B (id 7)
            ['nombre' => 'Pucarani-1', 'detalle' => '-', 'ruta_id' => 7],
            ['nombre' => 'Pucarani-2', 'detalle' => '-', 'ruta_id' => 7],
            ['nombre' => 'Collpajahua', 'detalle' => '-', 'ruta_id' => 7],
            ['nombre' => 'Cantuyo', 'detalle' => '-', 'ruta_id' => 7],
            ['nombre' => 'Cota Cota', 'detalle' => '-', 'ruta_id' => 7],
            ['nombre' => 'Caicoma', 'detalle' => '-', 'ruta_id' => 7],
            ['nombre' => 'Ullajara', 'detalle' => '-', 'ruta_id' => 7],
            ['nombre' => 'Poke', 'detalle' => '-', 'ruta_id' => 7],
            ['nombre' => 'Antajahua', 'detalle' => '-', 'ruta_id' => 7],
            ['nombre' => 'Chiaruyo', 'detalle' => '-', 'ruta_id' => 7],
        ];

        foreach ($subrutas as $s) {
            $grupo = stripos($s['nombre'], $this->getRutaNombre($s['ruta_id'])) !== false ? 'Camión' : 'Tubo';

            DB::table('PLL_subruta_acopios')->insert([
                'PLL_ruta_acopios_id' => $s['ruta_id'],
                'nombre' => $s['nombre'],
                'alias' => null,
                'detalle' => $s['detalle'],
                'grupo' => $grupo,
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function getRutaNombre($id)
    {
        $rutas = [
            1 => 'Achacachi',
            2 => 'Chojasivi',
            3 => 'Patacamaya',
            4 => 'Viacha',
            5 => 'Guaqui',
            6 => 'Pucarani',
        ];

        return $rutas[$id] ?? '';
    }
}
