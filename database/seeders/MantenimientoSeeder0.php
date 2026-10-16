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

class MantenimientoSeeder0 extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // === USUARIOS ===
        $usersData = [
            ['name' => '	Abel Jorge	', 'apellido' => '	Conde Velasquez	', 'ubicacion_id' => 11,    'profesion' => 'Electrónico', 'area_id' => 5,    'codigo' =>    69372, 'estado' => 'Activo',    'role' => 'SupervisorMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Felix Guido	', 'apellido' => '	Tancara Mamani	', 'ubicacion_id' => 11,    'profesion' => 'Electrónico', 'area_id' => 5,    'codigo' =>    62416, 'estado' => 'Activo',    'role' => 'JefeMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Jaime	', 'apellido' => '	Mamani Limachi	', 'ubicacion_id' => 11,    'profesion' => 'Eléctrico', 'area_id' => 5,    'codigo' =>    62274, 'estado' => 'Activo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Marco Antonio	', 'apellido' => '	Torrez Arratia	', 'ubicacion_id' => 11,    'profesion' => 'Mecánico', 'area_id' => 5,    'codigo' =>    66913, 'estado' => 'Activo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Percy Juan	', 'apellido' => '	Poma Quispe	', 'ubicacion_id' => 11,    'profesion' => 'Electromecánico', 'area_id' => 5,    'codigo' =>    80048, 'estado' => 'Activo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Paola Alejandra	', 'apellido' => '	Cruz Gutierrez	', 'ubicacion_id' => 11,    'profesion' => 'Mecánico', 'area_id' => 5,    'codigo' =>    80133, 'estado' => 'Inactivo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Marianela	', 'apellido' => '	Lopez Copa	', 'ubicacion_id' => 11,    'profesion' => 'Electrónico', 'area_id' => 5,    'codigo' =>    80134, 'estado' => 'Inactivo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Miguel Angel	', 'apellido' => '	Rodriguez Morales	', 'ubicacion_id' => 11,    'profesion' => 'Electromecánico', 'area_id' => 5,    'codigo' =>    69733, 'estado' => 'Inactivo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Omar	', 'apellido' => '	Mamani Choquehuanca	', 'ubicacion_id' => 11,    'profesion' => 'Electromecánico', 'area_id' => 5,    'codigo' =>    69297, 'estado' => 'Activo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Rodrigo Ever	', 'apellido' => '	Laura Condori	', 'ubicacion_id' => 11,    'profesion' => 'Mecánico', 'area_id' => 5,    'codigo' =>    68864, 'estado' => 'Inactivo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Jesus Rolando	', 'apellido' => '	Choque Mamani	', 'ubicacion_id' => 11,    'profesion' => 'Mecánico', 'area_id' => 5,    'codigo' =>    66927, 'estado' => 'Activo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Daniel Freddy	', 'apellido' => '	Quelca Mamani	', 'ubicacion_id' => 11,    'profesion' => 'Mecatrónico', 'area_id' => 5,    'codigo' =>    11104, 'estado' => 'Activo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Bryan	', 'apellido' => '	Choque Osco	', 'ubicacion_id' => 11,    'profesion' => 'Eléctrico', 'area_id' => 5,    'codigo' =>    80567, 'estado' => 'Activo',    'role' => 'AlmacenMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Franco Jimmy	', 'apellido' => '	Lima Hidalgo	', 'ubicacion_id' => 11,    'profesion' => 'Electromecánico', 'area_id' => 5,    'codigo' =>    80454, 'estado' => 'Activo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Jhamil	', 'apellido' => '	Tola	', 'ubicacion_id' => 11,    'profesion' => 'Eléctrico', 'area_id' => 5,    'codigo' =>    11116, 'estado' => 'Activo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Juan Miguel	', 'apellido' => '	Aruquipa Poma	', 'ubicacion_id' => 11,    'profesion' => 'Electrónico', 'area_id' => 5,    'codigo' =>    11130, 'estado' => 'Inactivo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Carla Fabiola	', 'apellido' => '	Valdez Cano	', 'ubicacion_id' => 11,    'profesion' => 'Electromecánico', 'area_id' => 5,    'codigo' =>    80566, 'estado' => 'Activo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Elmer	', 'apellido' => '	Mamani Yujra	', 'ubicacion_id' => 11,    'profesion' => 'Electromecánico', 'area_id' => 5,    'codigo' =>    69623, 'estado' => 'Activo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Jorge Luis	', 'apellido' => '	Condori Quispe	', 'ubicacion_id' => 11,    'profesion' => 'Electrónico', 'area_id' => 5,    'codigo' =>    11142, 'estado' => 'Inactivo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Axel	', 'apellido' => '	Hermosa	', 'ubicacion_id' => 11,    'profesion' => 'Eléctrico', 'area_id' => 5,    'codigo' =>    11143, 'estado' => 'Activo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Josue	', 'apellido' => '	Supa	', 'ubicacion_id' => 11,    'profesion' => 'Electrónico', 'area_id' => 5,    'codigo' =>    11158, 'estado' => 'Activo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Boris Cristian	', 'apellido' => '	Mamani Cusi	', 'ubicacion_id' => 11,    'profesion' => 'Electrónico', 'area_id' => 5,    'codigo' =>    11169, 'estado' => 'Activo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	ELVIS ROBERTO	', 'apellido' => '	ARCAYA BORDA	', 'ubicacion_id' => 11,    'profesion' => 'Mecánico', 'area_id' => 5,    'codigo' =>    11062, 'estado' => 'Activo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Flavio Luis	', 'apellido' => '	Quispe Guampo	', 'ubicacion_id' => 11,    'profesion' => 'Electrónico', 'area_id' => 5,    'codigo' =>    11197, 'estado' => 'Activo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Rene Max	', 'apellido' => '	Garcia Condori	', 'ubicacion_id' => 11,    'profesion' => 'Electrónico', 'area_id' => 5,    'codigo' =>    11199, 'estado' => 'Activo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],
            ['name' => '	Adrian Alejandro	', 'apellido' => '	Paz Conde	', 'ubicacion_id' => 11,    'profesion' => 'Electrónico', 'area_id' => 5,    'codigo' =>    11200, 'estado' => 'Activo',    'role' => 'TecnicoMantenimiento', 'estado_hisopado_id'=>95],


        ];

        foreach ($usersData as $data) {
            $roleName = $data['role'];
            unset($data['role']); // quitamos antes de crear el usuario

            $user = User::updateOrCreate(
                ['codigo' => $data['codigo']],
                array_merge($data, [
                    'password' => Hash::make($data['codigo']),
                    'email_verified_at' => now(),
                ])
            );

            // Asignar el rol correspondiente
            $user->assignRole($roleName);
        }


























    }













}
