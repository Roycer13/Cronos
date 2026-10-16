<?php

namespace Database\Seeders;

use App\Domain\Sistema\Configuracion\Models\Area;
use App\Domain\Sistema\Configuracion\Models\Planta;
use App\Domain\Sistema\Configuracion\Models\TipoUbicacion;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\Sistema\Configuracion\Models\Prioridad;
use App\Domain\Sistema\Configuracion\Models\Unidad;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // === TIPOS DE UBICACIÓN ===
        $tipoUbicaciones = [
            ['nombre' => 'Planta', 'descripcion' => 'PLA'],
            ['nombre' => 'Agencia', 'descripcion' => 'AGE'],
            ['nombre' => 'Almacen', 'descripcion' => 'ALM'],
            ['nombre' => 'Administracion', 'descripcion' => 'ADM'],
        ];

        foreach ($tipoUbicaciones as $tipoUbicacion) {
            TipoUbicacion::firstOrCreate(
                ['nombre' => $tipoUbicacion['nombre']],
                $tipoUbicacion
            );
        }

        // === UBICACIONES/PLANTAS ===
        // Obtener IDs de tipos de ubicación por su nombre
        $tipoPlanta = TipoUbicacion::where('nombre', 'Planta')->first();
        $tipoAgencia = TipoUbicacion::where('nombre', 'Agencia')->first();
        $tipoAlmacen = TipoUbicacion::where('nombre', 'Almacen')->first();
        $tipoAdmin = TipoUbicacion::where('nombre', 'Administracion')->first();

        $plantas = [
            ['nombre' => 'Lácteos', 'direccion' => 'Zona Charapaqui, Av. Jaime Mendoza Nro. 1575', 'codigo' => 'PLL', 'abreviatura' => 'PLL', 'tipo_ubicacion_id' => $tipoPlanta->id],
            ['nombre' => 'Soya', 'direccion' => 'Casa Matriz', 'codigo' => 'PLS', 'abreviatura' => 'PLS', 'tipo_ubicacion_id' => $tipoPlanta->id],
            ['nombre' => 'Carsa', 'direccion' => 'Zona La Florida, Av. Hacia el Mar Nº 100', 'codigo' => 'PC', 'abreviatura' => 'PC', 'tipo_ubicacion_id' => $tipoPlanta->id],
            ['nombre' => 'Álamo', 'direccion' => 'Zona Janko Kalani, Av. Costa de Marfil Nº 2055', 'codigo' => 'PA', 'abreviatura' => 'PA', 'tipo_ubicacion_id' => $tipoPlanta->id],
            ['nombre' => 'Panadería', 'direccion' => 'Zona Charapaqui', 'codigo' => 'PP', 'abreviatura' => 'PP', 'tipo_ubicacion_id' => $tipoPlanta->id],
            ['nombre' => 'Galleteria', 'direccion' => 'Zona Charapaqui', 'codigo' => 'PLG', 'abreviatura' => 'PLG', 'tipo_ubicacion_id' => $tipoPlanta->id],
            ['nombre' => 'Administracion', 'direccion' => '', 'codigo' => 'ADM', 'abreviatura' => 'ADM', 'tipo_ubicacion_id' => $tipoAdmin->id],
            ['nombre' => 'Almacen Cedros', 'direccion' => '', 'codigo' => 'ALMC', 'abreviatura' => 'ALMC', 'tipo_ubicacion_id' => $tipoAlmacen->id],
            ['nombre' => 'Agencia Villa el Carmen', 'direccion' => '', 'codigo' => 'AGE-VC', 'abreviatura' => 'AGE-VC', 'tipo_ubicacion_id' => $tipoAgencia->id],
            ['nombre' => 'Agencia Villa Bolivar', 'direccion' => '', 'codigo' => 'AGE-VB', 'abreviatura' => 'AGE-VB', 'tipo_ubicacion_id' => $tipoAgencia->id],
            ['nombre' => 'Mantenimiento', 'direccion' => '', 'codigo' => 'MAN', 'abreviatura' => 'MAN-00', 'tipo_ubicacion_id' => $tipoPlanta->id],
            ['nombre' => 'Almacen de Mantenimiento Lacteos', 'direccion' => 'Zona Charapaqui, Av. Jaime Mendoza Nro. 1575', 'codigo' => 'MAN-01', 'abreviatura' => 'MAN-01', 'tipo_ubicacion_id' => $tipoAlmacen->id],
            ['nombre' => 'Almacen de Gerencia', 'direccion' => 'Zona Charapaqui, Av. Jaime Mendoza Nro. 1575', 'codigo' => 'MAN-02', 'abreviatura' => 'MAN-02', 'tipo_ubicacion_id' => $tipoAlmacen->id],
        ];

        foreach ($plantas as $planta) {
            Ubicacion::firstOrCreate(
                ['codigo' => $planta['codigo']],
                $planta
            );
        }

        // === AREAS ===
        // Obtener ubicaciones por código en lugar de ID fijo
        $ubicacionLacteos = Ubicacion::where('codigo', 'PLL')->first();
        $ubicacionMantenimiento = Ubicacion::where('codigo', 'MAN')->first();

        $areas = [
            ['nombre' => 'Sistemas', 'codigo' => 'SIS', 'ubicacion_id' => $ubicacionLacteos->id],
            ['nombre' => 'Producción UHT', 'codigo' => 'PRO UHT', 'ubicacion_id' => $ubicacionLacteos->id],
            ['nombre' => 'Producción HTST', 'codigo' => 'PRO HTST', 'ubicacion_id' => $ubicacionLacteos->id],
            ['nombre' => 'Calidad', 'codigo' => 'CAL', 'ubicacion_id' => $ubicacionLacteos->id],
            ['nombre' => 'Mantenimiento', 'codigo' => 'MAN', 'ubicacion_id' => $ubicacionMantenimiento->id],
            ['nombre' => 'Desarrollo', 'codigo' => 'DES', 'ubicacion_id' => $ubicacionLacteos->id],
            ['nombre' => 'Materia Prima', 'codigo' => 'MP', 'ubicacion_id' => $ubicacionLacteos->id],
            ['nombre' => 'Jefatura', 'codigo' => 'JEF', 'ubicacion_id' => $ubicacionLacteos->id],
            ['nombre' => 'Acopio', 'codigo' => 'ACP', 'ubicacion_id' => $ubicacionLacteos->id],
            ['nombre' => 'Conteo', 'codigo' => 'CON', 'ubicacion_id' => $ubicacionLacteos->id],
            ['nombre' => 'Almacen', 'codigo' => 'ALM', 'ubicacion_id' => $ubicacionLacteos->id],
        ];

        foreach ($areas as $area) {
            Area::firstOrCreate(
                ['codigo' => $area['codigo']],
                $area
            );
        }

        // === PERMISOS ===
        $modules = [
            'configuracion',
            'repuesto',
            'solicitudOt',
            'ot',
            'usuario',
            'rutaAcopio',
            'subrutaAcopio',
            'recepcionLeche',
            'analisisLeche',
            'graficaLeche',
            'orp',
            'recepcionMateriaPrima',
            'sustanciasQuimicas',
            'desinfeccion',
            'hisopado',
            'adminMateriaPrima',
            'verificacionesDispositivos',
            'conteos',
            'documentacionSolicitud',
            'documentacionAdministracion',
            'productoTerminados',
            'seguimientoHtst',
            'seguimientoUht',
            'analisisLinea',
            'estadosPlanta',
            'dashboardPlanta',
            'uht',
            'htst',
            'almacenMovimiento',

        ];

        $actions = ['r', 'c', 'u', 'd'];

        foreach ($modules as $module) {
            foreach ($actions as $action) {
                Permission::firstOrCreate(['name' => "{$action}_{$module}"]);
            }
        }

        Permission::firstOrCreate(['name' => "c_editarSolicitantes"]);
        Permission::firstOrCreate(['name' => "cerrar_solicitudOt"]);
        Permission::firstOrCreate(['name' => "capacitar_hisopado"]);
        Permission::firstOrCreate(['name' => "ingresar_sustanciasQuimicas"]);
        Permission::firstOrCreate(['name' => "ingresar_desinfeccion"]);
        Permission::firstOrCreate(['name' => "solicitar_analisisLinea"]);
        Permission::firstOrCreate(['name' => "u_analisisLecheMB"]);
        Permission::firstOrCreate(['name' => "c_analisisLecheMB"]);
        Permission::firstOrCreate(['name' => "u_analisisLecheFQ"]);
        Permission::firstOrCreate(['name' => "c_analisisLecheFQ"]);
        Permission::firstOrCreate(['name' => "reiniciar_hisopado"]);
        Permission::firstOrCreate(['name' => "autorizar_almacenMovimiento"]);
        Permission::firstOrCreate(['name' => "configuracion_mantenimiento"]);

        Permission::firstOrCreate(['name' => "entregar_almacenMovimiento"]);
        Permission::firstOrCreate(['name' => "datos_ORP"]);

        // === ROLES ===
        $roles = [
            'admin',
            'JefePlanta',
            'JefeCalidad',
            'JefeMantenimiento',
            'SupervisorMantenimiento',
            'TecnicoMantenimiento',
            'AlmacenMantenimiento',
            'AnalistaFQ',
            'AnalistaMB',
            'AyudanteCalidad',
            'AyudanteMateriaPrima',
            'Contador',
            'CoordinadorJefatura',
            'EncargadoAcopio',
            'EncargadoCaldero',
            'EncargadoDesarrollo',
            'EncargadoMateriaPrima',
            'EncargadoProduccionSoya',
            'EncargadoHTST',
            'EncargadoUHT',
            'SubjefeCalidad',
            'SubjefePlanta',
            'SupervisorCalidad',
            'TecnicoHTST',
            'TecnicoUHT',
            'Montacargas',
            'MAQUINISTA DE SERVICIOS',
            'MAQUINISTA DE PROCESO',
            'MAQUINISTA DE ENVASADO UHT',
            'MAQUINISTA DE ENVASADO HTST',
            'MAQUINISTA AYUDANTE DE PROCESO',
            'MAQUINISTA AYUDANTE DE ENVASADO HTST',
            'Fraccionador',
            'Ensachetador',
            'AYUDANTE DE INSUMOS',
            'Tecnico Desarrollo'
        ];

        foreach ($roles as $rol) {
            Role::firstOrCreate(['name' => $rol]);
        }

        // === ASIGNACIÓN DE PERMISOS A ROLES ===
        $jefeMantenimiento = Role::where('name', 'JefeMantenimiento')->first();
        $supervisor = Role::where('name', 'SupervisorMantenimiento')->first();
        $supervisorCalidad = Role::where('name', 'SupervisorCalidad')->first();
        $tecnico = Role::where('name', 'TecnicoMantenimiento')->first();
        $almacen = Role::where('name', 'AlmacenMantenimiento')->first();
        $jefePlanta = Role::where('name', 'JefePlanta')->first();
        $jefeCalidad = Role::where('name', 'JefeCalidad')->first();
        $EncargadoMateriaPrima = Role::where('name', 'EncargadoMateriaPrima')->first();
        $CoordinadorJefatura = Role::where('name', 'CoordinadorJefatura')->first();
        $analistaFQ = Role::where('name', 'AnalistaFQ')->first();
        $analistaMB = Role::where('name', 'AnalistaMB')->first();
        $encargadoHTST = Role::where('name', 'EncargadoHTST')->first();
        $encargadoUHT = Role::where('name', 'EncargadoUHT')->first();
        $tecnicoHTST = Role::where('name', 'TecnicoHTST')->first();
        $tecnicoUHT = Role::where('name', 'TecnicoUHT')->first();
        $contador = Role::where('name', 'Contador')->first();




        $contador->syncPermissions([

            'r_conteos',
            'c_conteos',
            'u_conteos',
            'd_conteos',
        ]);
        $tecnicoUHT->syncPermissions([
'd_analisisLinea',
            'r_analisisLeche',
            'c_analisisLeche',
            'r_recepcionLeche',
            'c_recepcionLeche',

            'r_dashboardPlanta',
            'u_dashboardPlanta',
            'solicitar_analisisLinea',

            'c_estadosPlanta',
            'c_estadosPlanta',
            'u_estadosPlanta',
            'd_estadosPlanta',
            'r_analisisLinea',
            'c_solicitudOt',
            'r_solicitudOt',


            'r_desinfeccion',

            'r_orp',
            'u_orp',
            'c_orp',
        ]);
        $encargadoUHT->syncPermissions([
            'd_analisisLinea',
            'c_solicitudOt',
            'r_solicitudOt',
            'r_analisisLeche',
            'c_analisisLeche',
            'r_recepcionLeche',
            'c_recepcionLeche',

            'r_dashboardPlanta',
            'u_dashboardPlanta',
            'solicitar_analisisLinea',

            'c_estadosPlanta',
            'c_estadosPlanta',
            'u_estadosPlanta',
            'd_estadosPlanta',
            'r_analisisLinea',



            'r_desinfeccion',

            'r_orp',
            'u_orp',
            'c_orp',
        ]);



        $tecnicoHTST->syncPermissions([
            'd_analisisLinea',
            'c_solicitudOt',
            'r_solicitudOt',
            'r_analisisLeche',
            'c_analisisLeche',
            'r_recepcionLeche',
            'c_recepcionLeche',
            'r_analisisLinea',

            'r_dashboardPlanta',
            'u_dashboardPlanta',
            'solicitar_analisisLinea',

            'r_seguimientoHtst',
            'c_seguimientoHtst',
            'r_estadosPlanta',
            'c_estadosPlanta',
            'd_estadosPlanta',



            'r_desinfeccion',

            'r_orp',
            'u_orp',
            'c_orp',
        ]);


        $encargadoHTST->syncPermissions([
            'd_analisisLinea',
            'c_solicitudOt',
            'r_solicitudOt',
            'r_analisisLeche',
            'c_analisisLeche',
            'r_recepcionLeche',
            'c_recepcionLeche',
            'r_analisisLinea',

            'r_dashboardPlanta',
            'u_dashboardPlanta',
            'solicitar_analisisLinea',

            'r_seguimientoHtst',
            'c_seguimientoHtst',
            'r_estadosPlanta',
            'c_estadosPlanta',
            'd_estadosPlanta',



            'r_desinfeccion',

            'r_orp',
            'u_orp',
            'c_orp',
        ]);

        $analistaMB->syncPermissions([
            'c_solicitudOt',
            'r_solicitudOt',
            'r_analisisLeche',
            'c_analisisLeche',
            'u_analisisLecheMB',
            'c_analisisLecheMB',
            'r_dashboardPlanta',
            'r_sustanciasQuimicas',
            'c_sustanciasQuimicas',
            'r_seguimientoHtst',
            'u_seguimientoHtst',
            'r_seguimientoUht',
            'u_seguimientoUht',
            'c_seguimientoUht',
            'r_desinfeccion',
            'r_hisopado',
            'c_hisopado',
            'u_hisopado',
            'r_orp',
        ]);

        $analistaFQ->syncPermissions([
            'c_solicitudOt',
            'r_solicitudOt',
            'r_analisisLinea',
            'c_analisisLinea',
            'u_analisisLinea',
            'r_recepcionLeche',
            'c_recepcionLeche',
            'r_analisisLeche',
            'c_analisisLeche',
            'u_analisisLecheFQ',
            'c_analisisLecheFQ',
            'r_dashboardPlanta',
            'solicitar_analisisLinea',
            'r_sustanciasQuimicas',
            'c_sustanciasQuimicas',
            'r_verificacionesDispositivos',
            'c_verificacionesDispositivos',
            'u_verificacionesDispositivos',
            'r_desinfeccion',
            'c_desinfeccion',
            'u_desinfeccion',

        ]);


        $jefePlanta->syncPermissions([
            'c_solicitudOt',
            'r_solicitudOt',
            'r_solicitudOt',
            'c_solicitudOt',
            'u_solicitudOt',
            'r_dashboardPlanta',
            'r_conteos',
        ]);

        $EncargadoMateriaPrima->syncPermissions([

            'r_recepcionMateriaPrima',
            'c_recepcionMateriaPrima',
            'u_recepcionMateriaPrima',
            'd_recepcionMateriaPrima',

            'r_dashboardPlanta',
            'r_adminMateriaPrima',
            'c_adminMateriaPrima',
            'u_adminMateriaPrima',
            'd_adminMateriaPrima',
            'c_desinfeccion',

            'r_desinfeccion',
            'r_sustanciasQuimicas',
            'c_sustanciasQuimicas',
            'u_sustanciasQuimicas',
        ]);

        $CoordinadorJefatura->syncPermissions([
            'r_recepcionMateriaPrima',
            'r_productoTerminados',
            'c_productoTerminados',
            'u_productoTerminados',
            'r_dashboardPlanta',
            'r_orp',
            'c_orp',
            'u_orp',
            'r_conteos',
            'r_desinfeccion',
            'c_desinfeccion',
        ]);

        $jefeCalidad->syncPermissions([
            'c_solicitudOt',
            'r_solicitudOt',
            'r_solicitudOt',
            'c_solicitudOt',
            'u_solicitudOt',
            'c_sustanciasQuimicas',
            'u_sustanciasQuimicas',
            'r_sustanciasQuimicas',
            'r_productoTerminados',
            'r_sustanciasQuimicas',
            'c_sustanciasQuimicas',
            'u_sustanciasQuimicas',
            'r_desinfeccion',
            'c_desinfeccion',
            'u_desinfeccion',
            'r_seguimientoHtst',
            'r_seguimientoUht',
            'r_recepcionLeche',
            'r_analisisLeche',
            'r_analisisLinea',
            'r_estadosPlanta',
            'r_dashboardPlanta',
            'r_orp',
            'r_recepcionMateriaPrima',
            'r_adminMateriaPrima',
            'r_documentacionAdministracion',
            'r_documentacionSolicitud',
            'r_conteos',
            'r_verificacionesDispositivos',
            'ingresar_sustanciasQuimicas',
            'ingresar_desinfeccion',
            'solicitar_analisisLinea',
            'r_dashboardPlanta',
            'reiniciar_hisopado'
        ]);
        $supervisorCalidad->syncPermissions([
            'c_solicitudOt',
            'r_solicitudOt',
            'r_orp',
            'r_desinfeccion',
            'c_desinfeccion',
            'u_desinfeccion',
            'r_analisisLeche',
            'r_analisisLinea',
            'r_seguimientoHtst',
            'r_seguimientoUht',
            'r_recepcionLeche',
            'c_recepcionLeche',
            'r_hisopado',
            'capacitar_hisopado',
            'r_sustanciasQuimicas',
            'r_verificacionesDispositivos',
            'c_verificacionesDispositivos',
            'r_dashboardPlanta',
            'r_orp',
            'r_documentacionAdministracion',
            'r_documentacionSolicitud',
            'r_verificacionesDispositivos',
            'c_sustanciasQuimicas',
            'solicitar_analisisLinea',

        ]);

        // Jefe de Mantenimiento
        $jefeMantenimiento->syncPermissions([
            'r_repuesto',
            'c_repuesto',
            'u_repuesto',
            'd_repuesto',
            'r_solicitudOt',
            'c_solicitudOt',
            'u_solicitudOt',
            'd_solicitudOt',
            'r_ot',
            'c_ot',
            'u_ot',
            'd_ot',
            'c_editarSolicitantes',
            'cerrar_solicitudOt',
            'r_configuracion',
            'configuracion_mantenimiento',
        ]);

        // Supervisor
        $supervisor->syncPermissions([
            'r_repuesto',
            'c_repuesto',
            'u_repuesto',
            'd_repuesto',
            'r_solicitudOt',
            'c_solicitudOt',
            'u_solicitudOt',
            'd_solicitudOt',
            'r_ot',
            'c_ot',
            'u_ot',
            'd_ot',
            'c_editarSolicitantes',
            'cerrar_solicitudOt',
            'r_configuracion',
            'configuracion_mantenimiento'
        ]);

        // Técnico
        $tecnico->syncPermissions([
            'r_ot',
            'r_solicitudOt',
            'c_solicitudOt',
            'c_editarSolicitantes',
            'u_solicitudOt',
        ]);

        // Almacén
        $almacen->syncPermissions([
            'r_repuesto',
            'c_repuesto',
            'u_repuesto',
            'r_solicitudOt',
            'c_solicitudOt',
            'c_editarSolicitantes'
        ]);

        // === USUARIOS ===
        $usersData = [
            [
                'email' => 'daxes26@gmail.com',
                'codigo' => 80492,
                'name' => 'Abel Isaac',
                'apellido' => 'Diaz Choque',
                'ubicacion_id' => $ubicacionLacteos->id,
                'area_id' => Area::where('codigo', 'SIS')->first()->id,
                'estado' => 'Activo',
                'turno' => 'Central',
                'role' => 'admin',
            ],
            [
                'email' => 'jorgeloza@gmail.com',
                'codigo' => 69965,
                'name' => 'Jorge Rodrigo',
                'apellido' => 'Loza Quispe',
                'ubicacion_id' => $ubicacionLacteos->id,
                'area_id' => Area::where('codigo', 'SIS')->first()->id,
                'estado' => 'Activo',
                'turno' => 'Central',
                'role' => 'admin',
            ]
        ];

        foreach ($usersData as $data) {
            $roleName = $data['role'];
            unset($data['role']);

            $user = User::updateOrCreate(
                ['email' => $data['email']],
                array_merge($data, [
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ])
            );

            $user->assignRole($roleName);
        }

        // === PRIORIDADES === (usando modelo)
        $prioridades = [
            ['nombre' => 'Emergencia', 'codigo' => 'ALTA', 'descripcion' => 'Prioridad alta', 'color' => '#ff0000', 'tiempo_respuesta' => '1h'],
            ['nombre' => 'Urgente', 'codigo' => 'MEDIA', 'descripcion' => 'Prioridad media', 'color' => '#ffaa00', 'tiempo_respuesta' => '4h'],
            ['nombre' => 'Normal', 'codigo' => 'BAJA', 'descripcion' => 'Prioridad baja', 'color' => '#00ff00', 'tiempo_respuesta' => '24h'],
        ];

        foreach ($prioridades as $prioridad) {
            Prioridad::firstOrCreate(
                ['codigo' => $prioridad['codigo']],
                $prioridad
            );
        }

        // === UNIDADES === (usando modelo)
        $unidades = [
            ['nombre' => 'Kilogramo', 'abreviatura' => '[kg]'],
            ['nombre' => 'Gramo', 'abreviatura' => '[g]'],
            ['nombre' => 'Litro', 'abreviatura' => '[L]'],
            ['nombre' => 'Mililitro', 'abreviatura' => '[ml]'],
            ['nombre' => 'Unidad', 'abreviatura' => '[u]'],
            ['nombre' => 'Pieza', 'abreviatura' => '[pz]'],
            ['nombre' => 'Caja', 'abreviatura' => '[caja]'],
            ['nombre' => 'Paquete', 'abreviatura' => '[paq]'],
            ['nombre' => 'Bolsa', 'abreviatura' => '[bolsa]'],
            ['nombre' => 'Metro', 'abreviatura' => '[m]'],
            ['nombre' => 'Centímetro', 'abreviatura' => '[cm]'],
            ['nombre' => 'Frasco', 'abreviatura' => '[Fr]'],
            ['nombre' => 'Ampolla', 'abreviatura' => '[Amp]'],
        ];

        foreach ($unidades as $unidad) {
            Unidad::firstOrCreate(
                ['nombre' => $unidad['nombre']],
                $unidad
            );
        }

        // === PERMISOS EXTRA PARA TODOS LOS ROLES ===
        $permisosExtra = ['c_solicitudOt', 'c_documentacionSolicitud'];
        $roles = Role::all();

        foreach ($roles as $rol) {
            foreach ($permisosExtra as $permiso) {
                $permisoModel = Permission::where('name', $permiso)->first();
                if ($permisoModel && !$rol->hasPermissionTo($permisoModel)) {
                    $rol->givePermissionTo($permisoModel);
                }
            }
        }

        $this->call([
            EstadoSeeder::class,
            // MantenimientoSeeder::class,
        ]);
    }
}
