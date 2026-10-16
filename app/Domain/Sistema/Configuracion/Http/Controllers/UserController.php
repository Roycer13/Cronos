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

class UserController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }
    public function index(Request $request)
    {
        // Extraemos todos los filtros posibles del request
        $filters = $request->only(['search', 'rol_id', 'ubicacion_id', 'area_id', 'estado', 'turno', 'per_page', 'name', 'apellido',]);

        //llamamos los datos de usuarios
        $users = User::with(['roles', 'ubicacion', 'area'])
            ->filter($filters) // Aplicamos el scope de filtros
            ->orderBy($request->get('sort', 'created_at'), $request->get('direction', 'desc'))
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        //usamos inertia para llamar a la vista
        return Inertia::render('sistema/usuarios/index', [
            'users' => $users,
            'filters' => $filters,
            'roles' => Role::all(),
            'ubicaciones' => Ubicacion::all(),
            'areas' => Area::all(),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],

        ]);
    }

    public function create()
    {
        return Inertia::render('sistema/usuarios/crear', [
            'roles' => Role::all(), // ahora esto usa Spatie
            'ubicaciones' => Ubicacion::all(),
            'areas' => Area::all(),
        ]);
    }

    public function store(UserRequest $request)
    {
        //usamos el servicio de crear
        $this->userService->createUser($request->all());
        return redirect()->route('usuarios')->with('success', 'Usuario creado exitosamente.');
    }

    public function edit(User $user)
    {
        $user->load('roles');

        return Inertia::render('sistema/usuarios/editar', [
            'user' => $user,
            'roles' => Role::all(),
            'ubicaciones' => Ubicacion::all(),
            'areas' => Area::all(),
        ]);
    }

    public function update(UserRequest $request, User $user)
    {
        try {
            //usamos el servicio de editar
            $this->userService->updateUser($user, $request->all(), auth()->id());



            return redirect()->route('usuarios')
                ->with('success', 'Usuario actualizado correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    public function destroy(User $user)
    {
        try {
            //usamos el servicio de eliminar
            $this->userService->deleteUser($user, auth()->id());
            return redirect()->route('usuarios')
                ->with('success', 'Usuario eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('usuarios')
                ->with('error', $e->getMessage());
        }
    }
}
