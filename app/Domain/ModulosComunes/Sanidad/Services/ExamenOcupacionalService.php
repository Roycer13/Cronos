<?php

namespace App\Domain\ModulosComunes\Sanidad\Services;

use App\Domain\ModulosComunes\Sanidad\Models\ExamenOcupacional;
use App\Domain\ModulosComunes\Sanidad\Models\Policlinico;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class ExamenOcupacionalService
{
    public function listar(array $filtros, int $perPage = 10): LengthAwarePaginator
    {
        return ExamenOcupacional::with(['empleado', 'medico', 'policlinico'])
            ->when($filtros['tipo_examen'] ?? null, fn($q, $tipo) => $q->where('tipo_examen', $tipo))
            ->when($filtros['empleado_id'] ?? null, fn($q, $id) => $q->where('empleado_id', $id))
            ->when($filtros['medico_id'] ?? null, fn($q, $id) => $q->where('medico_id', $id))
            ->when($filtros['fecha_desde'] ?? null, fn($q, $fecha) => $q->whereDate('fecha_examen', '>=', $fecha))
            ->when($filtros['fecha_hasta'] ?? null, fn($q, $fecha) => $q->whereDate('fecha_examen', '<=', $fecha))
            ->when($filtros['aptitud_ocupacional'] ?? null, fn($q, $apt) => $q->where('aptitud_ocupacional', $apt))
            ->when($filtros['policlinico_id'] ?? null, fn($q, $id) => $q->where('policlinico_id', $id))
            ->when($filtros['transferencia_requerida'] ?? null, fn($q, $trans) => $q->where('transferencia_requerida', $trans))
            ->orderByDesc('fecha_examen')
            ->paginate($perPage);
    }

    public function crear(array $data): ExamenOcupacional
    {
        $data = $this->normalizeData($data);
        return ExamenOcupacional::create($data);
    }

    public function actualizar(ExamenOcupacional $examen, array $data): ExamenOcupacional
    {
        $data = $this->normalizeData($data);
        $examen->update($data);
        return $examen;
    }

    public function eliminar(ExamenOcupacional $examen): ?bool
    {
        return $examen->delete();
    }

    public function encontrar($id): ?ExamenOcupacional
    {
        return ExamenOcupacional::with(['empleado', 'medico', 'policlinico'])->find($id);
    }

    public function obtenerParaFormulario(): array
    {
        return [
            'empleados' => User::select('id', 'codigo', 'name', 'apellido')->orderBy('name')->get(),
            'policlinicos' => Policlinico::select('id', 'nombre')->orderBy('nombre')->get(),
            'tipos_examen' => [
                ['value' => 'PRE', 'label' => 'Pre-ocupacional'],
                ['value' => 'POST', 'label' => 'Post-ocupacional'],
                ['value' => 'OCUPACIONAL', 'label' => 'Ocupacional periódico'],
            ],
            'aptitudes' => [
                ['value' => 'APTO', 'label' => 'Apto'],
                ['value' => 'APTO CON RESTRICCIONES', 'label' => 'Apto con restricciones'],
                ['value' => 'NO APTO', 'label' => 'No apto'],
            ],
        ];
    }
    private function convertJsonFields(array $data): array
    {
        $jsonFields = ['patologias_lista', 'vacunas_tipo_dosis', 'vacunas_fecha_ultima_dosis', 'habitos_deportes'];
        foreach ($jsonFields as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                // Dividir por líneas, limpiar espacios y eliminar vacías
                $lines = array_filter(array_map('trim', explode("\n", $data[$field])));
                $data[$field] = $lines ?: null; // Si hay líneas, guardar como array; si no, null
            }
        }
        return $data;
    }
    private function normalizeData(array $data): array
    {
        // Convertir fechas de mes/año a fecha completa (primer día del mes)
        if (isset($data['fecha_inicio']) && $data['fecha_inicio']) {
            $data['fecha_inicio'] = $data['fecha_inicio'] . '-01';
        }
        if (isset($data['fecha_fin']) && $data['fecha_fin']) {
            $data['fecha_fin'] = $data['fecha_fin'] . '-01';
        }

        // Convertir campos de texto multilínea a arrays para campos JSON
        $jsonFields = ['patologias_lista', 'vacunas_tipo_dosis', 'vacunas_fecha_ultima_dosis', 'habitos_deportes'];
        foreach ($jsonFields as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                // Dividir por líneas, limpiar espacios y eliminar vacías
                $lines = array_filter(array_map('trim', explode("\n", $data[$field])));
                $data[$field] = $lines ?: null; // Si hay líneas, guardar como array; si no, null
            }
        }

        return $data;
    }
}
