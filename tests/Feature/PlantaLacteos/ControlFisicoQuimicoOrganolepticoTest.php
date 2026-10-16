<?php

namespace Tests\Feature\PlantaLacteos;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ControlFisicoQuimicoOrganolepticoTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_page_can_be_rendered(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('control-fisicoquimico-organoleptico.index'));

        $response->assertOk();
    }
}
