<?php

namespace Database\Seeders;

use App\Domain\PlantaLacteos\Models\DestinoDesinfeccion;
use App\Domain\PlantaLacteos\Models\ItemDesinfeccion;
use App\Domain\PlantaLacteos\Models\ItemMateriaPrima;
use App\Domain\PlantaLacteos\Models\ItemSustancia;
use App\Domain\PlantaLacteos\Models\ProveedorMateriaPrima;
use App\Domain\PlantaLacteos\Models\TipoMuestralaboratorioExterno;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Unidad;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\DB;

class LacteosSeeder8 extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {


        $unidades = [
            [
                'nombre' => 'Unidades formadoras de colonias por cada mililitro',
                'abreviatura' => 'UFC/ml'
            ],
            [
                'nombre' => 'Unidades formadoras de colonias por área de control',
                'abreviatura' => 'UFC/área'
            ],
            [
                'nombre' => 'Unidades formadoras de colonia por cada gramo',
                'abreviatura' => 'UFC/g'
            ],
            [

                'nombre' => 'Unidades formadoras de colonias por ambas manos',
                'abreviatura' => 'UFC/mano'
            ]
        ];



        foreach ($unidades as $unidadData) {
            Unidad::firstOrCreate(
                ['nombre' => $unidadData['nombre']],
                $unidadData
            );
        }

        // Obtener IDs de unidades
        $unidadUfcMl = Unidad::where('nombre', 'Unidades formadoras de colonias por cada mililitro')->first();
        $unidadUfcArea = Unidad::where('nombre', 'Unidades formadoras de colonias por área de control')->first();
        $unidadUfcG = Unidad::where('nombre', 'Unidades formadoras de colonia por cada gramo')->first();
        $unidadUfcMano = Unidad::where('nombre', 'Unidades formadoras de colonias por ambas manos')->first();



        $tiposMuestra = [
            [
                'nombre' => 'AGUA',

                'ubicacion_id' => 1,
                'unidad_id' => $unidadUfcMl ? $unidadUfcMl->id : null,
                'norma_microbiologico' => 'Norma Boliviana NB 512 - Agua Potable, Requisitos',
                'norma_fisicoquimico' => null,
                'mesofilos' => false,
                'coliformes' => true,
                'mohos' => false,
                'mesofilos2' => false,
                'coliformes2' => false,
                'mohos2' => false,
                'temperatura' => false,
                'humedad' => false,
                'actividad_agua' => false,
                'ph' => true,
                'dureza' => true,
                'cloruros' => true,
                'min_mesofilos' => null,
                'max_mesofilos' => null,
                'min_coliformes' => null,
                'max_coliformes' => 1,
                'min_mohos' => null,
                'max_mohos' => null,

            ],
            [
                'nombre' => 'AMBIENTE',
                'ubicacion_id' => 1,
                'unidad_id' => $unidadUfcArea ? $unidadUfcArea->id : null,
                'norma_microbiologico' => 'Guía Tec. Anal. Microb. De Sup. en contacto con Alim. y Beb. RES. MIN. N°46-2007-MINSA. Norma Peruana 346583',
                'norma_fisicoquimico' => null,
                'mesofilos' => true,
                'coliformes' => false,
                'mohos' => true,
                'mesofilos2' => false,
                'coliformes2' => false,
                'mohos2' => false,
                'temperatura' => true,
                'humedad' => true,
                'actividad_agua' => true,
                'ph' => false,
                'dureza' => false,
                'cloruros' => false,
                'min_mesofilos' => null,
                'max_mesofilos' => 15,
                'min_coliformes' => null,
                'max_coliformes' => null,
                'min_mohos' => null,
                'max_mohos' => 15,

            ],
            [
                'nombre' => 'CEREALES',
                'ubicacion_id' => 1,
                'unidad_id' => $unidadUfcG ? $unidadUfcG->id : null,
                'norma_microbiologico' => 'Referencia Norma Boliviana 312057, Cereales',
                'norma_fisicoquimico' => null,
                'mesofilos' => true,
                'coliformes' => true,
                'mohos' => true,
                'mesofilos2' => false,
                'coliformes2' => false,
                'mohos2' => false,
                'temperatura' => true,
                'humedad' => true,
                'actividad_agua' => true,
                'ph' => false,
                'dureza' => false,
                'cloruros' => false,
                'min_mesofilos' => 5000, // 5 x 10^3
                'max_mesofilos' => 10000, // 1 x 10^4
                'min_coliformes' => 10,
                'max_coliformes' => 100, // 1 x 10^2
                'min_mohos' => 100,
                'max_mohos' => 1000, // 1 x 10^3

            ],
            [
                'nombre' => 'GALLETA CON RELLENO ',
                'ubicacion_id' => 1,
                'unidad_id' => $unidadUfcG ? $unidadUfcG->id : null,
                'norma_microbiologico' => 'Referencia Norma Boliviana 39008, Harinas y Derivados - Galletas - Requisitos.',
                'norma_fisicoquimico' => null,
                'mesofilos' => true,
                'coliformes' => true,
                'mohos' => true,
                'mesofilos2' => false,
                'coliformes2' => false,
                'mohos2' => false,
                'temperatura' => true,
                'humedad' => true,
                'actividad_agua' => true,
                'ph' => false,
                'dureza' => false,
                'cloruros' => false,
                'min_mesofilos' => 5000, // 5x10^3
                'max_mesofilos' => 10000, // 1x10^4
                'min_coliformes' => 10,
                'max_coliformes' => 100, // 1x10^2
                'min_mohos' => 100, // 1x10^2
                'max_mohos' => 1000, // 1x10^3

            ],
            [
                'nombre' => 'GALLETA SIMPLE',

                'ubicacion_id' => 1,
                'unidad_id' => $unidadUfcG ? $unidadUfcG->id : null,
                'norma_microbiologico' => 'Referencia Norma Boliviana 39008, Harinas y Derivados - Galletas - Requisitos.',
                'norma_fisicoquimico' => null,
                'mesofilos' => false,
                'coliformes' => true,
                'mohos' => true,
                'mesofilos2' => false,
                'coliformes2' => false,
                'mohos2' => false,
                'temperatura' => true,
                'humedad' => true,
                'actividad_agua' => true,
                'ph' => false,
                'dureza' => false,
                'cloruros' => false,
                'min_mesofilos' => null,
                'max_mesofilos' => null,
                'min_coliformes' => null,
                'max_coliformes' => null,
                'min_mohos' => 50,
                'max_mohos' => 5000, // 50 x 10^2

            ],
            [
                'nombre' => 'HARINA',

                'ubicacion_id' => 1,
                'unidad_id' => $unidadUfcG ? $unidadUfcG->id : null,
                'norma_microbiologico' => 'Referencia Norma Boliviana 39008, Harinas y Derivados - Galletas - Requisitos y Norma Boliviana 39007, Harina y Derivados - Productos Panificados Requisitos.',
                'norma_fisicoquimico' => null,
                'mesofilos' => true,
                'coliformes' => true,
                'mohos' => true,
                'mesofilos2' => false,
                'coliformes2' => false,
                'mohos2' => false,
                'temperatura' => true,
                'humedad' => true,
                'actividad_agua' => true,
                'ph' => false,
                'dureza' => false,
                'cloruros' => false,
                'min_mesofilos' => null,
                'max_mesofilos' => 70000, // 7x10^4
                'min_coliformes' => null,
                'max_coliformes' => 1000, // 1x10^3
                'min_mohos' => null,
                'max_mohos' => 10000, // 1x10^4

            ],
            [
                'nombre' => 'OTROS',

                'ubicacion_id' => 1,
                'unidad_id' => $unidadUfcG ? $unidadUfcG->id : null,
                'norma_microbiologico' => 'Los parámetros no tienen límites de referencia, se recomienda al cliente tener en cuenta sus datos historicos.',
                'norma_fisicoquimico' => null,
                'mesofilos' => true,
                'coliformes' => true,
                'mohos' => true,
                'mesofilos2' => false,
                'coliformes2' => false,
                'mohos2' => false,
                'temperatura' => true,
                'humedad' => true,
                'actividad_agua' => true,
                'ph' => false,
                'dureza' => false,
                'cloruros' => false,
                'min_mesofilos' => null,
                'max_mesofilos' => null,
                'min_coliformes' => null,
                'max_coliformes' => null,
                'min_mohos' => null,
                'max_mohos' => null,

            ],
            [
                'nombre' => 'PAN ESPECIAL',

                'ubicacion_id' => 1,
                'unidad_id' => $unidadUfcG ? $unidadUfcG->id : null,
                'norma_microbiologico' => 'Referencia Norma Boliviana 39007, Harina y Derivados - Productos Panificados Requisitos.',
                'norma_fisicoquimico' => null,
                'mesofilos' => true,
                'coliformes' => true,
                'mohos' => true,
                'mesofilos2' => false,
                'coliformes2' => false,
                'mohos2' => false,
                'temperatura' => true,
                'humedad' => true,
                'actividad_agua' => true,
                'ph' => false,
                'dureza' => false,
                'cloruros' => false,
                'min_mesofilos' => null,
                'max_mesofilos' => null,
                'min_coliformes' => 10,
                'max_coliformes' => null,
                'min_mohos' => null,
                'max_mohos' => 100, // 1X10^2

            ],
            [
                'nombre' => 'PERSONAL',

                'ubicacion_id' => 1,
                'unidad_id' => $unidadUfcMano ? $unidadUfcMano->id : null,
                'norma_microbiologico' => 'Guía Tec. Anal. Microb. De Sup. en contacto con Alim. y Beb. RES. MIN. N°46-2007-MINSA Norma Peruana 346583',
                'norma_fisicoquimico' => null,
                'mesofilos' => false,
                'coliformes' => true,
                'mohos' => false,
                'mesofilos2' => false,
                'coliformes2' => false,
                'mohos2' => false,
                'temperatura' => false,
                'humedad' => false,
                'actividad_agua' => false,
                'ph' => false,
                'dureza' => false,
                'cloruros' => false,
                'min_mesofilos' => null,
                'max_mesofilos' => null,
                'min_coliformes' => null,
                'max_coliformes' => 100,
                'min_mohos' => null,
                'max_mohos' => null,

            ],
            [
                'nombre' => 'SUP. UTENSILIOS',

                'ubicacion_id' => 1,
                'unidad_id' => $unidadUfcArea ? $unidadUfcArea->id : null,
                'norma_microbiologico' => 'Guía Tec. Anal. Microb. De Sup. en contacto con Alim. y Beb. RES. MIN. N°46-2007-MINSA Norma Peruana 346583',
                'norma_fisicoquimico' => null,
                'mesofilos' => true,
                'coliformes' => true,
                'mohos' => false,
                'mesofilos2' => false,
                'coliformes2' => false,
                'mohos2' => false,
                'temperatura' => true,
                'humedad' => true,
                'actividad_agua' => true,
                'ph' => false,
                'dureza' => false,
                'cloruros' => false,
                'min_mesofilos' => null,
                'max_mesofilos' => null,
                'min_coliformes' => null,
                'max_coliformes' => 1,
                'min_mohos' => null,
                'max_mohos' => null,

            ],
            [
                'nombre' => 'SUPERFICIES',

                'ubicacion_id' => 1,
                'unidad_id' => $unidadUfcArea ? $unidadUfcArea->id : null,

                'norma_microbiologico' => 'Guía Tec. Anal. Microb. De Sup. en contacto con Alim. y Beb. RES. MIN. N°46-2007-MINSA Norma Peruana 346583',
                'norma_fisicoquimico' => null,
                'mesofilos' => true,
                'coliformes' => true,
                'mohos' => true,
                'mesofilos2' => false,
                'coliformes2' => false,
                'mohos2' => false,
                'temperatura' => true,
                'humedad' => true,
                'actividad_agua' => true,
                'ph' => false,
                'dureza' => false,
                'cloruros' => false,
                'min_mesofilos' => null,
                'max_mesofilos' => null,
                'min_coliformes' => null,
                'max_coliformes' => 10,
                'min_mohos' => null,
                'max_mohos' => null,

            ],
            [
                'nombre' => 'HARINA DE TRIGO',

                'norma_microbiologico' => 'Referencia Norma Boliviana 680, Harina y Derivados - Harina de trigo - Requisitos',
                'norma_fisicoquimico' => null,
                'mesofilos' => true,
                'coliformes' => true,
                'mohos' => true,
                'mesofilos2' => false,
                'coliformes2' => false,
                'mohos2' => false,
                'temperatura' => true,
                'humedad' => true,
                'actividad_agua' => true,
                'ph' => false,
                'dureza' => false,
                'cloruros' => false,
                'min_mesofilos' => null,
                'max_mesofilos' => 70000, // 7X10^4
                'min_coliformes' => null,
                'max_coliformes' => 100, // 1X10^2
                'min_mohos' => null,
                'max_mohos' => 10000, // 1X10^4

            ],
            [
                'nombre' => 'HARINA DE MAIZ',

                'ubicacion_id' => 1,
                'unidad_id' => $unidadUfcG ? $unidadUfcG->id : null,
                'norma_microbiologico' => 'Referencia Norma Boliviana 583, Harinas y derivados - Harina cruda de maiz - Requisitos',
                'norma_fisicoquimico' => null,
                'mesofilos' => false,
                'coliformes' => true,
                'mohos' => true,
                'mesofilos2' => false,
                'coliformes2' => false,
                'mohos2' => false,
                'temperatura' => true,
                'humedad' => true,
                'actividad_agua' => true,
                'ph' => false,
                'dureza' => false,
                'cloruros' => false,
                'min_mesofilos' => null,
                'max_mesofilos' => null,
                'min_coliformes' => null, // 7,0x10^4
                'max_coliformes' => 7000, // 1,0x10^2
                'min_mohos' => 100, // 1,0x10^4
                'max_mohos' => 10000,

            ],
            [
                'nombre' => 'AGUA OZONIZADA',


                'ubicacion_id' => 1,
                'unidad_id' => $unidadUfcMl ? $unidadUfcMl->id : null,
                'norma_microbiologico' => 'Norma Boliviana NB 325002, Bebidas Analcohólicas - Agua de Mesa - Requisitos',
                'norma_fisicoquimico' => null,
                'mesofilos' => true,
                'coliformes' => true,
                'mohos' => false,
                'mesofilos2' => false,
                'coliformes2' => false,
                'mohos2' => false,
                'temperatura' => true,
                'humedad' => true,
                'actividad_agua' => true,
                'ph' => false,
                'dureza' => false,
                'cloruros' => false,
                'min_mesofilos' => null,
                'max_mesofilos' => 20,
                'min_coliformes' => null,
                'max_coliformes' => 0,
                'min_mohos' => null,
                'max_mohos' => null,

            ],
            [
                'nombre' => 'PANETONES',

                'ubicacion_id' => 1,
                'unidad_id' => $unidadUfcG ? $unidadUfcG->id : null,
                'norma_microbiologico' => 'Referencia Norma Boliviana 39007, Harina y Derivados - Productos Panificados Requisitos.',
                'norma_fisicoquimico' => null,
                'mesofilos' => true,
                'coliformes' => true,
                'mohos' => true,
                'mesofilos2' => true,
                'coliformes2' => true,
                'mohos2' => true,
                'temperatura' => true,
                'humedad' => true,
                'actividad_agua' => true,
                'ph' => false,
                'dureza' => false,
                'cloruros' => false,
                'min_mesofilos' => null,
                'max_mesofilos' => null,
                'min_coliformes' => 10,
                'max_coliformes' => null,
                'min_mohos' => null,
                'max_mohos' => 100, // 1X10^2

            ],
        ];

        foreach ($tiposMuestra as $tipo) {
            // Verificar si ya existe para evitar duplicados
            $existente = TipoMuestralaboratorioExterno::where('nombre', $tipo['nombre'])->first();

            if (!$existente) {
                TipoMuestralaboratorioExterno::create($tipo);
            } else {
                // Actualizar el existente si es necesario
                $existente->update($tipo);
            }
        }
    }
}
