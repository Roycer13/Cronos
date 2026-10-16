<?php

namespace App\Domain\Mantenimiento\Services;

// use Spatie\Permission\Models\Role;

use App\Domain\Mantenimiento\Models\Repuesto;
use App\Domain\Mantenimiento\Models\SolicitudOt;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\MaquinaEquipo;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SolicitudOtService
{
    /**
     * Crea un nuevo usuario con validaciones y control transaccional.
     */

    public function createSolicitudOt(array $data): SolicitudOt
    {
        return DB::transaction(function () use ($data) {
            try {

                // 🔹 Obtener el estado "Asignado"
                $estadoAsignado = Estado::where('nombre', 'Pendiente')->first();

                if (!$estadoAsignado) {
                    throw new \Exception('No se encontró el estado "Pendiente" en la base de datos.');
                }

                if ($data['sector_id'] == null) {

                    //si no tiene sector buscamos el sector desde la maquin
                    $maquina = MaquinaEquipo::find($data['maquina_equipo_id']);
                    if ($maquina && $maquina->sector_id) {
                        $data['sector_id'] = $maquina->sector_id;
                    }
                }
                // 1️⃣ Crear la OT con el estado encontrado
                $data['estado_id'] = $estadoAsignado->id;

                $data['tiempo'] = now();
                $data['created_by'] = auth()->id();
                $solicitudOt = SolicitudOt::create($data);



                return $solicitudOt;
            } catch (\Throwable $e) {
                Log::error('Error al crear solicitudOt: ' . $e->getMessage(), ['data' => $data]);
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
}
