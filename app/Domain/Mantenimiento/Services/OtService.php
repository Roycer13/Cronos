<?php

namespace App\Domain\Mantenimiento\Services;

// use Spatie\Permission\Models\Role;

use App\Domain\Mantenimiento\Models\AyudanteOt;
use App\Domain\Mantenimiento\Models\Ot;
use App\Domain\Mantenimiento\Models\Repuesto;
use App\Domain\Mantenimiento\Models\SolicitudOt;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OtService
{
    /**
     * Crea un nuevo usuario con validaciones y control transaccional.
     */

    public function createOt(array $data): Ot
    {
        return DB::transaction(function () use ($data) {
            try {
                // Generar número de OT automáticamente
                $data['numero'] = Ot::generarNumeroSiguiente();

                // Obtener el estado "Asignado"
                $estadoAsignado = Estado::where('nombre', 'Asignado')->first();
                if (!$estadoAsignado) {
                    throw new \Exception('No se encontró el estado "Asignado" en la base de datos.');
                }

                $data['estado_id'] = $estadoAsignado->id;
                $data['tipo_orden'] = 'Correctivo'; // O según tu lógica

                $ot = Ot::create($data);

                AyudanteOt::create([
                    'ot_id'   => $ot->id,
                    'user_id' => $data['user_id'], // el encargado asignado
                    // tiempo_inicio y tiempo_fin se quedan null
                ]);

                if (!empty($data['solicitud_ot_id'])) {
                    $estadoAprobado = Estado::where('nombre', 'Aprobado')->first();
                    if (!$estadoAprobado) {
                        throw new \Exception('No se encontró el estado "Aprobado" en la base de datos.');
                    }

                    $ot->solicitudOt()->update(['estado_id' => $estadoAprobado->id]);
                }

                return $ot;
            } catch (\Throwable $e) {
                Log::error('Error al crear OT: ' . $e->getMessage(), ['data' => $data]);
                throw $e;
            }
        });
    }


    /*  * Elimina un usuario, con control de transacción y logging.
     *
     * @param User $user
     * @param int|null $authUserId ID del usuario autenticado para evitar auto-eliminación
     * @return bool
     * @throws \Exception
     */
    public function deleteSolicitudOt(SolicitudOt $solicitudOt): bool
    {



        return DB::transaction(function () use ($solicitudOt) {
            try {
                return (bool) $solicitudOt->delete(); // 👈 convertimos a bool
            } catch (\Throwable $e) {

                Log::error('Error al eliminar solicitudOt: ' . $e->getMessage(), ['solicitudOt_id' => $solicitudOt->id]);
                throw $e;
            }
        }) ?? false; // 👈 fallback en caso de que transaction devuelva null
    }




    public function updateSolicitudOt(SolicitudOt $solicitudOt, array $data,): bool
    {
        return DB::transaction(function () use ($solicitudOt, $data) {
            try {




                // Actualizamos el resto de campos del usuario
                $solicitudOt->fill($data);
                $solicitudOt->save();



                return true;
            } catch (\Throwable $e) {
                Log::error('Error al actualizar repuesto: ' . $e->getMessage(), [
                    'solicitudOt' => $solicitudOt->id,
                    'data' => $data,
                ]);
                throw new \Exception('No se pudo actualizar el repuesto.');
            }
        });
    }

    public function getOtsForUser($user, array $filters = []): array
    {
        $query = Ot::with([
            'user',
            'estado',
            'prioridad',
            'solicitudOt' => fn($q) => $q->with(['maquinaEquipo', 'sector.ubicacion.tipoUbicacion', 'user']),
             'ayudantes.user'
        ])->filter($filters)
            ->orderBy($filters['sort'] ?? 'created_at');

        // 🔹 Determinamos si el usuario es "admin" según los roles definidos
        $isAdmin = $user->hasAnyRole(['admin', 'JefeMantenimiento', 'SupervisorMantenimiento']);

        // 🔹 Filtrado según roles: si NO es admin, limitar a sus propias OTs
        if (! $isAdmin) {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)                     // encargado
                    ->orWhereHas('ayudantes', function ($q2) use ($user) {
                        $q2->where('user_id', $user->id);             // ayudante
                    });
            });
        }
        // 🔹 Paginador (se mantiene withQueryString para preservar filtros en la URL)
        $paginator = $query->paginate($filters['per_page'] ?? 3)->withQueryString();

        // 🔹 Retornamos tanto el paginator como el flag isAdmin
        return [
            'ots' => $paginator,
            'isAdmin' => $isAdmin,
        ];
    }


    public function actualizarDetalles(Ot $ot, array $data): bool
    {
        return DB::transaction(function () use ($ot, $data) {
            try {


                if ($ot->solicitudOt) {
                    $estadoCompletado = Estado::where('nombre', 'Completado')->first();
                    if (!$estadoCompletado) {
                        throw new \Exception('No se encontró el estado "Completado" en la base de datos.');
                    }

                    $ot->solicitudOt()->update(['estado_id' => $estadoCompletado->id]);
                }
                $ot->fill([
                    'estado_id' => $data['estado_id'] ?? $estadoCompletado->id,
                    'diagnostico' => $data['diagnostico'] ?? $ot->diagnostico,
                    'accion' => $data['accion'] ?? $ot->accion,
                    'sugerencia' => $data['sugerencia'] ?? $ot->sugerencia,
                    'tiempo_completado' => now()
                ]);
                $ot->save();


                if (!empty($data['solicitud_ot_id'])) {
                    $estadoAprobado = Estado::where('nombre', 'Completado')->first();
                    if (!$estadoAprobado) {
                        throw new \Exception('No se encontró el estado "Aprobado" en la base de datos.');
                    }

                    $ot->solicitudOt()->update(['estado_id' => $estadoAprobado->id]);
                }

                return true;
            } catch (\Throwable $e) {
                Log::error('Error al actualizar detalles de OT', [
                    'ot_id' => $ot->id,
                    'data' => $data,
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }
}
