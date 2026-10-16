<?php

namespace Tests\Feature\PlantaLacteos;

use App\Domain\PlantaLacteos\Models\AditivoQuimicoServicio;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AditivoQuimicoServicioTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_update_and_delete_aditivo_quimico_record(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $payload = [
            'tiempo' => '2026-07-10 08:15:00',
            'wet_boil_101' => '1.23456',
            'wet_boil_201' => '2.34567',
            'wet_boil_402' => '3.45678',
            'wet_boil_801' => '4.56789',
            'soda_caustica' => '5.67890',
        ];

        $response = $this->post(route('aditivos-quimicos.store'), $payload);

        $response->assertRedirect(route('aditivos-quimicos.index'));
        $this->assertDatabaseHas('PLL_aditivos_quimicos', [
            'user_id' => $user->id,
            'wet_boil_101' => '1.23456',
        ]);

        $registro = AditivoQuimicoServicio::firstOrFail();

        $updatePayload = [
            'tiempo' => '2026-07-10 09:30:00',
            'wet_boil_101' => '9.99999',
            'wet_boil_201' => '8.88888',
            'wet_boil_402' => '7.77777',
            'wet_boil_801' => '6.66666',
            'soda_caustica' => '5.55555',
        ];

        $this->put(route('aditivos-quimicos.update', $registro), $updatePayload)
            ->assertRedirect(route('aditivos-quimicos.index'));

        $this->assertDatabaseHas('PLL_aditivos_quimicos', [
            'id' => $registro->id,
            'wet_boil_101' => '9.99999',
            'user_id' => $user->id,
        ]);

        $this->delete(route('aditivos-quimicos.destroy', $registro))
            ->assertRedirect(route('aditivos-quimicos.index'));

        $this->assertDatabaseMissing('PLL_aditivos_quimicos', ['id' => $registro->id]);
    }
}
