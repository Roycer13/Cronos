<?php

namespace Database\Seeders;

use App\Domain\PlantaLacteos\Models\AlmacenMateriaPrima;
use App\Domain\PlantaLacteos\Models\ItemMateriaPrima;
use App\Domain\PlantaLacteos\Models\ProveedorMateriaPrima;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;

class LacteosSeeder5 extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {


        $almacenes = [
            ['nombre' => 'SOALPRO' , 'ubicacion_id'=>1],
            ['nombre' => 'CASCADA' , 'ubicacion_id'=>1],
            ['nombre' => 'CARSA' , 'ubicacion_id'=>1],
        ];

        foreach ($almacenes as $item) {
            AlmacenMateriaPrima::updateOrCreate($item);
        }
        $items = [
            ['nombre' => '	AGUAI', 'ubicacion_id'=>1],
            ['nombre' => '	ALCOHOL CAÑERO', 'ubicacion_id'=>1],
            ['nombre' => '	ALICAMP', 'ubicacion_id'=>1],
            ['nombre' => '	ALICO', 'ubicacion_id'=>1],
            ['nombre' => '	ALICORP', 'ubicacion_id'=>1],
            ['nombre' => '	ALVELZA', 'ubicacion_id'=>1],
            ['nombre' => '	ANDERS BOLIVIA', 'ubicacion_id'=>1],
            ['nombre' => '	BELEN', 'ubicacion_id'=>1],
            ['nombre' => '	BIOFERM', 'ubicacion_id'=>1],
            ['nombre' => '	BIOFUM', 'ubicacion_id'=>1],
            ['nombre' => '	BIOINSUMOS', 'ubicacion_id'=>1],
            ['nombre' => '	BIOTAL', 'ubicacion_id'=>1],
            ['nombre' => '	CARINSA', 'ubicacion_id'=>1],
            ['nombre' => '	CARSA', 'ubicacion_id'=>1],
            ['nombre' => '	CLOROSUR', 'ubicacion_id'=>1],
            ['nombre' => '	COLMAFLEX', 'ubicacion_id'=>1],
            ['nombre' => '	CUATIS', 'ubicacion_id'=>1],
            ['nombre' => '	DIVERSEY', 'ubicacion_id'=>1],
            ['nombre' => '	DOREMUS', 'ubicacion_id'=>1],
            ['nombre' => '	DOSIS', 'ubicacion_id'=>1],
            ['nombre' => '	ETRAI', 'ubicacion_id'=>1],
            ['nombre' => '	EUROSIGMA', 'ubicacion_id'=>1],
            ['nombre' => '	FLEXBOL', 'ubicacion_id'=>1],
            ['nombre' => '	FLEXOGRAFIA', 'ubicacion_id'=>1],
            ['nombre' => '	FLEXYPLAS', 'ubicacion_id'=>1],
            ['nombre' => '	FLORAMATIC', 'ubicacion_id'=>1],
            ['nombre' => '	FOOD CO.LTD', 'ubicacion_id'=>1],
            ['nombre' => '	FOODCHEM BIOTECH', 'ubicacion_id'=>1],
            ['nombre' => '	FOODING GROUP', 'ubicacion_id'=>1],
            ['nombre' => '	FRANCISCO SOZA', 'ubicacion_id'=>1],
            ['nombre' => '	FRANCISCO SUSZ', 'ubicacion_id'=>1],
            ['nombre' => '	GRINPLAS', 'ubicacion_id'=>1],
            ['nombre' => '	IMP.SOALPRO', 'ubicacion_id'=>1],
            ['nombre' => '	IMPORTADO', 'ubicacion_id'=>1],
            ['nombre' => '	IMPORTADO POR SOALPRO', 'ubicacion_id'=>1],
            ['nombre' => '	IMPRIMIR', 'ubicacion_id'=>1],
            ['nombre' => '	INALIM', 'ubicacion_id'=>1],
            ['nombre' => '	INDUSTRIAS PACHECO', 'ubicacion_id'=>1],
            ['nombre' => '	INPLAZ', 'ubicacion_id'=>1],
            ['nombre' => '	INTERCOM', 'ubicacion_id'=>1],
            ['nombre' => '	INTERQUIMICA', 'ubicacion_id'=>1],
            ['nombre' => '	ISAL', 'ubicacion_id'=>1],
            ['nombre' => '	LA PAZ FOODS', 'ubicacion_id'=>1],
            ['nombre' => '	LOS ANDES', 'ubicacion_id'=>1],
            ['nombre' => '	MACHU PICHO', 'ubicacion_id'=>1],
            ['nombre' => '	MAPRIAL', 'ubicacion_id'=>1],
            ['nombre' => '	MASTERSENCE', 'ubicacion_id'=>1],
            ['nombre' => '	MATHIESSEN', 'ubicacion_id'=>1],
            ['nombre' => '	NATURAL HEALTH', 'ubicacion_id'=>1],
            ['nombre' => '	NATUREX', 'ubicacion_id'=>1],
            ['nombre' => '	PACHECO', 'ubicacion_id'=>1],
            ['nombre' => '	PAL HARMONY', 'ubicacion_id'=>1],
            ['nombre' => '	PANADERIA', 'ubicacion_id'=>1],
            ['nombre' => '	PLASMEN', 'ubicacion_id'=>1],
            ['nombre' => '	POLIFOOD', 'ubicacion_id'=>1],
            ['nombre' => '	POYPLAST', 'ubicacion_id'=>1],
            ['nombre' => '	PREFORSA', 'ubicacion_id'=>1],
            ['nombre' => '	PROSERCO', 'ubicacion_id'=>1],
            ['nombre' => '	PROSYBOL', 'ubicacion_id'=>1],
            ['nombre' => '	QP', 'ubicacion_id'=>1],
            ['nombre' => '	QUIMPAC', 'ubicacion_id'=>1],
            ['nombre' => '	RAILPLAST', 'ubicacion_id'=>1],
            ['nombre' => '	SABOREA', 'ubicacion_id'=>1],
            ['nombre' => '	SANTA CLARA', 'ubicacion_id'=>1],
            ['nombre' => '	SAPORE', 'ubicacion_id'=>1],
            ['nombre' => '	SAPORE BOLIVIA', 'ubicacion_id'=>1],
            ['nombre' => '	SEVIMA', 'ubicacion_id'=>1],
            ['nombre' => '	SOALPRO', 'ubicacion_id'=>1],
            ['nombre' => '	SOYA', 'ubicacion_id'=>1],
            ['nombre' => '	SPARTAN', 'ubicacion_id'=>1],
            ['nombre' => '	SPECTRA', 'ubicacion_id'=>1],
            ['nombre' => '	UNAGRO', 'ubicacion_id'=>1],
            ['nombre' => '	VERY QUIMIC', 'ubicacion_id'=>1],
            ['nombre' => '	WET CHEMICAL', 'ubicacion_id'=>1],
            ['nombre' => '	UNAGRO', 'ubicacion_id'=>1],
            ['nombre' => '	UNIPAN', 'ubicacion_id'=>1],
            ['nombre' => '	ILLAMANKA', 'ubicacion_id'=>1],
            ['nombre' => '	INGENIO SAN AURELIO', 'ubicacion_id'=>1],
            ['nombre' => '	PERLA ANDINA', 'ubicacion_id'=>1],
            ['nombre' => '	DARTE PLAST', 'ubicacion_id'=>1],
            ['nombre' => '	IMBAREX', 'ubicacion_id'=>1],
            ['nombre' => '	TELCHI LITEL', 'ubicacion_id'=>1],
            ['nombre' => '	PRODISAL', 'ubicacion_id'=>1],
            ['nombre' => '	NUTRAKIM', 'ubicacion_id'=>1],
            ['nombre' => '	NUTRALIM', 'ubicacion_id'=>1],
            ['nombre' => '	GRUPO MAHEZIK', 'ubicacion_id'=>1],
            ['nombre' => '	PERUPLAST', 'ubicacion_id'=>1],
            ['nombre' => '	PLAS MEN', 'ubicacion_id'=>1],
            ['nombre' => '	ROSMINDA MASCO', 'ubicacion_id'=>1],
            ['nombre' => '	CORIMEX', 'ubicacion_id'=>1],
        ];

        foreach ($items as $item) {
            ProveedorMateriaPrima::updateOrCreate($item);
        }
    }
}
