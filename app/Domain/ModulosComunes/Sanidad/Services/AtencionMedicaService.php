<?php

namespace App\Domain\ModulosComunes\Sanidad\Services;

use App\Domain\ModulosComunes\Sanidad\Models\AtencionMedica;
use App\Domain\ModulosComunes\Sanidad\Models\Policlinico;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class AtencionMedicaService
{
    public function listar(array $filtros, int $perPage = 10): LengthAwarePaginator
    {
        return AtencionMedica::with(['medicoUser', 'pacienteUser', 'policlinico', 'estado'])
            ->when($filtros['medico'] ?? null, fn($q, $medico) => $q->where('medico', $medico))
            ->when($filtros['paciente'] ?? null, fn($q, $paciente) => $q->where('paciente', $paciente))
            ->when($filtros['fecha_desde'] ?? null, fn($q, $fecha) => $q->whereDate('fecha_atencion', '>=', $fecha))
            ->when($filtros['fecha_hasta'] ?? null, fn($q, $fecha) => $q->whereDate('fecha_atencion', '<=', $fecha))
            ->when($filtros['estado_id'] ?? null, fn($q, $estado) => $q->where('estado_id', $estado))
            ->when($filtros['transferencia'] ?? null, fn($q, $trans) => $q->where('transferencia', $trans))
            ->when($filtros['policlinico_id'] ?? null, fn($q, $id) => $q->where('policlinico_id', $id))
            ->when($filtros['gravedad'] ?? null, fn($q, $g) => $q->where('gravedad', $g))
            ->orderByDesc('fecha_atencion')
            ->paginate($perPage);
    }

    public function crear(array $data): AtencionMedica
    {
        return AtencionMedica::create($data);
    }

    public function actualizar(AtencionMedica $atencion, array $data): AtencionMedica
    {
        $atencion->update($data);
        return $atencion;
    }

    public function eliminar(AtencionMedica $atencion): ?bool
    {
        // Verificar si tiene reconsultas
        if ($atencion->reconsultas()->exists()) {
            throw new \Exception('No se puede eliminar la atención médica porque tiene reconsultas asociadas.');
        }
        return $atencion->delete();
    }

    public function encontrar($id)
    {
        return AtencionMedica::with([
            'medicoUser',
            'pacienteUser',
            'estado',
            'policlinico',
            'reconsultas.medicoUser',
            'reconsultas.policlinico'
        ])->findOrFail($id);
    }

    public function obtenerParaFormulario(): array
    {
        return [
            'pacientes' => User::select('id', 'name', 'apellido', 'codigo')->get(),
            'estados' => Estado::select('id', 'nombre')
                ->where('nombre', 'Completado')
                ->orWhere('nombre', 'En proceso')
                ->orWhere('nombre', 'Observado')
                ->get(),
            'policlinicos' => Policlinico::select('id', 'nombre')->orderBy('nombre')->get(),
        ];
    }
}
