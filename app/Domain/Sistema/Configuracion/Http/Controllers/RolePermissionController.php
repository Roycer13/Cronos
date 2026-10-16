<?php

namespace App\Domain\Sistema\Configuracion\Http\Controllers;

use App\Domain\Sistema\Configuracion\Models\Area;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;

use App\Http\Controllers\Controller;
use App\Domain\Sistema\Configuracion\Http\Requests\UserRequest;
use App\Domain\Sistema\Configuracion\Models\User;

use App\Domain\Sistema\Configuracion\Services\UserService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;


use Spatie\Permission\Models\Permission;


class RolePermissionController extends Controller
{
    public function index()
    {
        return Inertia::render('sistema/permisos/rolesPermissions', [
            'roles' => Role::with('permissions')->get(),
            'permissions' => Permission::all(),
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    public function removePermissionFromRole(Role $role, Permission $permission)
    {
        $role->revokePermissionTo($permission);
        return response()->json(['message' => 'Permiso removido']);
    }

    public function createRole(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name'
        ]);

        $role = Role::create(['name' => $request->name]);

        return response()->json($role);
    }

    public function createPermission(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:permissions,name'
        ]);

        $permission = Permission::create(['name' => $request->name]);

        return response()->json($permission);
    }

    public function assignPermissionToRole(Request $request, Role $role)
    {
        $request->validate([
            'permission' => 'required|string|exists:permissions,name'
        ]);

        $role->givePermissionTo($request->permission);

        return response()->json($role->permissions);
    }

    public function assignRoleToUser(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|string|exists:roles,name'
        ]);

        $user->assignRole($request->role);

        return response()->json($user->roles);
    }



    public function syncPermissions(Request $request, Role $role)
{
    $request->validate([
        'permissions' => 'array',
        'permissions.*' => 'exists:permissions,id',
    ]);

    $role->syncPermissions($request->permissions);

    return response()->json(['message' => 'Permisos actualizados correctamente']);
}
}
