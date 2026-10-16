<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Services;

use App\Domain\ModulosComunes\HigienePersonal\Models\HigienePersonal;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\Sistema\Configuracion\Models\Area;
use Carbon\Carbon;

class HigienePersonalService
{
    /**
     * Crear un nuevo registro de higiene personal
     */
    public function crearRegistro(array $data, User $supervisor): HigienePersonal
    {
        $conforme = $this->calcularConforme($data);
        
        // Obtener el empleado para asignar su turno actual
        $empleado = User::find($data['empleado_id']);
        if (!$empleado) {
            throw new \Exception('Empleado no encontrado');
        }
        $turno = $empleado->turno; // puede ser null
        
        return HigienePersonal::create([
            'ubicacion_id' => $supervisor->ubicacion_id,
            'empleado_id' => $data['empleado_id'],
            'supervisor_id' => $supervisor->id,
            'fecha' => $data['fecha'],
            'turno' => $turno, // ← nuevo campo
            'uniforme' => $data['uniforme'],
            'limpieza' => $data['limpieza'],
            'lavado_manos' => $data['lavado_manos'],
            'salud' => $data['salud'],
            'epp' => $data['epp'],
            'objetos' => $data['objetos'],
            'material_equipo' => $data['material_equipo'],
            'conforme' => $conforme,
            'observaciones' => $data['observaciones'] ?? null,
            'correccion' => $data['correccion'] ?? null,
        ]);
    }

    /**
     * Actualizar registro existente
     */
    public function actualizarRegistro(HigienePersonal $registro, array $data): bool
    {
        $conforme = $this->calcularConforme($data);
        
        // Si cambia el empleado, actualizar el turno al del nuevo empleado
        $turno = null;
        if (isset($data['empleado_id']) && $data['empleado_id'] != $registro->empleado_id) {
            $empleado = User::find($data['empleado_id']);
            if ($empleado) {
                $turno = $empleado->turno;
            }
        } else {
            // Si no cambia, mantener el turno actual del registro o actualizar si se desea (pero no es necesario)
            // Se puede dejar el turno actual para preservar el histórico.
            // Decisión: mantener el turno original a menos que se cambie de empleado.
            $turno = $registro->turno;
        }
        
        return $registro->update([
            'empleado_id' => $data['empleado_id'],
            'fecha' => $data['fecha'],
            'turno' => $turno, // actualizamos solo si cambia empleado, sino conserva el viejo
            'uniforme' => $data['uniforme'],
            'limpieza' => $data['limpieza'],
            'lavado_manos' => $data['lavado_manos'],
            'salud' => $data['salud'],
            'epp' => $data['epp'],
            'objetos' => $data['objetos'],
            'material_equipo' => $data['material_equipo'],
            'conforme' => $conforme,
            'observaciones' => $data['observaciones'] ?? null,
            'correccion' => $data['correccion'] ?? null,
        ]);
    }

    /**
     * Calcular si el registro es conforme
     */
    private function calcularConforme(array $data): bool
    {
        return $data['uniforme'] && 
               $data['limpieza'] && 
               $data['lavado_manos'] &&
               $data['salud'] && 
               $data['epp'] && 
               $data['objetos'] && 
               $data['material_equipo'];
    }

    /**
     * Buscar empleados con filtros (sin cambios)
     */
    public function buscarEmpleados(array $filtros, int $ubicacionId)
    {
        $query = User::where('ubicacion_id', $ubicacionId)
            ->select('id', 'name', 'apellido', 'codigo', 'area_id', 'turno', 'cargo');

        if (!empty($filtros['busqueda'])) {
            $search = $filtros['busqueda'];
            $query->where(function ($q) use ($search) {
                $q->where('codigo', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('apellido', 'like', "%{$search}%")
                  ->orWhere('cargo', 'like', "%{$search}%");
            });
        }

        if (!empty($filtros['area_id'])) {
            $query->where('area_id', $filtros['area_id']);
        }

        if (!empty($filtros['turno'])) {
            $query->where('turno', $filtros['turno']);
        }

        return $query->get();
    }

    /**
     * Generar estadísticas para reporte (sin cambios, porque usa el query y los registros)
     */
    public function generarEstadisticas($query): array
    {
        $registros = $query->get();
        
        $total = $registros->count();
        $conformes = $registros->where('conforme', true)->count();
        $noConformes = $registros->where('conforme', false)->count();
        
        return [
            'total' => $total,
            'conformes' => $conformes,
            'no_conformes' => $noConformes,
            'porcentaje_conformidad' => $total > 0 ? round(($conformes / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Obtener distribución por turno (usando la columna turno del registro)
     */
    public function obtenerDistribucionPorTurno($query): array
    {
        // Cambiamos: agrupar por el campo 'turno' del registro, no por empleado.turno
        return $query->get()
            ->groupBy('turno') // ahora usamos la columna del registro
            ->map(function ($items, $turno) {
                return [
                    'turno' => $turno ?: 'Sin turno', // manejo de null
                    'total' => $items->count(),
                    'conformes' => $items->where('conforme', true)->count(),
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Obtener distribución por área (sin cambios, porque área solo está en empleado)
     */
    public function obtenerDistribucionPorArea($query): array
    {
        return $query->with(['empleado.area'])
            ->get()
            ->groupBy('empleado.area.nombre')
            ->map(function ($items, $area) {
                return [
                    'area' => $area,
                    'total' => $items->count(),
                    'conformes' => $items->where('conforme', true)->count(),
                ];
            })
            ->values()
            ->toArray();
    }
}