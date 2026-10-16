<?php

namespace App\Domain\Mantenimiento\Services;

// use Spatie\Permission\Models\Role;

use App\Domain\Mantenimiento\Models\Repuesto;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RepuestoService
{
    /**
     * Crea un nuevo usuario con validaciones y control transaccional.
     */

    public function createRepuesto(array $data): Repuesto
    {
        return DB::transaction(function () use ($data) {
            try {

                $repuesto = Repuesto::create($data);



                return $repuesto;
            } catch (\Throwable $e) {
                Log::error('Error al crear repuesto: ' . $e->getMessage(), ['data' => $data]);
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
    public function deleteRepuesto(Repuesto $repuesto): bool
    {



        return DB::transaction(function () use ($repuesto) {
            try {
                return (bool) $repuesto->delete(); // 👈 convertimos a bool
            } catch (\Throwable $e) {

                Log::error('Error al eliminar usuario: ' . $e->getMessage(), ['repuesto_id' => $repuesto->id]);
                throw $e;
            }
        }) ?? false; // 👈 fallback en caso de que transaction devuelva null
    }




    public function updateRepuesto(Repuesto $repuesto, array $data, ): bool
    {
        return DB::transaction(function () use ($repuesto, $data) {
            try {




                // Actualizamos el resto de campos del usuario
                $repuesto->fill($data);
                $repuesto->save();



                return true;
            } catch (\Throwable $e) {
                Log::error('Error al actualizar repuesto: ' . $e->getMessage(), [
                    'repuesto' => $repuesto->id,
                    'data' => $data,
                ]);
                throw new \Exception('No se pudo actualizar el repuesto.');
            }
        });
    }
}
