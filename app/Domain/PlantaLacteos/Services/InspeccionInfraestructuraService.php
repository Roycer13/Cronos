<?php
namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\Infraestructura;
use App\Domain\PlantaLacteos\Models\InspeccionInfraestructura;
use App\Domain\PlantaLacteos\Models\AccionInfraestructura;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class InspeccionInfraestructuraService
{
    /**
     * Crea la inspección y las acciones de los criterios que no cumplen.
     * $data debe contener:
     *   'infraestructura_id', 'fecha' (opcional, default now),
     *   para cada criterio: 'pisos_ok', 'pisos_observacion', etc.
     *   'criterios' => array de arrays con ok/observacion por criterio (uso masivo)
     *   'acciones' => array de arrays con la info de cada acción nueva
     */
    public function crearInspeccionConAcciones(array $data): InspeccionInfraestructura {
        return DB::transaction(function () use ($data) {
            $infra = Infraestructura::findOrFail($data['infraestructura_id']);
            $user = Auth::user();

            $inspeccionData = [
                'ubicacion_id' => $infra->ubicacion_id,
                'infraestructura_id' => $infra->id,
                'user_id' => $user->id,
                'fecha' => $data['fecha'] ?? now(),
                'observacion_general' => $data['observacion_general'] ?? null,
            ];

            $criteriosConfig = collect($data['criterios'] ?? [])
                ->keyBy('criterio')
                ->map(fn ($criterio) => [
                    'ok' => $criterio['ok'] ?? true,
                    'observacion' => $criterio['observacion'] ?? null,
                ]);

            // Solo los criterios que aplican al área
            $criteriosActivos = $infra->criteriosActivos();
            foreach ($criteriosActivos as $criterio) {
                $config = $criteriosConfig->get($criterio);

                $inspeccionData[$criterio.'_ok'] = $config['ok'] ?? ($data[$criterio.'_ok'] ?? true);
                $inspeccionData[$criterio.'_observacion'] = $config['observacion'] ?? ($data[$criterio.'_observacion'] ?? null);
            }

            $inspeccion = InspeccionInfraestructura::create($inspeccionData);

            // Crear acciones si vienen en el request
            if (!empty($data['acciones'])) {
                foreach ($data['acciones'] as $accion) {
                    if (empty($accion['descripcion'] ?? null)) {
                        continue;
                    }

                    AccionInfraestructura::create([
                        'ubicacion_id' => $infra->ubicacion_id,
                        'inspeccion_infraestructura_id' => $inspeccion->id,
                        'criterio' => $accion['criterio'],
                        'descripcion' => $accion['descripcion'],
                        'tipo_accion' => $accion['tipo_accion'] ?? null,
                        'responsable' => $accion['responsable'] ?? null,
                        'fecha_ejecucion' => $accion['fecha_ejecucion'] ?? null,
                        'estado' => $accion['estado'] ?? 'Pendiente',
                        'referencia' => $accion['referencia'] ?? null,
                        'observaciones' => $accion['observaciones'] ?? null,
                    ]);
                }
            }

            // Actualizar última inspección del área
            $infra->update(['ultima_inspeccion' => $inspeccionData['fecha']]);

            return $inspeccion;
        });
    }

    public function deleteInspeccion(InspeccionInfraestructura $inspeccion): void {
        DB::transaction(function () use ($inspeccion) {
            $inspeccion->acciones()->delete();
            $inspeccion->delete();
        });
    }
}