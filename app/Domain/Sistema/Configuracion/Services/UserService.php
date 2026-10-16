<?php

namespace App\Domain\Sistema\Configuracion\Services;

use Spatie\Permission\Models\Role;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserService
{
    /**
     * Crea un nuevo usuario con validaciones y control transaccional.
     */

    public function createUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            try {
                $data['password'] = Hash::make($data['codigo']);

                $user = User::create($data);

                // Asignar rol usando el id que vino del front
                if (!empty($data['rol_id'])) {
                    $role = Role::findOrFail($data['rol_id']);
                    $user->assignRole($role->name); // Spatie necesita name
                }

                return $user;
            } catch (\Throwable $e) {
                Log::error('Error al crear usuario: ' . $e->getMessage(), ['data' => $data]);
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
    public function deleteUser(User $user, ?int $authUserId = null): bool
    {

        //no permitir q se elimine el usuario propio
        if ($authUserId && $user->id === $authUserId) {
            throw new \Exception('No puedes eliminar tu propio usuario.');
        }

        return DB::transaction(function () use ($user) {
            try {
                return (bool) $user->delete(); // 👈 convertimos a bool
            } catch (\Throwable $e) {

                Log::error('Error al eliminar usuario: ' . $e->getMessage(), ['user_id' => $user->id]);
                throw $e;
            }
        }) ?? false; // 👈 fallback en caso de que transaction devuelva null
    }




    public function updateUser(User $user, array $data, ?int $authUserId = null): bool
    {
        return DB::transaction(function () use ($user, $data) {
            try {
                // Si no hay password, lo eliminamos para no sobreescribir
                if (!isset($data['password']) || empty($data['password'])) {
                    unset($data['password'], $data['password_confirmation']);
                } else {
                    $data['password'] = Hash::make($data['password']);
                }

                // ⚡ Extraemos el rol y lo quitamos del array de fill
                $rol = $data['rol_id'] ?? null;
                unset($data['rol_id']);

                // Actualizamos el resto de campos del usuario
                $user->fill($data);
                $user->save();

                // ⚡ Asignamos rol usando Spatie
                if ($rol) {
                    $user->syncRoles($rol); // nombre del rol
                }

                return true;
            } catch (\Throwable $e) {
                Log::error('Error al actualizar usuario: ' . $e->getMessage(), [
                    'user_id' => $user->id,
                    'data' => $data,
                ]);
                throw new \Exception('No se pudo actualizar el usuario.');
            }
        });
    }
}
