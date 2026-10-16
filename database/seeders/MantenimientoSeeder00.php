<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

use App\Domain\Sistema\Configuracion\Models\User;

use Illuminate\Support\Facades\Hash;

class MantenimientoSeeder00 extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
























            $proveedores = [
            ['codigo' => 'P00001', 'nombre' => 'Tetra Pack S.R.L.', 'telefono' => '3402158'],
            ['codigo' => 'P00002', 'nombre' => 'Control Experto', 'telefono' => '2226923'],
            ['codigo' => 'P00003', 'nombre' => 'Liz Mar', 'telefono' => '7153648'],
            ['codigo' => 'P00004', 'nombre' => 'Auto Repuetos J&L', 'telefono' => '7054579'],
            ['codigo' => 'P00005', 'nombre' => 'Torneria Alem', 'telefono' => '2833249'],
            ['codigo' => 'P00006', 'nombre' => 'Perneria Industrial', 'telefono' => '7052091'],
            ['codigo' => 'P00007', 'nombre' => 'Multicenter S.R.L.', 'telefono' => '3431700'],
            ['codigo' => 'P00008', 'nombre' => 'Correas Universal', 'telefono' => '3536872'],
            ['codigo' => 'P00009', 'nombre' => 'Atlas Copco Bolivia S.A.', 'telefono' => '3436868'],
            ['codigo' => 'P00010', 'nombre' => 'EBAC INDUSTRIAL SRL.', 'telefono' => '2311863'],
            ['codigo' => '000001', 'nombre' => 'Adiministracion SOALPRO SRL', 'telefono' => null],
            ['codigo' => 'P00011', 'nombre' => 'Reg. Farma. Dra. Gladys F. Itu', 'telefono' => null],
            ['codigo' => 'P00012', 'nombre' => 'Electrored Bolivia SRL', 'telefono' => '2821322-'],
            ['codigo' => 'P00013', 'nombre' => 'PERTEC SRL', 'telefono' => '2815426'],
            ['codigo' => 'P00014', 'nombre' => 'Finilager S.A.', 'telefono' => '2820110'],
            ['codigo' => 'P00015', 'nombre' => 'Roghur S.A.', 'telefono' => '2423178-'],
            ['codigo' => 'P00016', 'nombre' => 'VAPORINOX INGENIERIA SRL', 'telefono' => '2811837-'],
            ['codigo' => 'P00017', 'nombre' => 'Ferreteria DITHER', 'telefono' => '7068821'],
            ['codigo' => 'P00018', 'nombre' => 'Perno Centro ltda', 'telefono' => '2822724-'],
            ['codigo' => 'P00019', 'nombre' => 'Centro Hidraulico', 'telefono' => '2829045'],
            ['codigo' => 'P00020', 'nombre' => 'SMC Automation Bolivia S.R.L', 'telefono' => '2813344-'],
            ['codigo' => 'P00021', 'nombre' => 'Bolivian Electric', 'telefono' => '2824363'],
            ['codigo' => 'P00022', 'nombre' => 'ESMAQ Especialistas en Maquina', 'telefono' => '6110032'],
            ['codigo' => 'P00023', 'nombre' => 'Ferreteria INTI', 'telefono' => '2824852-'],
            ['codigo' => 'P00024', 'nombre' => 'ICA Industrias del Caucho', 'telefono' => '2831135-'],
            ['codigo' => 'P00025', 'nombre' => 'AGSA Agencias Generales S.A.', 'telefono' => '2824995'],
            ['codigo' => 'P00026', 'nombre' => 'Inox Supply Ingenieria', 'telefono' => '2820293-'],
            ['codigo' => 'P00027', 'nombre' => 'Mundo Industrial', 'telefono' => '2281080'],
            ['codigo' => 'P00028', 'nombre' => 'Ferro Perno S.R.L.', 'telefono' => '2825220-'],
            ['codigo' => 'P00029', 'nombre' => 'Monopol LTDA', 'telefono' => '2180222'],
            ['codigo' => 'P00030', 'nombre' => 'IMPORTACIONES CESARINES S.R.L.', 'telefono' => '6976003'],
            ['codigo' => 'P00031', 'nombre' => 'Casa de Pinturas Favio', 'telefono' => '7584421'],
            ['codigo' => 'P00032', 'nombre' => 'Ferreteria Ximena', 'telefono' => '7014363'],
            ['codigo' => 'P00033', 'nombre' => 'Ferreteria ALVA', 'telefono' => '2825870-'],
            ['codigo' => 'P00034', 'nombre' => 'Oxilap', 'telefono' => '2767018'],
            ['codigo' => 'P00035', 'nombre' => 'Dinive', 'telefono' => null],
            ['codigo' => 'P00036', 'nombre' => 'EBAC Industrial S.R.L.', 'telefono' => '2311863-'],
            ['codigo' => 'P00037', 'nombre' => 'Ci Control Ltda.', 'telefono' => '2816430'],
            ['codigo' => 'P00038', 'nombre' => 'Widman International S.R.L.', 'telefono' => '3442233'],
            ['codigo' => 'P00039', 'nombre' => 'KIM-TEC Servicio Electrico Ind', 'telefono' => '2823486-'],
            ['codigo' => 'P00041', 'nombre' => 'Tecnosirec S.R.L.', 'telefono' => '2202338-'],
            ['codigo' => 'P00040', 'nombre' => 'GRUAS EDDY', 'telefono' => '7326594'],
            ['codigo' => 'P00042', 'nombre' => 'F.M. Tronica', 'telefono' => '7956898'],
            ['codigo' => 'P00043', 'nombre' => 'SIMA PACK', 'telefono' => null],
            ['codigo' => 'P00044', 'nombre' => 'Femco', 'telefono' => '2820898-'],
            ['codigo' => 'P00045', 'nombre' => 'Las Lomas', 'telefono' => '2811114'],
            ['codigo' => 'P00046', 'nombre' => 'Gismart S.R.L.', 'telefono' => '2823606'],
            ['codigo' => 'P00047', 'nombre' => 'Electrofrio Soluciones Integra', 'telefono' => '4258205-'],
            ['codigo' => 'P00048', 'nombre' => 'Ferreteria Don Ferro Av Jorge', 'telefono' => null],
            ['codigo' => 'P00049', 'nombre' => 'Electroindustrial S.R.L.', 'telefono' => '2825055-'],
            ['codigo' => 'P00050', 'nombre' => 'Tecnica de Fluidos Bolivia S.R', 'telefono' => '2145194'],
            ['codigo' => 'P00051', 'nombre' => 'Ferreteria J.Q.', 'telefono' => '7627814'],
            ['codigo' => '000002', 'nombre' => 'Fabricacion en Taller de Mante Planta', 'telefono' => null],
            ['codigo' => 'P00052', 'nombre' => 'A Todo Led Technology', 'telefono' => '2770564-'],
            ['codigo' => 'P00053', 'nombre' => 'Electronica Daytron', 'telefono' => '7069676'],
            ['codigo' => 'P00054', 'nombre' => 'LevCorp', 'telefono' => '2291546'],
            ['codigo' => 'P00055', 'nombre' => 'Roberto Orlando', 'telefono' => null],
            ['codigo' => 'P00056', 'nombre' => 'JEB Electronics S.R.L', 'telefono' => '2495379'],
            ['codigo' => 'P00057', 'nombre' => 'CASATEC Calle', 'telefono' => null],
            ['codigo' => 'P00058', 'nombre' => 'IMPORTACIONES PROMETEO SRL', 'telefono' => '2831347'],
            ['codigo' => 'P00059', 'nombre' => 'Mundo de los Acrilicos', 'telefono' => '2450631-'],
            ['codigo' => 'P00060', 'nombre' => 'Ferreteria Economica Av litoral', 'telefono' => null],
            ['codigo' => 'P00061', 'nombre' => 'DISAAT Soluciones Integrales', 'telefono' => '2318027-'],
            ['codigo' => 'P00062', 'nombre' => 'Rolando Nicanor Velasco Quispe', 'telefono' => '6511706'],
            ['codigo' => 'P00063', 'nombre' => 'Venta de Artefac. Electrodomes', 'telefono' => null],
            ['codigo' => 'P00064', 'nombre' => 'Planta Alamo', 'telefono' => null],
            ['codigo' => 'P00065', 'nombre' => 'Ferreteria Katerin Av', 'telefono' => '6'],
            ['codigo' => 'P00066', 'nombre' => 'Machine Electric', 'telefono' => '7967042'],
            ['codigo' => 'P00067', 'nombre' => 'Agro Tec', 'telefono' => '2711005'],
            ['codigo' => 'P00068', 'nombre' => 'Dionic Electronica', 'telefono' => '7065434'],
            ['codigo' => 'P00069', 'nombre' => 'Riegotodo S.R.L.', 'telefono' => '2829072'],
            ['codigo' => 'P00070', 'nombre' => 'Automotivos Cristo Viene', 'telefono' => '2823079'],
            ['codigo' => 'P00071', 'nombre' => 'Anjo Colors', 'telefono' => '7056342'],
            ['codigo' => 'P00072', 'nombre' => 'Ferreteria Cristal', 'telefono' => '7964422'],
            ['codigo' => 'P00073', 'nombre' => 'WapLine', 'telefono' => '7525302'],
            ['codigo' => 'P00074', 'nombre' => 'Garden Bolivia SRL', 'telefono' => '2495379'],
            ['codigo' => 'P00075', 'nombre' => 'Campero', 'telefono' => '2814995'],
            ['codigo' => 'P00076', 'nombre' => 'Foquito', 'telefono' => '2824578-'],
            ['codigo' => 'P00077', 'nombre' => 'Bulcano', 'telefono' => '7757161'],
            ['codigo' => 'P00078', 'nombre' => 'Ferreteria San Marcos', 'telefono' => '7728072'],
            ['codigo' => 'P00079', 'nombre' => 'Casa del Reten', 'telefono' => '7259061'],
            ['codigo' => 'P00080', 'nombre' => 'RICKER CASA DE PINTURAS', 'telefono' => '7656710'],
            ['codigo' => 'P00081', 'nombre' => 'Ferreteria Valentina', 'telefono' => '7300470'],
            ['codigo' => 'P00082', 'nombre' => 'Tecnostihl', 'telefono' => '2825940-'],
            ['codigo' => 'P00083', 'nombre' => 'Sociedad Synergy ltda', 'telefono' => '2825393'],
            ['codigo' => 'P00084', 'nombre' => 'Ferreteria Largo C & A', 'telefono' => '7250963'],
            ['codigo' => 'P00085', 'nombre' => 'Vidrieria-Aluminio MEXICO', 'telefono' => '7914440'],
            ['codigo' => 'P00086', 'nombre' => 'Ferreteria Torni', 'telefono' => '6730732'],
            ['codigo' => 'P00087', 'nombre' => 'Gigantografia JPG', 'telefono' => null],
            ['codigo' => 'P00088', 'nombre' => 'Intelectric', 'telefono' => '2821482'],
            ['codigo' => 'P00089', 'nombre' => 'Veloman', 'telefono' => '2463670'],
            ['codigo' => 'P00090', 'nombre' => 'Tecmains', 'telefono' => '2820321'],
            ['codigo' => '800091', 'nombre' => 'Stanley', 'telefono' => '2823959'],
            ['codigo' => 'P00091', 'nombre' => 'Salcef S.R.L.', 'telefono' => '2472596-'],
            ['codigo' => 'P00092', 'nombre' => 'Importadora Dimibe', 'telefono' => '4065381-'],
            ['codigo' => 'P00093', 'nombre' => 'Ventilacion Industrial SIVER', 'telefono' => '7062982'],
            ['codigo' => 'P00094', 'nombre' => 'Willy`s herramientas electrica', 'telefono' => '2286894'],
            ['codigo' => 'P00095', 'nombre' => 'Hansa Ltda', 'telefono' => '2811654'],
            ['codigo' => 'P00096', 'nombre' => 'Jhesua Pernos Mangueras y Repu', 'telefono' => '2824132-'],
            ['codigo' => 'P00097', 'nombre' => 'Veind- M&E', 'telefono' => '2236018-'],
            ['codigo' => 'P00098', 'nombre' => 'LUBRICENTRO CHECOLPAZ', 'telefono' => '2829584-'],
            ['codigo' => 'P00099', 'nombre' => 'LEOCADIO QUISPE CHOQUE', 'telefono' => '7622681'],
            ['codigo' => 'P00100', 'nombre' => 'COBOXI SRL', 'telefono' => '2818796'],
            ['codigo' => 'P00101', 'nombre' => 'SOLDATEC IMPORT', 'telefono' => '7196489'],
            ['codigo' => 'P00102', 'nombre' => 'Electric Iluminaciones R&F', 'telefono' => '7727644'],
            ['codigo' => 'P00103', 'nombre' => 'FERRETERIA APOSTOL SANTIAGO', 'telefono' => '6557752'],
            ['codigo' => 'P00104', 'nombre' => 'ELECSTER', 'telefono' => null],
            ['codigo' => 'P00105', 'nombre' => 'Ferreteria DURAPLASTIC', 'telefono' => '6971907'],
            ['codigo' => 'P00106', 'nombre' => 'Ferreteria LIMBER', 'telefono' => '2486097'],
            ['codigo' => 'P00107', 'nombre' => 'Ferreteria VANIA Isaac', 'telefono' => null],
            ['codigo' => 'P00108', 'nombre' => 'TETRAPACK', 'telefono' => null],
            ['codigo' => 'P00109', 'nombre' => 'Audi Colors', 'telefono' => '7727184'],
            ['codigo' => 'P00110', 'nombre' => 'Copans Importadora', 'telefono' => '7775009'],
            ['codigo' => 'P00111', 'nombre' => 'ELECTRONICA GENERAL Z/16 DE', 'telefono' => null],
            ['codigo' => 'P00112', 'nombre' => 'Ferreteria Jehova', 'telefono' => '7729400'],
            ['codigo' => 'P00113', 'nombre' => 'Lubricentro Checolpaz', 'telefono' => '2829584'],
            ['codigo' => 'P00114', 'nombre' => 'Tienda de Pinturas Melany', 'telefono' => '6112090'],
            ['codigo' => 'P00115', 'nombre' => 'Casa de Pinturas Sherlyn Z/12 de', 'telefono' => null],
            ['codigo' => 'P00116', 'nombre' => 'Casa Color de Hogar', 'telefono' => '2195968'],
            ['codigo' => 'P00117', 'nombre' => 'Interflon', 'telefono' => null],
            ['codigo' => 'P00118', 'nombre' => 'Distribuidora J Y M Calle', 'telefono' => '7'],
            ['codigo' => 'P00119', 'nombre' => 'IDESEM S.R.L.', 'telefono' => '7770840'],
            ['codigo' => 'P00120', 'nombre' => 'Axiofrio', 'telefono' => null],
            ['codigo' => 'P00121', 'nombre' => 'Torneria POLY', 'telefono' => '7726582'],
            ['codigo' => 'P00122', 'nombre' => 'Equipo de Proteccion y Segurid', 'telefono' => '6806817'],
            ['codigo' => 'P00123', 'nombre' => 'FANAGOM INDUSTRIA DE GOMA', 'telefono' => '2851113'],
            ['codigo' => 'P00124', 'nombre' => 'Importadora Sur SRL', 'telefono' => '2281620'],
            ['codigo' => 'P00125', 'nombre' => 'Aluminios Bolivia', 'telefono' => null],
    ];

        $now = Carbon::now();

        foreach ($proveedores as &$proveedor) {
            $proveedor['created_at'] = $now;
            $proveedor['updated_at'] = $now;
            $proveedor['direccion'] = null;
            $proveedor['encargado'] = null;
            $proveedor['estado_id'] = null;
            $proveedor['deleted_at'] = null;
        }

        DB::table('MAN_proveedores')->insert($proveedores);
    }














}
