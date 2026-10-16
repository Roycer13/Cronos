<?php

namespace App\Domain\ModulosComunes\Sanidad\Services;

use App\Domain\ModulosComunes\Sanidad\Models\Policlinico;
use App\Domain\ModulosComunes\Sanidad\Models\ReconsultaAtencionMedica;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class ReconsultaAtencionMedicaService
{
    public function listar(array $filtros, int $perPage = 10): LengthAwarePaginator
    {
        return ReconsultaAtencionMedica::with(['atencionMedica', 'medicoUser', 'policlinico'])
            ->when($filtros['atencion_medica_id'] ?? null, fn($q, $id) => $q->where('atencion_medica_id', $id))
            ->when($filtros['medico'] ?? null, fn($q, $medico) => $q->where('medico', $medico))
            ->when($filtros['fecha_desde'] ?? null, fn($q, $fecha) => $q->whereDate('fecha_atencion', '>=', $fecha))
            ->when($filtros['fecha_hasta'] ?? null, fn($q, $fecha) => $q->whereDate('fecha_atencion', '<=', $fecha))
            ->when($filtros['transferencia'] ?? null, fn($q, $trans) => $q->where('transferencia', $trans))
            ->orderByDesc('fecha_atencion')
            ->paginate($perPage);
    }

    public function crear(array $data): ReconsultaAtencionMedica
    {
        return ReconsultaAtencionMedica::create($data);
    }

    public function actualizar(ReconsultaAtencionMedica $reconsulta, array $data): ReconsultaAtencionMedica
    {
        $reconsulta->update($data);
        return $reconsulta;
    }

    public function eliminar(ReconsultaAtencionMedica $reconsulta): ?bool
    {
        return $reconsulta->delete();
    }

    public function encontrar($id): ?ReconsultaAtencionMedica
    {
        return ReconsultaAtencionMedica::with(['atencionMedica', 'medicoUser', 'policlinico'])->find($id);
    }

    public function obtenerParaFormulario($atencionId = null): array
    {
        return [
            'medicos' => User::role('medico')->select('id', 'name', 'apellido')->get(),
            'policlinicos' => Policlinico::select('id', 'nombre')->orderBy('nombre')->get(),
            'atencion_medica_id' => $atencionId,
        ];
    }
}