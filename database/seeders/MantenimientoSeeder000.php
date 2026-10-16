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

class MantenimientoSeeder000 extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
























            $proveedores = [
            ['codigo' => 'P00126', 'nombre' => 'Wachsen S.R.L', 'telefono' => '6'],
            ['codigo' => 'P00127', 'nombre' => 'Ferreteria Castillo Av jorge', 'telefono' => null],
            ['codigo' => 'P00128', 'nombre' => 'O.E. SRL', 'telefono' => '2452055'],
            ['codigo' => 'P00129', 'nombre' => 'Torrellio Sostres Andrea', 'telefono' => null],
            ['codigo' => 'P00130', 'nombre' => 'Eximaq Industria e Comercio de', 'telefono' => null],
            ['codigo' => 'P00131', 'nombre' => 'PRIMO Santa fe', 'telefono' => null],
            ['codigo' => 'P00132', 'nombre' => 'Perfectsoy', 'telefono' => '5541356'],
            ['codigo' => 'P00133', 'nombre' => 'TEOFILO BASILIO CASTRILLO HELG', 'telefono' => null],
            ['codigo' => 'P00134', 'nombre' => 'Distorpoma', 'telefono' => '7014851'],
            ['codigo' => 'P00135', 'nombre' => 'Electronica y Ferreteria', 'telefono' => '7253029'],
            ['codigo' => 'P00136', 'nombre' => 'Ferreteria Beto', 'telefono' => '7050451'],
            ['codigo' => 'P00137', 'nombre' => 'E.S. Apostol Santiago', 'telefono' => null],
            ['codigo' => 'P00138', 'nombre' => 'Ferreteria Mary', 'telefono' => '7723009'],
            ['codigo' => 'P00139', 'nombre' => 'AGUILERA PEREZ DAINIER Alto', 'telefono' => null],
            ['codigo' => 'P00140', 'nombre' => 'Cuboxi', 'telefono' => '2818796'],
            ['codigo' => 'P00141', 'nombre' => 'HANNA INSTRUMENTS EQUIPOS BOLI Av', 'telefono' => '6'],
            ['codigo' => 'P00142', 'nombre' => 'Venta de Repuestos de Cocinas', 'telefono' => '7196862'],
            ['codigo' => 'P00143', 'nombre' => 'G Y A ELECTRONIC', 'telefono' => '7127233'],
            ['codigo' => 'P00144', 'nombre' => 'Distribuciones Jesucristo es a', 'telefono' => '7673701'],
            ['codigo' => 'P00145', 'nombre' => 'Importaciones Ardunel', 'telefono' => '7955158'],
            ['codigo' => 'P00146', 'nombre' => 'EPY electronica', 'telefono' => '7965234'],
            ['codigo' => 'P00147', 'nombre' => 'SOLOPERNO', 'telefono' => '2826016'],
            ['codigo' => 'P00148', 'nombre' => 'TAGMAN ELECTRIC', 'telefono' => '7523490'],
            ['codigo' => 'P00149', 'nombre' => 'Carlos Diego Loayza', 'telefono' => '2829045'],
            ['codigo' => 'P00150', 'nombre' => 'HERRACRUZ S.A.', 'telefono' => null],
            ['codigo' => 'P00151', 'nombre' => 'Distribuidora Triguero', 'telefono' => '7192987'],
            ['codigo' => 'P00152', 'nombre' => 'Procebol SRL', 'telefono' => '7486959'],
            ['codigo' => 'P00153', 'nombre' => 'Ferreteria Litoral', 'telefono' => '7254516'],
            ['codigo' => 'P00154', 'nombre' => 'Repuestos Rodapaz', 'telefono' => null],
            ['codigo' => 'P00155', 'nombre' => 'Ferreteria Tools Center Stanle', 'telefono' => '7069140-'],
            ['codigo' => 'P00156', 'nombre' => 'FerraPaz', 'telefono' => '7126811'],
            ['codigo' => '100000', 'nombre' => 'Generico', 'telefono' => null],
            ['codigo' => 'P00157', 'nombre' => 'Raqzeldy', 'telefono' => '7323290'],
            ['codigo' => 'P00158', 'nombre' => 'Dylariss', 'telefono' => '7881766'],
            ['codigo' => 'P00159', 'nombre' => 'MOPART Av', 'telefono' => '6'],
            ['codigo' => 'P00160', 'nombre' => 'SHADDAI', 'telefono' => '2824132'],
            ['codigo' => 'P00161', 'nombre' => 'Home Center Omega', 'telefono' => '7010134'],
            ['codigo' => 'P00162', 'nombre' => 'Ferreteria Patzi', 'telefono' => '7968535'],
            ['codigo' => 'P00163', 'nombre' => 'Tacman Electric', 'telefono' => '7523490'],
            ['codigo' => 'P00164', 'nombre' => 'STI Servicios Tecnicos e Impor', 'telefono' => '7154816'],
            ['codigo' => 'P00165', 'nombre' => 'IMPORTADORA INCA Ladislao', 'telefono' => null],
            ['codigo' => 'P00166', 'nombre' => 'LE MANS LTDA', 'telefono' => '2283474'],
            ['codigo' => 'P00167', 'nombre' => 'Digicorp ltda', 'telefono' => '7203908'],
            ['codigo' => 'P00168', 'nombre' => 'Z ELECTRIC', 'telefono' => '7621114'],
            ['codigo' => 'P00169', 'nombre' => 'Punto Total', 'telefono' => '7079424'],
            ['codigo' => 'P00170', 'nombre' => 'Mercantil Leon S.R.L.', 'telefono' => '3364244'],
            ['codigo' => 'P00171', 'nombre' => 'Ferreteria San Luis', 'telefono' => '6817171'],
            ['codigo' => 'P00172', 'nombre' => 'Autorepuestos Azriel', 'telefono' => '7198428'],
            ['codigo' => 'P00173', 'nombre' => 'Marckfire', 'telefono' => '7055570'],
            ['codigo' => 'P00174', 'nombre' => 'Zamora Nogales Gaston Manuel', 'telefono' => '3257244'],
            ['codigo' => 'P00175', 'nombre' => 'Ferreteria Nayeli', 'telefono' => '7630246'],
            ['codigo' => 'P00176', 'nombre' => 'Ferreteria Evelin', 'telefono' => '6563772'],
            ['codigo' => 'P00177', 'nombre' => 'Casa del Minero', 'telefono' => '6056608'],
            ['codigo' => 'P00178', 'nombre' => 'Hiller Electric SA', 'telefono' => '2445466'],
            ['codigo' => 'P00179', 'nombre' => 'Quiloci SRL', 'telefono' => '7620701'],
            ['codigo' => 'P00180', 'nombre' => 'INDUCOM Av', 'telefono' => null],
            ['codigo' => 'P00181', 'nombre' => 'Ferreteria Alexis', 'telefono' => '6986480'],
            ['codigo' => 'P00182', 'nombre' => 'Fit Glass', 'telefono' => '7956382'],
            ['codigo' => 'P00183', 'nombre' => 'Imp Val USA GLOBALLY SOURCED M', 'telefono' => '7194296'],
            ['codigo' => 'P00184', 'nombre' => 'Ferreteria SO.LE.LIZ', 'telefono' => '7581212'],
            ['codigo' => 'P00185', 'nombre' => 'Ferreteria San Lorenzo', 'telefono' => '7967855'],
            ['codigo' => 'P00186', 'nombre' => 'GUZMAN FLORES CRISTHIAN FRANCO AVENIDA', 'telefono' => null],
            ['codigo' => 'P00187', 'nombre' => 'TRANSALPINA', 'telefono' => '6979113'],
            ['codigo' => 'P00188', 'nombre' => 'SANGA ARGOLLO DITHER', 'telefono' => '2824852'],
            ['codigo' => 'P00189', 'nombre' => 'FULPERNO FIDE-CAR', 'telefono' => '7190745'],
            ['codigo' => 'P00190', 'nombre' => 'CHOQUETARQUI CHOQUE LEONARDO', 'telefono' => '6050667'],
            ['codigo' => 'P00191', 'nombre' => 'MOSQUERA MAUTINO JOEL ANTHONY AVENIDA', 'telefono' => null],
            ['codigo' => 'P00192', 'nombre' => 'Casa Radiol LTDA', 'telefono' => '7899494'],
            ['codigo' => 'P00193', 'nombre' => 'Casa de Pinturas HEYLI', 'telefono' => '7777137'],
            ['codigo' => 'P00194', 'nombre' => 'ILUMINACIONES B Y J', 'telefono' => '6014717'],
            ['codigo' => 'P00195', 'nombre' => 'Ferreteria Tools Center', 'telefono' => '7894004'],
            ['codigo' => 'P00196', 'nombre' => 'Electronica Dixontel 3365678/ Barrio', 'telefono' => null],
            ['codigo' => 'P00197', 'nombre' => 'Conluz Importaciones y Represe', 'telefono' => '7209326'],
            ['codigo' => 'P00198', 'nombre' => 'F.M.TRONICA', 'telefono' => '7956898'],
            ['codigo' => 'P00199', 'nombre' => 'Viviana Shiomara Leon Canaviri', 'telefono' => '7584505'],
            ['codigo' => 'P00200', 'nombre' => 'DEYABOL', 'telefono' => '7582099'],
            ['codigo' => 'P00201', 'nombre' => 'Choquetarqui Torrez Aldo Migue', 'telefono' => '6112492'],
            ['codigo' => '802693', 'nombre' => 'MAMIER SRL CALLE DR', 'telefono' => null],
            ['codigo' => '802695', 'nombre' => 'CASA MATRIZ', 'telefono' => '7584505'],
            ['codigo' => 'P00202', 'nombre' => 'DITER', 'telefono' => null],
            ['codigo' => 'P00203', 'nombre' => 'ALUCOBOL SRL', 'telefono' => null],
            ['codigo' => 'P00204', 'nombre' => 'SABAOTH Comercio de Herramient', 'telefono' => '6515232'],
            ['codigo' => 'P00205', 'nombre' => 'ELECTROFIO Bolivia SRL', 'telefono' => '7305411'],
            ['codigo' => 'P00206', 'nombre' => 'MYCAMI Torneia Maestranza Meta', 'telefono' => '7052249'],
            ['codigo' => 'P00207', 'nombre' => 'IRIS "Casa Matriz"', 'telefono' => '7586901'],
            ['codigo' => 'P00208', 'nombre' => 'MEJIA', 'telefono' => '7967042'],
            ['codigo' => 'P00209', 'nombre' => 'PERNO CORP', 'telefono' => '7728715'],
            ['codigo' => 'P00210', 'nombre' => 'FERRETERIA "MISHEL I"', 'telefono' => '7627769'],
            ['codigo' => 'P00211', 'nombre' => 'PIFERPRO Calle', 'telefono' => '5'],
            ['codigo' => 'P00212', 'nombre' => 'HERMBOL', 'telefono' => null],
            ['codigo' => 'P00213', 'nombre' => 'Resortes Manguera Hidraulica "', 'telefono' => '7064836'],
            ['codigo' => 'P00214', 'nombre' => 'EL PARAISO SRL', 'telefono' => '2833876'],
            ['codigo' => 'P00215', 'nombre' => 'FERROLUM F', 'telefono' => '7892543'],
            ['codigo' => 'P00216', 'nombre' => 'Ferreteria Grinder`s Av Jorge', 'telefono' => null],
            ['codigo' => 'P00217', 'nombre' => 'Comercial Uyustools', 'telefono' => '7384774'],
            ['codigo' => 'P00218', 'nombre' => 'RUGGED CONTROLS', 'telefono' => '(+591)'],
            ['codigo' => 'P00219', 'nombre' => 'AGUA CORP "Tratamiento de Agua', 'telefono' => '4474855'],
            ['codigo' => 'P00221', 'nombre' => 'Multiservicio "AROMAQ"', 'telefono' => '6717717'],
            ['codigo' => 'P00222', 'nombre' => 'Cruz Colque Rosmery', 'telefono' => '2824852'],
            ['codigo' => 'P00223', 'nombre' => 'Electric Cooper J', 'telefono' => '7062434'],
            ['codigo' => 'P00224', 'nombre' => 'MERCATECH', 'telefono' => '7374606'],
            ['codigo' => 'P00225', 'nombre' => 'Pernofull S.R.L.', 'telefono' => '7678744'],
            ['codigo' => 'P00226', 'nombre' => 'Santos Gamboa Tania Gimena Zona Barrio', 'telefono' => null],
            ['codigo' => 'P00227', 'nombre' => 'Marca Choque Jhon Marcelo Av. Tallez', 'telefono' => null],
            ['codigo' => 'P00228', 'nombre' => 'INOXMA', 'telefono' => null],
            ['codigo' => 'P00229', 'nombre' => 'SOALPRO S.R.L Av. Jaime', 'telefono' => null],
            ['codigo' => 'P00230', 'nombre' => 'CDMX S.R.L.', 'telefono' => null],
            ['codigo' => 'P00231', 'nombre' => 'SMS Integracion y Control', 'telefono' => '2413344'],
            ['codigo' => 'P00232', 'nombre' => 'LIBERTADGAS E.INS. DE GAS NATU', 'telefono' => '7594096'],
            ['codigo' => 'P00233', 'nombre' => 'IMPORTADORA LIZ', 'telefono' => '2817386'],
            ['codigo' => 'P00234', 'nombre' => 'Marco Antonio Torrez', 'telefono' => null],
            ['codigo' => 'P00235', 'nombre' => 'Frenzebol S.R.L. Suministros I Central', 'telefono' => null],
            ['codigo' => 'P00236', 'nombre' => 'SIMA SRL', 'telefono' => '2281660'],
            ['codigo' => 'P00237', 'nombre' => 'METAL INOX', 'telefono' => null],
            ['codigo' => 'P00238', 'nombre' => 'Ferreteria Willy', 'telefono' => '7726093'],
            ['codigo' => 'P00239', 'nombre' => 'LOGAR SRL', 'telefono' => '7205558'],
            ['codigo' => 'P00240', 'nombre' => 'Chavez Maldonado Elias Nestor Calle', 'telefono' => '4'],
            ['codigo' => 'P00241', 'nombre' => 'Almacen de Panaderia', 'telefono' => null],
            ['codigo' => 'P00242', 'nombre' => 'MARININI SRL zONA:Vino', 'telefono' => null],
            ['codigo' => 'P00243', 'nombre' => 'Almacen de Materia Prima', 'telefono' => null],
            ['codigo' => 'P00244', 'nombre' => 'PATZI THECHNOLOGICS CALLETARIJ', 'telefono' => null],
            ['codigo' => 'P00245', 'nombre' => 'Proceso Industrial', 'telefono' => null],
            ['codigo' => 'P00246', 'nombre' => 'Ferreteria America Express', 'telefono' => '4289555'],
            ['codigo' => 'P00247', 'nombre' => 'Grupo San Rafael C', 'telefono' => '25'],
            ['codigo' => 'P00248', 'nombre' => 'ELECTROFRIO BOLIVIA SRL', 'telefono' => '2816847-'],
            ['codigo' => 'P00249', 'nombre' => 'GALSA SRL Calle', 'telefono' => '3'],
            ['codigo' => 'P00250', 'nombre' => 'Corman Service S.R.L.', 'telefono' => '7709545'],
            ['codigo' => 'P00251', 'nombre' => 'CRISTEMBO LA PAZ LTDA', 'telefono' => '7670775'],
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
