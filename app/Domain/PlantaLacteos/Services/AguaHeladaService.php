<?php
namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\AguaHelada;
use Illuminate\Support\Facades\DB;

class AguaHeladaService
{
    public function create(array $data): AguaHelada {
        return DB::transaction(function () use ($data) {
            $user = auth()->user();
            $data['user_id'] = $user?->id;

            if ($user?->ubicacion_id) {
                $data['ubicacion_id'] = $user->ubicacion_id;
            }

            return AguaHelada::create($data);
        });
    }

    public function update(AguaHelada $registro, array $data): AguaHelada {
        return DB::transaction(function () use ($registro, $data) {
            $user = auth()->user();

            if ($user?->ubicacion_id) {
                $data['ubicacion_id'] = $user->ubicacion_id;
            }

            $registro->update($data);
            return $registro->fresh();
        });
    }

    public function delete(AguaHelada $registro): void {
        DB::transaction(fn() => $registro->delete());
    }
}