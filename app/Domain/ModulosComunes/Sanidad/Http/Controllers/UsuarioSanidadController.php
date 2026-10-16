<?php

namespace App\Domain\ModulosComunes\Sanidad\Http\Controllers;

use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\Area;
use App\Domain\ModulosComunes\Sanidad\Models\Policlinico;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class UsuarioSanidadController extends Controller
{
    public function index()
    {
        $usuarios = User::select('id', 'name', 'apellido', 'codigo', 'email', 'estado', 'telefono')
            ->orderBy('name')
            ->paginate(10);

        return Inertia::render('sanidad/usuarios/index', [
            'usuarios' => $usuarios
        ]);
    }

    public function create()
    {
        $ubicaciones = Ubicacion::select('id', 'nombre')->orderBy('nombre')->get();
        $areas = Area::select('id', 'nombre')->orderBy('nombre')->get();
        $policlinicos = Policlinico::select('id', 'nombre')->orderBy('nombre')->get();

        return Inertia::render('sanidad/usuarios/create', [
            'ubicaciones' => $ubicaciones,
            'areas' => $areas,
            'policlinicos' => $policlinicos,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'codigo' => 'required|string|unique:users,codigo',
            'email' => 'nullable|email|unique:users,email',
            'fecha_nacimiento' => 'nullable|date',
            'sexo' => 'nullable|in:M,F',
            'estado_civil' => 'nullable|string|max:20',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:255',
            'ubicacion_id' => 'nullable|exists:ubicaciones,id',
            'area_id' => 'nullable|exists:areas,id',
            'cargo' => 'nullable|string|max:255',
            'turno' => 'nullable|string|max:50',
            'profesion' => 'nullable|string|max:255',
            'seguro_social' => 'nullable|string|max:50',
            'policlinico_id' => 'nullable|exists:san_policlinicos,id',
            'fecha_ingreso' => 'nullable|date',
        ]);

        // Crear usuario con valores por defecto
        $validated['password'] = bcrypt('password123'); // Se puede cambiar después
        $validated['estado'] = true;

        User::create($validated);

        return redirect()->route('sanidad.usuarios.index')
            ->with('success', 'Usuario creado correctamente.');
    }

    public function show(User $usuario)
{
    // Cargar relaciones con sus subrelaciones
    $usuario->load([
        'atencionesComoPaciente.medicoUser',
        'atencionesComoPaciente.policlinico',
        'atencionesComoPaciente.estado',
        'examenesOcupacionalesComoEmpleado.medico',
        'examenesOcupacionalesComoEmpleado.policlinico',
    ]);

    // Construir array manualmente para asegurar que las propiedades existan
    return Inertia::render('sanidad/usuarios/show', [
        'usuario' => [
            'id' => $usuario->id,
            'name' => $usuario->name,
            'apellido' => $usuario->apellido,
            'codigo' => $usuario->codigo,
            'email' => $usuario->email,
            'telefono' => $usuario->telefono,
            'atencionesComoPaciente' => $usuario->atencionesComoPaciente->toArray(),
            'examenesOcupacionalesComoEmpleado' => $usuario->examenesOcupacionalesComoEmpleado->toArray(),
        ]
    ]);
}

    public function edit(User $usuario)
    {
        return Inertia::render('sanidad/usuarios/edit', [
            'usuario' => $usuario
        ]);
    }

    public function update(Request $request, User $usuario)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'codigo' => ['required', 'string', Rule::unique('users')->ignore($usuario->id)],
            'email' => ['nullable', 'email', Rule::unique('users')->ignore($usuario->id)],
            'fecha_nacimiento' => 'nullable|date',
            'sexo' => 'nullable|in:M,F',
            'estado_civil' => 'nullable|string|max:20',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:255',
            'estado' => 'boolean',
        ]);

        $usuario->update($validated);

        return redirect()->route('sanidad.usuarios.index')
            ->with('success', 'Usuario actualizado correctamente.');
    }
}