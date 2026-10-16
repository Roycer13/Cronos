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

class LacteosSeeder0 extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // === USUARIOS ===
        $usersData = [
            ['name' => 'Ruben', 'apellido' => 'Casilla Condori', 'ubicacion_id' => 1,   'area_id' =>    4,    'codigo' =>    67534, 'estado' => 'Activo',  'role' =>     'JefeCalidad', 'estado_hisopado_id'=>95],
            ['name' => 'Wilfredo', 'apellido' => 'Condori Hinojosa', 'ubicacion_id' => 1,   'area_id' =>    3,    'codigo' =>    64687, 'estado' => 'Activo',  'role' =>           'EncargadoHTST', 'estado_hisopado_id'=>95],
            ['name' => 'Ramiro Alejandro', 'apellido' => 'Camacho Rada', 'ubicacion_id' => 1,   'area_id' =>    3,    'codigo' =>    64089, 'estado' => 'Activo',  'role' =>           'EncargadoHTST', 'estado_hisopado_id'=>95],
            ['name' => 'Lizeth', 'apellido' => 'Gonzales Huanca', 'ubicacion_id' => 1,   'area_id' =>    4,    'codigo' =>    66723, 'estado' => 'Activo',  'role' =>           'AnalistaMB', 'estado_hisopado_id'=>95],
            ['name' => 'Juan', 'apellido' => 'Vila Barra', 'ubicacion_id' => 1,   'area_id' =>    3,    'codigo' =>    66948, 'estado' => 'Activo',  'role' =>           'EncargadoHTST', 'estado_hisopado_id'=>95],
            ['name' => 'Jose Luis', 'apellido' => 'Huanca Quito', 'ubicacion_id' => 1,   'area_id' =>    2,    'codigo' =>    66917, 'estado' => 'Activo',  'role' =>           'EncargadoUHT', 'estado_hisopado_id'=>95],
            ['name' => 'Yhanet Yhelka', 'apellido' => 'Callisaya Mamani', 'ubicacion_id' => 1,   'area_id' =>    7,    'codigo' =>    68203, 'estado' => 'Activo',  'role' =>           'EncargadoMateriaPrima', 'estado_hisopado_id'=>95],
            ['name' => 'Maria Antonia', 'apellido' => 'Ajno Cruz', 'ubicacion_id' => 1,   'area_id' =>    2,    'codigo' =>    66080, 'estado' => 'Activo',  'role' =>           'TecnicoUHT', 'estado_hisopado_id'=>95],
            ['name' => 'Emma', 'apellido' => 'Quispe Condori', 'ubicacion_id' => 1,   'area_id' =>    2,    'codigo' =>    68515, 'estado' => 'Activo',  'role' =>           'TecnicoUHT', 'estado_hisopado_id'=>95],
            ['name' => 'Miriam', 'apellido' => 'Pacosillo Calsina', 'ubicacion_id' => 1,   'area_id' =>    3,    'codigo' =>    67302, 'estado' => 'Activo',  'role' =>           'TecnicoHTST', 'estado_hisopado_id'=>95],
            ['name' => 'Helen', 'apellido' => 'Jarandilla Calle', 'ubicacion_id' => 1,   'area_id' =>    4,    'codigo' =>    67806, 'estado' => 'Activo',  'role' =>           'AnalistaFQ', 'estado_hisopado_id'=>95],
            ['name' => 'Veronica', 'apellido' => 'Mamani Calle', 'ubicacion_id' => 1,   'area_id' =>    4,    'codigo' =>    67527, 'estado' => 'Activo',  'role' =>           'AnalistaFQ', 'estado_hisopado_id'=>95],
            ['name' => 'Mabel Amparo', 'apellido' => 'Callisaya Terceros', 'ubicacion_id' => 1,   'area_id' =>    4,    'codigo' =>    68855, 'estado' => 'Activo',  'role' =>           'AnalistaMB', 'estado_hisopado_id'=>95],
            ['name' => 'Jenny', 'apellido' => 'Santalla Manzaneda', 'ubicacion_id' => 1,   'area_id' =>    4,    'codigo' =>    69290, 'estado' => 'Activo',  'role' =>           'AnalistaMB', 'estado_hisopado_id'=>95],
            ['name' => 'Erick Andrés', 'apellido' => 'Herbas García', 'ubicacion_id' => 1,   'area_id' =>    8,    'codigo' =>    69323, 'estado' => 'Activo',  'role' =>           'SubjefePlanta', 'estado_hisopado_id'=>95],
            ['name' => 'Bismart', 'apellido' => 'Lima', 'ubicacion_id' => 1,   'area_id' =>    1,    'codigo' =>    69854, 'estado' => 'Activo',  'role' =>           'admin', 'estado_hisopado_id'=>95],
            ['name' => 'Camilo Hassan', 'apellido' => 'Villa Trigo', 'ubicacion_id' => 1,   'area_id' =>    8,    'codigo' =>    80028, 'estado' => 'Activo',  'role' =>           'JefePlanta', 'estado_hisopado_id'=>95],
            ['name' => 'Bruno', 'apellido' => 'Condori Ninachoque', 'ubicacion_id' => 1,   'area_id' =>    4,    'codigo' =>    69061, 'estado' => 'Activo',  'role' =>           'SubjefeCalidad', 'estado_hisopado_id'=>95],
            ['name' => 'Miriam Lizeth', 'apellido' => 'Mamani Escalera', 'ubicacion_id' => 1,   'area_id' =>    4,    'codigo' =>    68853, 'estado' => 'Activo',  'role' =>           'AnalistaFQ', 'estado_hisopado_id'=>95],
            ['name' => 'Miriam', 'apellido' => 'Huanca Quispe', 'ubicacion_id' => 1,   'area_id' =>    2,    'codigo' =>    64176, 'estado' => 'Activo',  'role' =>           'TecnicoUHT', 'estado_hisopado_id'=>95],
            ['name' => 'Mauricio', 'apellido' => 'Gomez Sarmiento', 'ubicacion_id' => 1,   'area_id' =>    4,    'codigo' =>    69752, 'estado' => 'Activo',  'role' =>           'SupervisorCalidad', 'estado_hisopado_id'=>95],
            ['name' => 'Jhenny', 'apellido' => 'Rodriguez Suca', 'ubicacion_id' => 1,   'area_id' =>    9,    'codigo' =>    69285, 'estado' => 'Activo',  'role' =>           'EncargadoDesarrollo', 'estado_hisopado_id'=>95],
            ['name' => 'Sara', 'apellido' => 'Mamani', 'ubicacion_id' => 1,   'area_id' =>    8,    'codigo' =>    62605, 'estado' => 'Activo',  'role' =>           'CoordinadorJefatura', 'estado_hisopado_id'=>95],
            ['name' => 'Alejandro', 'apellido' => 'Candia', 'ubicacion_id' => 1,   'area_id' =>    4,    'codigo' =>    80132, 'estado' => 'Activo',  'role' =>           'SupervisorCalidad', 'estado_hisopado_id'=>95],
            ['name' => 'Elisa', 'apellido' => 'Cruz Carvajal', 'ubicacion_id' => 1,   'area_id' =>    4,    'codigo' =>    80026, 'estado' => 'Activo',  'role' =>           'SupervisorCalidad', 'estado_hisopado_id'=>95],
            ['name' => 'Jose Ernesto', 'apellido' => 'Llanos Calancha', 'ubicacion_id' => 1,   'area_id' =>    4,    'codigo' =>    66918, 'estado' => 'Activo',  'role' =>           'AyudanteCalidad', 'estado_hisopado_id'=>95],
            ['name' => 'Juan Carlos', 'apellido' => 'Quilla Choque', 'ubicacion_id' => 1,   'area_id' =>    8,    'codigo' =>    66633, 'estado' => 'Activo',  'role' =>           'CoordinadorJefatura', 'estado_hisopado_id'=>95],
            ['name' => 'Olimpia Ursula', 'apellido' => 'Huanca Quispe', 'ubicacion_id' => 1,   'area_id' =>    9,    'codigo' =>    62014, 'estado' => 'Activo',  'role' =>           'EncargadoAcopio', 'estado_hisopado_id'=>95],
            ['name' => 'Brian', 'apellido' => 'Arce Cusi', 'ubicacion_id' => 1,   'area_id' =>    3,    'codigo' =>    80449, 'estado' => 'Activo',  'role' =>           'TecnicoHTST', 'estado_hisopado_id'=>95],
            ['name' => 'Alvaro Gabriel', 'apellido' => 'Cuevas Mollinedo', 'ubicacion_id' => 1,   'area_id' =>    3,    'codigo' =>    11138, 'estado' => 'Activo',  'role' =>           'TecnicoHTST', 'estado_hisopado_id'=>95],
            ['name' => 'Betty', 'apellido' => 'Mamani Flores', 'ubicacion_id' => 1,   'area_id' =>    3,    'codigo' =>    67847, 'estado' => 'Activo',  'role' =>           'TecnicoHTST', 'estado_hisopado_id'=>95],
            ['name' => 'Gustabo', 'apellido' => 'Tola Alvarez', 'ubicacion_id' => 1,   'area_id' =>    10,    'codigo' =>    64336, 'estado' => 'Activo',  'role' =>           'Contador', 'estado_hisopado_id'=>95],
            ['name' => 'Henry Gonzalo', 'apellido' => 'Nina Coaquira', 'ubicacion_id' => 1,   'area_id' =>    10,    'codigo' =>    66828, 'estado' => 'Activo',  'role' =>           'Contador', 'estado_hisopado_id'=>95],
            ['name' => 'Max Luis', 'apellido' => 'Humana Quintana', 'ubicacion_id' => 1,   'area_id' =>    10,    'codigo' =>    69445, 'estado' => 'Activo',  'role' =>           'Contador', 'estado_hisopado_id'=>95],
            ['name' => 'Victor Hugo', 'apellido' => 'Zabaleta Quispe', 'ubicacion_id' => 1,   'area_id' =>    10,    'codigo' =>    64662, 'estado' => 'Activo',  'role' =>           'Contador', 'estado_hisopado_id'=>95],
            ['name' => 'Willan', 'apellido' => 'Quispe Perca', 'ubicacion_id' => 1,   'area_id' =>    10,    'codigo' =>    64453, 'estado' => 'Activo',  'role' =>           'Contador', 'estado_hisopado_id'=>95],
            ['name' => 'Maycol Brayan', 'apellido' => 'Condori Huarino', 'ubicacion_id' => 1,   'area_id' =>    10,    'codigo' =>    68925, 'estado' => 'Activo',  'role' =>           'Contador', 'estado_hisopado_id'=>95],
            ['name' => 'Juan', 'apellido' => 'Huaranca Ajno', 'ubicacion_id' => 1,   'area_id' =>    10,    'codigo' =>    66644, 'estado' => 'Activo',  'role' =>           'Contador', 'estado_hisopado_id'=>95],
            ['name' => 'Limbert Antonio', 'apellido' => 'Gutierrez Cochi', 'ubicacion_id' => 1,   'area_id' =>    10,    'codigo' =>    65499, 'estado' => 'Activo',  'role' =>           'Contador', 'estado_hisopado_id'=>95],
            ['name' => 'Lima Quelca', 'apellido' => 'David', 'ubicacion_id' => 1,   'area_id' =>    10,    'codigo' =>    67810, 'estado' => 'Activo',  'role' =>           'Contador', 'estado_hisopado_id'=>95],
            ['name' => 'Wilfredo Ovidio', 'apellido' => 'Gomez Ajata', 'ubicacion_id' => 1,   'area_id' =>    4,    'codigo' =>    66998, 'estado' => 'Activo',  'role' =>           'EncargadoCaldero', 'estado_hisopado_id'=>95],
            ['name' => 'Ronaldiñho', 'apellido' => 'Alcon', 'ubicacion_id' => 1,   'area_id' =>    4,    'codigo' =>    69331, 'estado' => 'Activo',  'role' =>           'AyudanteCalidad', 'estado_hisopado_id'=>95],















    ['name' => 'Joel', 'apellido' => 'Conde Quispe', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80987, 'estado' => 'Activo', 'role' => 'TecnicoHTST', 'estado_hisopado_id' => 95],
    ['name' => 'Miguel Mauricio', 'apellido' => 'Ferrufino Ticona', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80985, 'estado' => 'Activo', 'role' => 'TecnicoHTST', 'estado_hisopado_id' => 95],
    ['name' => 'Juan', 'apellido' => 'Huaranca Ajno', 'ubicacion_id' => 1, 'area_id' => 11, 'codigo' => 66644, 'estado' => 'Activo', 'role' => 'Montacargas', 'estado_hisopado_id' => 95],
    ['name' => 'Gustabo', 'apellido' => 'Tola Alvarez', 'ubicacion_id' => 1, 'area_id' => 11, 'codigo' => 64336, 'estado' => 'Activo', 'role' => 'Montacargas', 'estado_hisopado_id' => 95],
    ['name' => 'Victor Hugo', 'apellido' => 'Zabaleta Quispe', 'ubicacion_id' => 1, 'area_id' => 11, 'codigo' => 64662, 'estado' => 'Activo', 'role' => 'Montacargas', 'estado_hisopado_id' => 95],
    ['name' => 'Wilmer', 'apellido' => 'Espejo Huanca', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 67397, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE SERVICIOS', 'estado_hisopado_id' => 95],
    ['name' => 'Wilfredo Ovidio', 'apellido' => 'Gomez Ajata', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 66998, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE SERVICIOS', 'estado_hisopado_id' => 95],
    ['name' => 'Benigno Jose', 'apellido' => 'Chura Colque', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65257, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE PROCESO', 'estado_hisopado_id' => 95],
    ['name' => 'Edgar', 'apellido' => 'Mamani Vela', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 62927, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE PROCESO', 'estado_hisopado_id' => 95],
    ['name' => 'Carlos', 'apellido' => 'Yana Churata', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 62580, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE PROCESO', 'estado_hisopado_id' => 95],
    ['name' => 'Ever Rodrigo', 'apellido' => 'Ajahuanca Benito', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 62255, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE ENVASADO UHT', 'estado_hisopado_id' => 95],
    ['name' => 'Marco Antonio', 'apellido' => 'Calle Catari', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 64443, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE ENVASADO UHT', 'estado_hisopado_id' => 95],
    ['name' => 'Villanueva', 'apellido' => 'Calle Ochoa', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65060, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE ENVASADO UHT', 'estado_hisopado_id' => 95],
    ['name' => 'Felix Nicolas', 'apellido' => 'Chipana Tancara', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 64248, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE ENVASADO UHT', 'estado_hisopado_id' => 95],
    ['name' => 'Juan Carlos', 'apellido' => 'Huanca Poma', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 66910, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE ENVASADO UHT', 'estado_hisopado_id' => 95],
    ['name' => 'Norberto', 'apellido' => 'Javier Choque', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 66679, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE ENVASADO UHT', 'estado_hisopado_id' => 95],
    ['name' => 'Ramiro', 'apellido' => 'Limari Baltazar', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 64613, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE ENVASADO UHT', 'estado_hisopado_id' => 95],
    ['name' => 'Erikdeibit', 'apellido' => 'Mamani Franco', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 66885, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE ENVASADO UHT', 'estado_hisopado_id' => 95],
    ['name' => 'Reynaldo', 'apellido' => 'Mamani Marquez', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65472, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE ENVASADO UHT', 'estado_hisopado_id' => 95],
    ['name' => 'Jesus Bernabe', 'apellido' => 'Ramos Fuentes', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 64222, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE ENVASADO UHT', 'estado_hisopado_id' => 95],
    ['name' => 'Elviselio', 'apellido' => 'Titile Tito', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65544, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE ENVASADO UHT', 'estado_hisopado_id' => 95],
    ['name' => 'Ruben', 'apellido' => 'Torrez Usnayo', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 64430, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE ENVASADO UHT', 'estado_hisopado_id' => 95],
    ['name' => 'Alan', 'apellido' => 'Canaviri Canaviri', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 64686, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE ENVASADO HTST', 'estado_hisopado_id' => 95],
    ['name' => 'Heidi Blanca', 'apellido' => 'Merlo Palacios', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 64074, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE ENVASADO HTST', 'estado_hisopado_id' => 95],
    ['name' => 'Jorge Luis', 'apellido' => 'Quispe Pallarico', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65724, 'estado' => 'Activo', 'role' => 'MAQUINISTA DE ENVASADO HTST', 'estado_hisopado_id' => 95],
    ['name' => 'Fausto', 'apellido' => 'Aruquipa Collquehuanca', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 68587, 'estado' => 'Activo', 'role' => 'MAQUINISTA AYUDANTE DE PROCESO', 'estado_hisopado_id' => 95],
    ['name' => 'Efrain', 'apellido' => 'Calle Pairumani', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 62051, 'estado' => 'Activo', 'role' => 'MAQUINISTA AYUDANTE DE PROCESO', 'estado_hisopado_id' => 95],
    ['name' => 'Valentin', 'apellido' => 'Javier Ramos', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65641, 'estado' => 'Activo', 'role' => 'MAQUINISTA AYUDANTE DE PROCESO', 'estado_hisopado_id' => 95],
    ['name' => 'Julio', 'apellido' => 'Miranda Vargas', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69273, 'estado' => 'Activo', 'role' => 'MAQUINISTA AYUDANTE DE PROCESO', 'estado_hisopado_id' => 95],
    ['name' => 'Rodolfo', 'apellido' => 'Ticona Mamani', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 66796, 'estado' => 'Activo', 'role' => 'MAQUINISTA AYUDANTE DE PROCESO', 'estado_hisopado_id' => 95],
    ['name' => 'Eddy', 'apellido' => 'Vargas Condori', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 62031, 'estado' => 'Activo', 'role' => 'MAQUINISTA AYUDANTE DE PROCESO', 'estado_hisopado_id' => 95],
    ['name' => 'Andres', 'apellido' => 'Villca Mamani', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 64261, 'estado' => 'Activo', 'role' => 'MAQUINISTA AYUDANTE DE PROCESO', 'estado_hisopado_id' => 95],
    ['name' => 'Mario Gonzalo', 'apellido' => 'Ajahuanca Benito', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65661, 'estado' => 'Activo', 'role' => 'MAQUINISTA AYUDANTE DE ENVASADO HTST', 'estado_hisopado_id' => 95],
    ['name' => 'Jose', 'apellido' => 'Choque Mamani', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 66752, 'estado' => 'Activo', 'role' => 'MAQUINISTA AYUDANTE DE ENVASADO HTST', 'estado_hisopado_id' => 95],
    ['name' => 'Alfredo', 'apellido' => 'Choque Rondo', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 67817, 'estado' => 'Activo', 'role' => 'MAQUINISTA AYUDANTE DE ENVASADO HTST', 'estado_hisopado_id' => 95],
    ['name' => 'Jose Carlos', 'apellido' => 'Chura Chambi', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65646, 'estado' => 'Activo', 'role' => 'MAQUINISTA AYUDANTE DE ENVASADO HTST', 'estado_hisopado_id' => 95],
    ['name' => 'Jesus', 'apellido' => 'Gomez Mamani', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69496, 'estado' => 'Activo', 'role' => 'MAQUINISTA AYUDANTE DE ENVASADO HTST', 'estado_hisopado_id' => 95],
    ['name' => 'Florencio', 'apellido' => 'Marca Cachaca', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65137, 'estado' => 'Activo', 'role' => 'MAQUINISTA AYUDANTE DE ENVASADO HTST', 'estado_hisopado_id' => 95],
    ['name' => 'Vladimir', 'apellido' => 'Paucara Callisaya', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 68906, 'estado' => 'Activo', 'role' => 'MAQUINISTA AYUDANTE DE ENVASADO HTST', 'estado_hisopado_id' => 95],
    ['name' => 'Crithian Fernando', 'apellido' => 'Quispe Paxi', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69118, 'estado' => 'Activo', 'role' => 'MAQUINISTA AYUDANTE DE ENVASADO HTST', 'estado_hisopado_id' => 95],
    ['name' => 'Yenson Yelmo', 'apellido' => 'Tarqui Quispe', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 68895, 'estado' => 'Activo', 'role' => 'MAQUINISTA AYUDANTE DE ENVASADO HTST', 'estado_hisopado_id' => 95],
    ['name' => 'Eliana Estela', 'apellido' => 'Condori Mamani', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 64049, 'estado' => 'Activo', 'role' => 'Fraccionador', 'estado_hisopado_id' => 95],
    ['name' => 'Iber', 'apellido' => 'Huanca Cruz', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 64617, 'estado' => 'Activo', 'role' => 'Fraccionador', 'estado_hisopado_id' => 95],
    ['name' => 'Ronald', 'apellido' => 'Pacosillo Calcina', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 68695, 'estado' => 'Activo', 'role' => 'Fraccionador', 'estado_hisopado_id' => 95],
    ['name' => 'Bismar', 'apellido' => 'Acuña Puñi', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80998, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Cristhian David', 'apellido' => 'Alacama Quispe', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69186, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Monica', 'apellido' => 'Aliaga Huanca', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 62307, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Omar Alfredo', 'apellido' => 'Bautista Mamani', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80947, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Maritza', 'apellido' => 'Benito Benito', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 62653, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Hugo Adiemar', 'apellido' => 'Callisaya Ticona', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 62160, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Edson Jhonny', 'apellido' => 'Callizaya Anti', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69951, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Edgar', 'apellido' => 'Carazani Quispe', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80991, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Ronald', 'apellido' => 'Carazani Quispe', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80711, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Beymar Diego', 'apellido' => 'Carlo Quispe', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80969, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Joel Cristian', 'apellido' => 'Carpio Sarzuri', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69072, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Mery', 'apellido' => 'Castro Ururi', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 62503, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Luis Mario', 'apellido' => 'Cazas Calle', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69867, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Roly Dixon', 'apellido' => 'Charca Canaviri', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 81001, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Daniel', 'apellido' => 'Chipana Juan', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80988, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Jhon Jhunior', 'apellido' => 'Choque Alegria', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69818, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Omar', 'apellido' => 'Choque Chavez', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 68674, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Faustino Jemio', 'apellido' => 'Collo Zegarra', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65272, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Diego', 'apellido' => 'Gomez Tumiri', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80997, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Diego Alejandro', 'apellido' => 'Gonzales Illanes', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80902, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Guiver Madiam', 'apellido' => 'Gutierrez Burgoa', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80294, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Ivan Douglas', 'apellido' => 'Gutierrez Condori', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80545, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Raquel', 'apellido' => 'Gutierrez Flores', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 66184, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Diego Cesar', 'apellido' => 'Gutierrez Zarate', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69216, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Israel', 'apellido' => 'Guzman Sullcata', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80057, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Gunnar Xavier', 'apellido' => 'Herrera Mamani', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80548, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'José Manuel', 'apellido' => 'Humana Quintana', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69974, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Luis Alberto', 'apellido' => 'Humana Quintana', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69815, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Franklin Gustavo', 'apellido' => 'Jimenez Condori', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80327, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Leonela', 'apellido' => 'Laura Huiza', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 64769, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Silvia', 'apellido' => 'Laura Huiza', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65093, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Ebert', 'apellido' => 'Laura Mamani', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80990, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Maricela Julia', 'apellido' => 'Limachi Condori', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 64666, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Ronald', 'apellido' => 'Mamani Alanoca', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 66279, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Erick', 'apellido' => 'Mamani Apaza', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80689, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Limber Fabio', 'apellido' => 'Mamani Apaza', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 81000, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Wilmer', 'apellido' => 'Mamani Aquino', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 66954, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Rosalia', 'apellido' => 'Mamani Carazani', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 64006, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Miguel Angel', 'apellido' => 'Mamani Caviña', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80553, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Javier', 'apellido' => 'Mamani Choque', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69448, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Alex Daniel', 'apellido' => 'Mamani Franco', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69831, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Alan Axel', 'apellido' => 'Mamani Irala', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69161, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Beltran', 'apellido' => 'Mamani Mamani', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80999, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Jafet', 'apellido' => 'Mamani Mamani', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69500, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Nancy', 'apellido' => 'Mamani Mamani', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65129, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Juana', 'apellido' => 'Mamani Murga', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65115, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Diego', 'apellido' => 'Mamani Quisbert', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80612, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Luis Rodrigo', 'apellido' => 'Mamani Vallejos', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80996, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Jesus', 'apellido' => 'Miranda Vargas', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80993, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Marlene', 'apellido' => 'Mollo Choque', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 62262, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Jhonatan Javier', 'apellido' => 'Mollo Gomez', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80920, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Gustavo Gerardo', 'apellido' => 'Montenegro Mollinedo', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80308, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Alex', 'apellido' => 'Muchia Tahe', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 67016, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Rodolfo Tito', 'apellido' => 'Murillo Ali', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 68409, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Jorge Luis', 'apellido' => 'Noa Mamani', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80989, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Miguel Angel', 'apellido' => 'Pacheco Quispe', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80860, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Eustaquio', 'apellido' => 'Paco Aquise', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 66607, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Alexander', 'apellido' => 'Paredes Mamani', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69907, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Miriam Paulina', 'apellido' => 'Patty Mayta', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 66651, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Boris', 'apellido' => 'Peña Montecinos', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 68647, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Miguel', 'apellido' => 'Peñasco Mayta', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80686, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Vladimir', 'apellido' => 'Perez Coche', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 68603, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Julio Cesar', 'apellido' => 'Perez Jimenez', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80580, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Jose Emanuel', 'apellido' => 'Perez Quispe', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69510, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Johnny Gerald', 'apellido' => 'Perez Yucra', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80986, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Naida', 'apellido' => 'Quecaña Quispe', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69604, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Mikaela Nieves', 'apellido' => 'Quenta Laruta', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65056, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Jesus', 'apellido' => 'Quispe Calla', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69262, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Abraham Eduardo', 'apellido' => 'Quispe Calle', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80791, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Luis Alberto', 'apellido' => 'Quispe Gutierrez', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80703, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Hugo', 'apellido' => 'Quispe Huasco', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80410, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Alfredo', 'apellido' => 'Quispe Laura', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 64858, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Angel', 'apellido' => 'Quispe Laura', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 67438, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Lazaro Rene', 'apellido' => 'Quispe Mamani', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65491, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Jorge Luis', 'apellido' => 'Quispe PercA', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 68907, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Nely', 'apellido' => 'Quispe Quispe', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 66669, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Fernando', 'apellido' => 'Quispe Vargas', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69917, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Jonathan', 'apellido' => 'Ramos Baltazar', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80965, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Jose Julian', 'apellido' => 'Ramos Charca', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80716, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Ronal Javier', 'apellido' => 'Rojas Bustamante', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80599, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'William', 'apellido' => 'Rojas Machicado', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80976, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Luis Felipe', 'apellido' => 'Rosa Jimenez', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80995, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Miguel Angel', 'apellido' => 'Saire Velasco', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80715, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Jamir', 'apellido' => 'Santos Cristhian', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80923, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Cristofer Brandon', 'apellido' => 'Solares Carvajal', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80903, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Harold Christopher', 'apellido' => 'Soliz Tapia', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80992, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Monica Marlene', 'apellido' => 'Sonco Flores', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 68955, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Marcelo Josue', 'apellido' => 'Sullca Cuarite', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80544, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Susanalucia', 'apellido' => 'Surco Huanca', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65068, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Clemente Yawar', 'apellido' => 'Ticona Atahuachi', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80720, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Diego Antonio', 'apellido' => 'Ticona Beltran', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69938, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Alvaro', 'apellido' => 'Ticona Mendoza', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69528, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Lizandro Walter', 'apellido' => 'Ticona Nina', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80303, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Alvaro', 'apellido' => 'Tipuni Tarqui', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80781, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Yamil D\'Suca', 'apellido' => 'Trujillo Callisaya', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 80931, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Alvaro', 'apellido' => 'Vargas Mamani', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 68930, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Elian', 'apellido' => 'Vargas Quispe', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69799, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Yanet', 'apellido' => 'Villa Ramos', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65106, 'estado' => 'Activo', 'role' => 'Ensachetador', 'estado_hisopado_id' => 95],
    ['name' => 'Virginia', 'apellido' => 'Salinas Chacolla', 'ubicacion_id' => 1, 'area_id' => 4, 'codigo' => 64428, 'estado' => 'Activo', 'role' => 'AyudanteCalidad', 'estado_hisopado_id' => 95],
    ['name' => 'Hernando Roger', 'apellido' => 'Gutierrez Cochi', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 65008, 'estado' => 'Activo', 'role' => 'AYUDANTE DE INSUMOS', 'estado_hisopado_id' => 95],
    ['name' => 'Dionicio', 'apellido' => 'Jimenez Mollo', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 69541, 'estado' => 'Activo', 'role' => 'AYUDANTE DE INSUMOS', 'estado_hisopado_id' => 95],
    ['name' => 'Reynaldo', 'apellido' => 'Mamani Castillo', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 68601, 'estado' => 'Activo', 'role' => 'AYUDANTE DE INSUMOS', 'estado_hisopado_id' => 95],
    ['name' => 'Oscar Cesar', 'apellido' => 'Quispe Viamonte', 'ubicacion_id' => 1, 'area_id' => 3, 'codigo' => 66936, 'estado' => 'Activo', 'role' => 'AYUDANTE DE INSUMOS', 'estado_hisopado_id' => 95],
    ['name' => 'Maria Elena', 'apellido' => 'Llanos Mamani', 'ubicacion_id' => 1, 'area_id' => 4, 'codigo' => 80071, 'estado' => 'Activo', 'role' => 'Tecnico Desarrollo', 'estado_hisopado_id' => 95],
    ['name' => 'Mary', 'apellido' => 'Vargas Sangalli', 'ubicacion_id' => 1, 'area_id' => 4, 'codigo' => 80175, 'estado' => 'Activo', 'role' => 'Tecnico Desarrollo', 'estado_hisopado_id' => 95],







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
