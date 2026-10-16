<?php

namespace Tests\Feature\PlantaLacteos;

use App\Domain\PlantaLacteos\Http\Requests\InfraestructuraRequest;
use App\Domain\PlantaLacteos\Models\Infraestructura;
use App\Domain\PlantaLacteos\Models\InspeccionInfraestructura;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InspeccionInfraestructuraTest extends TestCase
{
    use RefreshDatabase;

    public function test_infraestructura_request_validates_the_existing_ubicaciones_table(): void
    {
        $request = new InfraestructuraRequest();
        $rules = $request->rules();

        $this->assertSame('required|exists:ubicaciones,id', $rules['ubicacion_id']);
    }

    public function test_bulk_creation_can_store_general_observations_and_actions(): void
    {
        $user = User::factory()->create();
        $ubicacion = Ubicacion::factory()->create();
        $infraestructura = Infraestructura::create([
            'ubicacion_id' => $ubicacion->id,
            'nombre' => 'Área de recepción',
            'usa_pisos' => true,
            'usa_paredes' => false,
            'usa_techos' => false,
            'usa_puertas' => false,
            'usa_ventanas' => false,
            'usa_drenajes' => false,
            'usa_iluminacion' => false,
            'usa_ventilacion' => false,
            'usa_lavamanos' => false,
            'usa_servicios_sanitarios' => false,
            'usa_almacenamiento' => false,
            'usa_senalizacion' => false,
            'activo' => true,
        ]);

        $this->actingAs($user);
        $this->withoutMiddleware();

        $payload = [
            'infraestructuras' => [$infraestructura->id],
            'fecha' => '2026-08-03T10:30:00',
            'observacion_general' => 'Inspección general masiva',
            'criterios' => [
                [
                    'criterio' => 'pisos',
                    'ok' => false,
                    'observacion' => 'Piso con daño localizado',
                ],
            ],
            'acciones' => [
                [
                    'criterio' => 'pisos',
                    'descripcion' => 'Reparar piso',
                    'responsable' => 'Operador',
                    'estado' => 'Pendiente',
                ],
            ],
        ];

        $response = $this->post(route('inspecciones.storeMasivo'), $payload);

        $response->assertRedirect(route('inspecciones.index'));

        $inspeccion = InspeccionInfraestructura::query()->where('infraestructura_id', $infraestructura->id)->firstOrFail();
        $this->assertFalse((bool) $inspeccion->pisos_ok);
        $this->assertSame('Piso con daño localizado', $inspeccion->pisos_observacion);
        $this->assertSame('Inspección general masiva', $inspeccion->observacion_general);
        $this->assertDatabaseHas('acciones_infraestructura', [
            'inspeccion_infraestructura_id' => $inspeccion->id,
            'descripcion' => 'Reparar piso',
            'criterio' => 'pisos',
        ]);
    }
}
