<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class MantenimientoSeeder1 extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $now = Carbon::now();

        $tipos = [
            ['codigo' => 'BAH', 'nombre' => 'Banco de Agua Helada', 'descripcion' => 'Sistema que enfría y almacena agua a bajas temperaturas, utilizado para procesos de refrigeración en la industria.'],
            ['codigo' => 'BOA', 'nombre' => 'Bomba de Agua', 'descripcion' => 'Dispositivo mecánico utilizado para mover agua desde un lugar a otro, crucial en el transporte de líquidos en sistemas industriales.'],
            ['codigo' => 'BOS', 'nombre' => 'Bomba Sanitaria', 'descripcion' => 'Bomba diseñada para el manejo higiénico de líquidos en la industria alimentaria, asegurando que no haya contaminación durante el proceso de transporte de fluidos.'],
            ['codigo' => 'CAL', 'nombre' => 'Caldero', 'descripcion' => 'Equipamiento utilizado para generar vapor mediante la combustión de combustibles, utilizado en procesos que requieren calefacción.'],
            ['codigo' => 'CIT', 'nombre' => 'Cinta Transportadora', 'descripcion' => 'Sistema mecánico utilizado para transportar productos a lo largo de una línea de producción, facilitando el movimiento de materiales de manera continua.'],
            ['codigo' => 'COM', 'nombre' => 'Compresor', 'descripcion' => 'Máquina que aumenta la presión de gases o aire para ser utilizado en diversos procesos industriales.'],
            ['codigo' => 'DDG', 'nombre' => 'Descascaradora de Granos', 'descripcion' => 'Máquina utilizada para remover la cáscara o piel de los granos en la producción agrícola o alimentaria.'],
            ['codigo' => 'DOC', 'nombre' => 'Dosificador', 'descripcion' => 'Equipamiento utilizado para dispensar cantidades precisas de ingredientes o productos en procesos de producción.'],
            ['codigo' => 'EAR', 'nombre' => 'Envasadora Automática Rotativa', 'descripcion' => 'Máquina que llena y sella envases de manera automática en un sistema rotativo, optimizando la velocidad en el envasado de productos.'],
            ['codigo' => 'EAV', 'nombre' => 'Envasadora Automática Vertical', 'descripcion' => 'Máquina de envasado que opera verticalmente, utilizada en la industria alimentaria para empaquetar productos sólidos o líquidos en bolsas.'],
            ['codigo' => 'EDM', 'nombre' => 'Equipo de Medición', 'descripcion' => 'Instrumentos utilizados para monitorear y medir parámetros específicos como temperatura, presión o flujo en procesos industriales.'],
            ['codigo' => 'ELA', 'nombre' => 'Equipo de Laboratorio', 'descripcion' => 'Conjunto de instrumentos utilizados para realizar análisis y pruebas de calidad en productos o materias primas.'],
            ['codigo' => 'ENA', 'nombre' => 'Envasadora Aséptica', 'descripcion' => 'Máquina diseñada para envasar productos de manera estéril, evitando la contaminación bacteriana y preservando la calidad del contenido.'],
            ['codigo' => 'HOM', 'nombre' => 'Homogeneizador', 'descripcion' => 'Máquina que mezcla de manera uniforme dos o más sustancias para obtener una distribución homogénea de las partículas.'],
            ['codigo' => 'LAB', 'nombre' => 'Lavadora', 'descripcion' => 'Equipo utilizado para limpiar productos o equipos en un proceso industrial, garantizando su higiene antes de su uso en la producción.'],
            ['codigo' => 'MDP', 'nombre' => 'Módulo de Pre-Cocimiento', 'descripcion' => 'Máquina que realiza la precocción de productos alimentarios, preparando ingredientes para el procesamiento posterior.'],
            ['codigo' => 'MIX', 'nombre' => 'Mezcladora', 'descripcion' => 'Equipo diseñado para mezclar ingredientes o productos, obteniendo una mezcla homogénea en la producción de alimentos o materiales.'],
            ['codigo' => 'PAS', 'nombre' => 'Pasteurizador', 'descripcion' => 'Máquina utilizada para calentar productos líquidos a una temperatura específica para eliminar patógenos sin afectar su calidad.'],
            ['codigo' => 'PLA', 'nombre' => 'Plataforma', 'descripcion' => 'Estructura elevada que proporciona soporte y accesibilidad a otras máquinas o equipos en la línea de producción.'],
            ['codigo' => 'PLC', 'nombre' => 'Placa de Conexiones', 'descripcion' => 'Dispositivo utilizado para interconectar los diferentes sistemas eléctricos o electrónicos de las máquinas, facilitando el control y la operación.'],
            ['codigo' => 'SDP', 'nombre' => 'Selladora de Pedal', 'descripcion' => 'Máquina manual utilizada para sellar bolsas o envases mediante la aplicación de calor, controlada a través de un pedal.'],
            ['codigo' => 'TAB', 'nombre' => 'Tablero', 'descripcion' => 'Panel de control que alberga interruptores, medidores y otros dispositivos necesarios para operar y monitorear los sistemas de una máquina.'],
            ['codigo' => 'TKA', 'nombre' => 'Tanque Acinox Almacenamiento', 'descripcion' => 'Tanque de acero inoxidable utilizado para almacenar líquidos o productos en la producción, especialmente en la industria alimentaria.'],
            ['codigo' => 'TKC', 'nombre' => 'Tanque Acinox Calentador', 'descripcion' => 'Tanque de acero inoxidable diseñado para calentar líquidos o ingredientes como parte del proceso de producción.'],
            ['codigo' => 'TKP', 'nombre' => 'Tanque Acinox Producción', 'descripcion' => 'Tanque utilizado específicamente durante la producción de alimentos o líquidos, hecho de acero inoxidable para garantizar la higiene.'],
            ['codigo' => 'TTK', 'nombre' => 'Termotanque', 'descripcion' => 'Dispositivo que calienta y almacena agua caliente, utilizado en procesos que requieren calefacción.'],
            ['codigo' => 'UBA', 'nombre' => 'Unidad Básica Automática', 'descripcion' => 'Sistema automatizado que realiza funciones específicas dentro de una cadena de producción, como el control o manejo de materiales.'],
            ['codigo' => 'ULA', 'nombre' => 'Ultrapasteurizador', 'descripcion' => 'Máquina utilizada para calentar productos líquidos a temperaturas más altas que el pasteurizador, extendiendo su vida útil sin necesidad de refrigeración.'],
            ['codigo' => 'VEN', 'nombre' => 'Ventilador', 'descripcion' => 'Dispositivo mecánico que mueve aire, utilizado para ventilación, enfriamiento o control de temperatura en procesos industriales.'],
        ];

        // Agregar timestamps
        $tipos = array_map(fn($t) => array_merge($t, ['created_at' => $now, 'updated_at' => $now]), $tipos);

        DB::table('MAN_tipo_maquina_equipos')->insert($tipos);



            DB::table('MAN_sectores')->insert([


            [ 'codigo' =>    'PLL-A01', 'nombre' =>    'SALA DE RECEPCION DE LECHE', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A03', 'nombre' =>    'SALA DE PASTEURIZADO', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A04', 'nombre' =>    'SALA DE FRACCIONADO', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A05', 'nombre' =>    'SALA DE PREPARACIONES Y MEZCLAS 1', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A07', 'nombre' =>    'SALA DE SABORIZADO', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A08', 'nombre' =>    'SALA DE ULTRA PASTEURIZADO', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A09', 'nombre' =>    'SALA DE ENVASADO HTST', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A10', 'nombre' =>    'SALA DE ENVASADO UHT', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A11', 'nombre' =>    'SALA ENVASADA DE VASOS', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A12', 'nombre' =>    'SALA DE CALDEROS', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A13', 'nombre' =>    'ÁREA DE TRATAMIENTO DE AGUAS RESIDUALES', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A14', 'nombre' =>    'SALA DE SERVICIOS - 1', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A15', 'nombre' =>    'ÁREA VACÍA', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A16', 'nombre' =>    'RECEPCIÓN DE DEVOLUCIONES PT', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A17', 'nombre' =>    'LABORATORIO SALA DE ESTERILIZACIÓN', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A18', 'nombre' =>    'LABORATORIO SALA PREPARACIÓN DE MATERIAL', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A19', 'nombre' =>    'ALMACÉN DE MATERIA PRIMA 3', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A20', 'nombre' =>    'ALMACÉN DE PRODUCTOS TERMINADOS 1', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A21', 'nombre' =>    'ALMACÉN DE PRODUCTOS TERMINADOS 2', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A22', 'nombre' =>    'CÁMARA DE REFRIGERACIÓN 1 (AMQ-125)', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A23', 'nombre' =>    'CÁMARA DE REFRIGERACIÓN 2 (AMQ-1292)', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A24', 'nombre' =>    'CAMARA DE REFRIGERACION 3 (AMQ-627)', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A25', 'nombre' =>    'CAMARA DE REFRIGERACION 4 (AMQ-628)', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A26', 'nombre' =>    'CAMARA DE REFRIGERACION 5 (AMQ-629)', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A27', 'nombre' =>    'ALMACÉN DE PRODUCTO TERMINADO (DESPACHO)', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A28', 'nombre' =>    'OFICINA DE ALMACÉN DE PRODUCTO TERMINADO', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A29', 'nombre' =>    'LABORATORIO DE CONTROL DE CALIDAD', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A30', 'nombre' =>    'LABORATORIO SALA DE SIEMBRA', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A31', 'nombre' =>    'LABORATORIO SALA DE INCUBACIÓN', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A32', 'nombre' =>    'OFICINA DE JEFATURA DE PLANTA', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A33', 'nombre' =>    'OFICINA DE JEFATURA DE CONTROL DE CALIDAD', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A34', 'nombre' =>    'OFICINA DE JEFATURA DE MANTENIMIENTO', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A35', 'nombre' =>    'OFICINA DE PRODUCCIÓN', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A36', 'nombre' =>    'OFICINA DE CONTROL DE CALIDAD MP Y PT', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A37', 'nombre' =>    'SALA DE CONTRA MUESTRAS DE MATERIA PRIMA', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A39', 'nombre' =>    'DEPOSITO DE MATERIALES DE LIMPIEZA', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A40', 'nombre' =>    'VESTIDOR DE PERSONAL OBRERO VARONES', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A41', 'nombre' =>    'VESTIDOR DE PERSONAL OBRERO MUJERES', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A42', 'nombre' =>    'VESTIDOR DE PERSONAL ADMINISTRATIVO VARONES', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A43', 'nombre' =>    'VESTIDOR DE PERSONAL ADMINISTRATIVO MUJERES', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A44', 'nombre' =>    'PASILLO DE INGRESO A PLANTA', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A45', 'nombre' =>    'PASILLO DE VESTIDORES DEL PERSONAL OBRERO', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A46', 'nombre' =>    'PASILLO DE PLANTA', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A47', 'nombre' =>    'PASILLO ENTRADA AREA TRATAMIENTO DE AGUAS RESIDUALES', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A48', 'nombre' =>    'BAÑO DE PERSONAL OBRERO MUJERES', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A49', 'nombre' =>    'BAÑO DE PERSONAL OBRERO VARONES', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A50', 'nombre' =>    'BAÑO DE PERSONAL ADMINISTRATIVO', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A51', 'nombre' =>    'DEPOSITO', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A54', 'nombre' =>    'SALA DE CONTRAMUESTRAS DE PRODUCTO TERMINADO', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A55', 'nombre' =>    'ÁREA DE RESIDUOS SÓLIDOS CELULOSAS', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A56', 'nombre' =>    'ÁREA DE RESIDUOS SÓLIDOS ORGÁNICOS', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A57', 'nombre' =>    'ÁREA DE RESIDUOS SÓLIDOS PLÁSTICOS', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A58', 'nombre' =>    'ÁREA DE RESIDUOS SÓLIDOS YUTES, ENVASES SUSTANCIAS PELIGROSAS', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A59', 'nombre' =>    'ALMACÉN DE SUSTANCIAS CONTROLADAS', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A60', 'nombre' =>    'OFICINA DE DISEÑO Y DESARROLLO', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A61', 'nombre' =>    'PASILLO ÁREA DE RESIDUOS SOLIDOS', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A62', 'nombre' =>    'SALA DE ENVASADO UHT', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A63', 'nombre' =>    'SALA DE PRODUCCION DE QUESOS', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A64', 'nombre' =>    'SALA DE SALMUERA', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A65', 'nombre' =>    'SALA DE FRACCIONADO Y OREADO', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A66', 'nombre' =>    'SALA DE LAVADO DE TELAS', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A67', 'nombre' =>    'SALA DE LAVADO DE BANDEJAS', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'MAN-A01', 'nombre' =>    'ALMACÉN DE REPUESTOS', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'MAN-A02', 'nombre' =>    'TALLER DE MANTENIMIENTO', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A01', 'nombre' =>    'PASILLO SELECCIÓN DE SOYA', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A02', 'nombre' =>    'SALA DE PELADO DE SOYA', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A03', 'nombre' =>    'SALA DE FRACCIONADO SOYA', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A04', 'nombre' =>    'SALA DE PRODUCCIÓN DE SOYA', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A05', 'nombre' =>    'SALA DE FRACCIONADO', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A06', 'nombre' =>    'SALA DE SELECCIÓN SOYA', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A07', 'nombre' =>    'SALA DE RECEPCIÓN DE FRUTAS Y HORTALIZAS', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A08', 'nombre' =>    'SALA DE PELADO Y EXTRACCIÓN DE FRUTAS Y HORTALIZAS', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A09', 'nombre' =>    'SALA DE EXTRACCIÓN DE PULPAS', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A10', 'nombre' =>    'SALA DE PASTEURIZADO Y ENVASADO DE FRUTAS Y HORTALIZAS', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A11', 'nombre' =>    'DEPÓSITO DE EQUIPOS Y MATERIALES', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A12', 'nombre' =>    'SALA DE PRODUCCIÓN DE AGUAS', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A13', 'nombre' =>    'LABORATORIO DE DISEÑO Y DESARROLLO', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A14', 'nombre' =>    'LABORATORIO DE CONTROL DE CALIDAD', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A15', 'nombre' =>    'DEPÓSITO DE ENVASES PLÁSTICOS', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A16', 'nombre' =>    'DEPÓSITO DE MATERIAL DE LIMPIEZA', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A18', 'nombre' =>    'ALMACÉN DE MATERIA PRIMA 1', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A19', 'nombre' =>    'SALA DE SERVICIOS', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A20', 'nombre' =>    'CÁMARA DE REFRIGERACIÓN 1 (AMQ-055)', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A21', 'nombre' =>    'CÁMARA DE REFRIGERACIÓN 2 (AMQ-056)', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A22', 'nombre' =>    'CÁMARA DE REFRIGERACIÓN 3 (AMQ-083)', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A23', 'nombre' =>    'CAMARA DE REFRIGERACIÓN 4 (AMQ-3000)', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A24', 'nombre' =>    'PASILLO CÁMARA DE REFRIGERACIÓN', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A25', 'nombre' =>    'OFICINA DE JEFATURA DE PLANTA', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A26', 'nombre' =>    'OFICINA DE PRODUCCIÓN', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A27', 'nombre' =>    'SALA DE INGRESO A PLANTA', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A28', 'nombre' =>    'VESTIDOR DE PERSONAL ADMINISTRATIVO', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A29', 'nombre' =>    'PASILLO DE INGRESO PERSONAL OBRERO', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A30', 'nombre' =>    'VESTIDOR DE PERSONAL OBRERO VARONES', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A31', 'nombre' =>    'VESTIDOR DE PERSONAL OBRERO MUJERES', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A32', 'nombre' =>    'BAÑO DE PERSONAL OBRERO MUJERES', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A33', 'nombre' =>    'BAÑO DE PERSONAL OBRERO VARONES', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A34', 'nombre' =>    'BAÑO DE PERSONAL ADMINISTRATIVO MUJERES', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A35', 'nombre' =>    'BAÑO DE PERSONAL ADMINISTRATIVO VARONES', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A39', 'nombre' =>    'INGRESO PRINCIPAL PLANTA SOYA', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A40', 'nombre' =>    'SALA DE OKARA', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A41', 'nombre' =>    'PASILLO CÁMARAS DE REFRIGERACIÓN', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A42', 'nombre' =>    'PASILLO DE CÁMARAS DE REFRIGERACIÓN', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A43', 'nombre' =>    'PASILLO INGRESO A PLANTA', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A44', 'nombre' =>    'RECEPCIÓN DE CASCARILLA', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLL-A06', 'nombre' =>    'SALA DE MARMITA', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLS-A00', 'nombre' =>    'PLANTA DE SOYA', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLL-A00', 'nombre' =>    'PLANTA DE LACTEOS', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLS-A36', 'nombre' =>    'SALA SUB SUELO', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'ADM-A00', 'nombre' =>    'OFICINAS ADMINISTRACION', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLS-A17', 'nombre' =>    'ALMACEN DE MATERIA PRIMA 2', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLP-A00', 'nombre' =>    'PLANTA GENERAL PANADERÍA', 'ubicacion_id'    => 5],
            [ 'codigo' =>    'ALM-001', 'nombre' =>    'ALMACEN LOS CEDROS', 'ubicacion_id'    => 8],
            [ 'codigo' =>    'PLG-A00', 'nombre' =>    'PLANTA GENERAL GALLETERÍA', 'ubicacion_id'    => 6],
            [ 'codigo' =>    'ADM-A08', 'nombre' =>    'OFICINAS RECURSOS HUMANOS', 'ubicacion_id'    => 7],
            [ 'codigo' =>    'ADM-A20', 'nombre' =>    'EDIFICIO NUEVO', 'ubicacion_id'    => 7],
            [ 'codigo' =>    'AGE-005', 'nombre' =>    'AGENCIA VILLA EL CARMEN', 'ubicacion_id'    => 9],
            [ 'codigo' =>    'ADM-A16', 'nombre' =>    'ALACENA COMEDOR', 'ubicacion_id'    => 7],
            [ 'codigo' =>    'ADM-A15', 'nombre' =>    'COMEDOR COCINA', 'ubicacion_id'    => 7],
            [ 'codigo' =>    'AGE-001', 'nombre' =>    'AGENCIA VILLA BOLIVAR', 'ubicacion_id'    => 10],
            [ 'codigo' =>    'PLL-A53', 'nombre' =>    'ENTRE TECHO', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'ADM-A18', 'nombre' =>    'BAÑO PG/MUJERES', 'ubicacion_id'    => 7],
            [ 'codigo' =>    'VDR-008', 'nombre' =>    'SANIDAD', 'ubicacion_id'    => 7],
            [ 'codigo' =>    'ADM-A19', 'nombre' =>    'INGRESO PRINCIPAL SOALPRO', 'ubicacion_id'    => 7],
            [ 'codigo' =>    'ADM-A07', 'nombre' =>    'OFICINAS 1ER PISO (PENTÁGONO)', 'ubicacion_id'    => 7],
            [ 'codigo' =>    'PLL-A02', 'nombre' =>    'SALA DE SERVICIOS - 2', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A38', 'nombre' =>    'OFICINA ALMACÉN DE MATERIA PRIMA', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLL-A52', 'nombre' =>    'PATIO LÁCTEOS', 'ubicacion_id'    => 1],
            [ 'codigo' =>    'PLS-A37', 'nombre' =>    'PATIO DE DESPACHO DE PRODUCTO TERMINADO', 'ubicacion_id'    => 2],
            [ 'codigo' =>    'PLS-A38', 'nombre' =>    'PATIO FRONTAL PLANTA SOYA', 'ubicacion_id'    => 2],

        ]);



    }
}
