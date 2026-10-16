<?php

namespace Tests\Feature\PlantaLacteos;

use App\Domain\PlantaLacteos\Models\RecepcionMateriaPrima;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class InformeMateriaPrimaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Las pruebas solo necesitan filas mínimas; se omiten las FK de catálogos.
        Schema::disableForeignKeyConstraints();
        foreach ([1, 2] as $id) {
            DB::table('ubicaciones')->insert(['id' => $id, 'nombre' => "Ubicación $id", 'tipo_ubicacion_id' => 1]);
        }
        DB::table('PLL_item_materia_primas')->insert(['id' => 1, 'nombre' => 'Harina']);
    }

    private function usuario(int $ubicacionId, bool $conPermiso = true, bool $admin = false): User
    {
        $user = User::factory()->create(['ubicacion_id' => $ubicacionId]);

        if ($admin) {
            $user->assignRole(Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']));
        } elseif ($conPermiso) {
            $user->givePermissionTo(Permission::firstOrCreate(['name' => 'r_recepcionMateriaPrima', 'guard_name' => 'web']));
        }

        return $user;
    }

    private function recepcion(int $ubicacionId, ?string $kg, string $tiempo = '2026-07-10 08:00:00'): void
    {
        RecepcionMateriaPrima::create([
            'tiempo' => $tiempo,
            'user_id' => User::factory()->create()->id,
            'item_materia_prima_id' => 1,
            'ubicacion_id' => $ubicacionId,
            'cantidad_recepcionada_total_kg' => $kg,
        ]);
    }

    public function test_sin_permiso_no_puede_ver_el_pdf_ni_el_informe(): void
    {
        $this->actingAs($this->usuario(1, conPermiso: false));

        $this->getJson('/recepciones-materia-prima/pdf')->assertForbidden();
        $this->getJson('/informes/materia-prima/datos')->assertForbidden();
        $this->get('/informes/materia-prima/excel')->assertForbidden();
    }

    public function test_usuario_no_admin_solo_suma_su_ubicacion(): void
    {
        $this->recepcion(1, '100.000');
        $this->recepcion(1, '50.500');
        $this->recepcion(2, '999.000');

        $this->actingAs($this->usuario(1));

        $general = $this->getJson('/informes/materia-prima/datos')
            ->assertOk()
            ->json('resumen.general');

        $this->assertSame(2, (int) $general['recepciones']);
        $this->assertEquals(150.5, (float) $general['total_kg']);
    }

    public function test_admin_ve_todas_las_ubicaciones_y_cuenta_recepciones_sin_kg(): void
    {
        $this->recepcion(1, '10.000');
        $this->recepcion(2, '20.000');
        $this->recepcion(2, null);

        $this->actingAs($this->usuario(1, admin: true));

        $general = $this->getJson('/informes/materia-prima/datos')->json('resumen.general');

        $this->assertSame(3, (int) $general['recepciones']);
        $this->assertEquals(30.0, (float) $general['total_kg']);
        $this->assertSame(1, (int) $general['sin_kg']);
    }

    public function test_rango_de_fechas_incluye_el_ultimo_dia_completo(): void
    {
        $this->recepcion(1, '10.000', '2026-07-01 08:00:00');
        $this->recepcion(1, '20.000', '2026-07-10 23:30:00');
        $this->recepcion(1, '40.000', '2026-07-11 00:30:00');

        $this->actingAs($this->usuario(1));

        $general = $this->getJson('/informes/materia-prima/datos?fecha_desde=2026-07-01&fecha_hasta=2026-07-10')
            ->json('resumen.general');

        $this->assertEquals(30.0, (float) $general['total_kg']);
    }

    public function test_fecha_hasta_anterior_a_desde_devuelve_422(): void
    {
        $this->actingAs($this->usuario(1));

        $this->getJson('/informes/materia-prima/datos?fecha_desde=2026-07-10&fecha_hasta=2026-07-01')
            ->assertStatus(422);
    }

    public function test_descarga_excel_con_permiso(): void
    {
        $this->recepcion(1, '10.000');
        $this->actingAs($this->usuario(1));

        $this->get('/informes/materia-prima/excel')
            ->assertOk()
            ->assertHeader('content-disposition');
    }
}
