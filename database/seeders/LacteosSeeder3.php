<?php

namespace Database\Seeders;

use App\Domain\PlantaLacteos\Models\CategoriaMateriaPrima;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;

class LacteosSeeder3 extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {


          // === Categorias ===
        $categorias = [

            ['nombre' => 'Aditivos', 'ubicacion_id'=>1],
            ['nombre' => 'Cereales', 'ubicacion_id'=>1],
            ['nombre' => 'Colorantes', 'ubicacion_id'=>1],
            ['nombre' => 'Conservantes', 'ubicacion_id'=>1],
            ['nombre' => 'Cultivos', 'ubicacion_id'=>1],
            ['nombre' => 'Edulcorantes', 'ubicacion_id'=>1],
            ['nombre' => 'Enturbiantes', 'ubicacion_id'=>1],
            ['nombre' => 'Envases', 'ubicacion_id'=>1],
            ['nombre' => 'Esencias', 'ubicacion_id'=>1],
            ['nombre' => 'Estabilizantes', 'ubicacion_id'=>1],
            ['nombre' => 'Fortificantes', 'ubicacion_id'=>1],
            ['nombre' => 'Harinas', 'ubicacion_id'=>1],
            ['nombre' => 'Pulpas', 'ubicacion_id'=>1],
            ['nombre' => 'Reguladores de acidez', 'ubicacion_id'=>1],
            ['nombre' => 'Sustituto lácteo', 'ubicacion_id'=>1],
            ['nombre' => 'Detergentes', 'ubicacion_id'=>1],
            ['nombre' => 'Sustancias químicas', 'ubicacion_id'=>1],
        ];

        foreach ($categorias as $categoria) {
            CategoriaMateriaPrima::updateOrCreate( $categoria);
        }




    }


}
