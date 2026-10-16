<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\Hisopado;
use App\Domain\PlantaLacteos\Models\HisopadoCorreccion;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Validators\ValidationException;

class HisopadoController extends Controller
{
   public function index(Request $request)
{
    $filters = $request->only([
        'search',
        'fecha_desde',
        'fecha_hasta',
        'estado',
        'usuario',
        'usuario_siembra',
        'usuario_lectura',
        'coliformes_min',
        'coliformes_max',
        'per_page',
    ]);

    $hisopados = Hisopado::with([
        'user',
        'estado',
        'usuarioSiembra',
        'usuarioLectura',
        'hisopadoCorrecciones.user'
    ])
        ->filter($filters)
        ->orderBy(
            $request->get('sort', 'tiempo'),
            $request->get('direction', 'desc')
        )
        ->paginate($request->get('per_page', 10))
        ->withQueryString();

    // 👇 AGREGAR ESTO: Transformar los hisopados para agregar el usuario de la corrección
    $hisopados->getCollection()->transform(function ($hisopado) {
        // Obtener la última corrección
        $ultimaCorreccion = $hisopado->hisopadoCorrecciones
            ->sortByDesc('created_at')
            ->sortByDesc('id')
            ->first();

        // Agregar el usuario de la corrección como un atributo directo
        $hisopado->usuario_correccion = $ultimaCorreccion ? $ultimaCorreccion->user : null;

        return $hisopado;
    });

    // Resto del código sin cambios...
    $estadoNoHisopado = Estado::where('nombre', 'No Hisopado')->first();
    $estadoPorCapacitar = Estado::where('nombre', 'Por Capacitar')->first();
    $estadoCapacitado = Estado::where('nombre', 'Capacitado')->first();

    $usuariosPorCapacitar = [];

    if ($estadoPorCapacitar || $estadoCapacitado) {
        $estadosIds = [];
        if ($estadoPorCapacitar) $estadosIds[] = $estadoPorCapacitar->id;
        if ($estadoCapacitado) $estadosIds[] = $estadoCapacitado->id;

        $usuariosPorCapacitar = User::select('users.id', 'users.name', 'users.apellido', 'users.codigo', 'users.estado_hisopado_id')
            ->with(['estadoHisopado', 'hisopados.hisopadoCorrecciones'])
            ->whereIn('users.estado_hisopado_id', $estadosIds)
            ->where('users.estado', 'Activo')
            ->whereHas('hisopados.hisopadoCorrecciones')
            ->orderBy('users.name')
            ->get()
            ->map(function ($user) {
                $hisopadoConCorreccion = $user->hisopados
                    ->filter(function ($hisopado) {
                        return $hisopado->hisopadoCorrecciones->count() > 0;
                    })
                    ->sortByDesc('tiempo')
                    ->first();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'apellido' => $user->apellido,
                    'codigo' => $user->codigo,
                    'estado_hisopado' => $user->estadoHisopado,
                    'hisopado_id' => $hisopadoConCorreccion ? $hisopadoConCorreccion->id : null,
                    'correccion_id' => $hisopadoConCorreccion && $hisopadoConCorreccion->hisopadoCorrecciones->count() > 0
                        ? $hisopadoConCorreccion->hisopadoCorrecciones->first()->id
                        : null,
                ];
            });
    }

    return Inertia::render('planta_lacteos/hisopados/index', [
        'hisopados' => $hisopados,
        'estados' => Estado::select('nombre')->orderBy('nombre')->get(),
        'usuarios' => User::select('id', 'name', 'apellido', 'codigo', 'estado_hisopado_id')
            ->with('estadoHisopado')
            ->where('estado', 'Activo')
            ->orderBy('name')
            ->get(),
        'usuariosPorCapacitar' => $usuariosPorCapacitar,
        'usuariosSiembra' => User::select('name','apellido')->orderBy('name')->get(),
        'usuariosLectura' => User::select('name','apellido')->orderBy('name')->get(),
        'filters' => $filters,
        'flash' => [
            'success' => session('success'),
            'error' => session('error'),
        ],
    ]);
}
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'tiempo' => ['required', 'date'],
        ]);

        // Obtener el estado "Pendiente" para el hisopado
        $estadoPendiente = Estado::where('nombre', 'Pendiente')->first();


        // Obtener el estado "Sembrado" para el usuario
        $estadoSembrado = Estado::where('nombre', 'Sembrado')->first();



        // Crear el hisopado
        Hisopado::create([
            'tiempo' => now(),
            'user_id' => $validated['user_id'],
            'estado_id' => $estadoPendiente->id,
            'usuario_siembra_id' => auth()->id(),
            'tiempo_siembra' => now(),
            'usuario_lectura_id' => null,
        ]);

        // Actualizar el estado del usuario a "Sembrado"
        $user = User::find($validated['user_id']);
        if ($user) {
            $user->update([
                'estado_hisopado_id' => $estadoSembrado->id
            ]);
        }

        return redirect()
            ->route('hisopados.index')
            ->with('success', 'Hisopado registrado y usuario marcado como Sembrado.');
    }
    public function show(Hisopado $hisopado)
    {
        $hisopado->load([
            'user',
            'estado',
            'usuarioSiembra',
            'usuarioLectura',
            'hisopadoCorrecciones.user'
        ]);

        return Inertia::render('planta_lacteos/hisopados/ver', [
            'hisopado' => $hisopado,
        ]);
    }

    public function edit(Hisopado $hisopado)
    {
        return Inertia::render('planta_lacteos/hisopados/editar', [
            'hisopado' => $hisopado->load(['estado', 'user']),

            'estados' => Estado::select('id', 'nombre')
                ->orderBy('nombre')
                ->get(),

            'usuarios' => User::select('id', 'name')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function update(Request $request, Hisopado $hisopado)
    {
        $validated = $request->validate([
            'tiempo' => ['required', 'date'],
            'observacion_siembra' => ['nullable', 'string', 'max:1000'],
            'observacion_lectura' => ['nullable', 'string', 'max:1000'],
            'estado_id' => ['required', 'exists:estados,id'],
            'coliformes' => ['nullable', 'integer', 'min:0'],
        ]);

        $hisopado->update($validated);

        return redirect()
            ->route('hisopados.index')
            ->with('success', 'Hisopado actualizado correctamente.');
    }

    public function destroy(Hisopado $hisopado)
    {
        $hisopado->delete();

        return redirect()
            ->route('hisopados.index')
            ->with('success', 'Hisopado eliminado correctamente.');
    }



   public function guardarLectura(Request $request, Hisopado $hisopado)
{
    DB::beginTransaction();

    try {
        $data = $request->validate([
            'coliformes' => ['required', 'integer', 'min:0'],
            'observacion_lectura' => ['nullable', 'string', 'max:1000'],
        ]);

        $coliformes = (int) $data['coliformes'];
        $usuarioId = auth()->id();
        $ahora = now();

        // Buscar estados requeridos
        $estadoHisopado = Estado::where('nombre', 'Hisopado')->first();
        $estadoPorCapacitar = Estado::where('nombre', 'Por Capacitar')->first();

        if (!$estadoHisopado || !$estadoPorCapacitar) {
            throw new \Exception('Estados requeridos no encontrados. Verifica que existan "Hisopado" y "Por Capacitar"');
        }

        // Determinar estado según coliformes
        $esAltoColiformes = $coliformes > 100;
        $estadoUsuario = $esAltoColiformes ? $estadoPorCapacitar : $estadoHisopado;

         $estadoCompletado = Estado::where('nombre', 'Completado')->first();


        // Actualizar el hisopado
        $hisopado->update([
            'coliformes' => $coliformes,
            'observacion_lectura' => $data['observacion_lectura'],
            'tiempo_lectura' => $ahora,
            'usuario_lectura_id' => $usuarioId,
            'estado_id' => $estadoCompletado->id,
        ]);

        // Actualizar el estado del usuario
        $hisopado->user()->update([
            'estado_hisopado_id' => $estadoUsuario->id
        ]);

        // Manejar corrección: crear si coliformes altos, eliminar si no
        if ($esAltoColiformes) {
            // Crear corrección solo si no existe
            HisopadoCorreccion::firstOrCreate(
                ['hisopado_id' => $hisopado->id],
                [
                    'tiempo' => $ahora,

                    'hisopado_id' => $hisopado->id
                ]
            );
        } else {
            // Eliminar corrección si existe
            HisopadoCorreccion::where('hisopado_id', $hisopado->id)->delete();
        }

        DB::commit();

        $mensaje = 'Lectura registrada correctamente. ';
        $mensaje .= $esAltoColiformes
            ? 'Usuario marcado como "Por Capacitar".'
            : 'Usuario marcado como "Hisopado".';

        return back()->with('success', $mensaje);

    } catch (ValidationException $e) {
        throw $e;

    } catch (\Exception $e) {
        DB::rollBack();



        return back()->with('error', 'Error al registrar la lectura: ' . $e->getMessage());
    }
}

    public function guardarSiembra(Request $request, Hisopado $hisopado)
    {
        $validated = $request->validate([
            'observacion_siembra' => ['nullable', 'string', 'max:1000'],
        ]);

        $hisopado->update([
            'observacion_siembra' => $validated['observacion_siembra'],
        ]);

        return back()->with('success', 'Observación de siembra guardada correctamente.');
    }

    public function lecturaCero(Hisopado $hisopado)
    {


         $estadoCompletado = Estado::where('nombre', 'Completado')->first();
        $hisopado->update([
            'coliformes' => 0,
            'observacion_lectura' => null,
            'tiempo_lectura' => now(),
            'usuario_lectura_id' => auth()->id(),
            'estado_id' => $estadoCompletado->id,
        ]);



            $estadoUsuario = Estado::where('nombre', 'Hisopado')->first();
         $hisopado->user()->update([
            'estado_hisopado_id' => $estadoUsuario->id
        ]);

         HisopadoCorreccion::where('hisopado_id', $hisopado->id)->delete();
        return back()->with('success', 'Lectura registrada en cero.');
    }



    public function resetEstado(Request $request)
    {
        try {
            // Obtener el ID del estado "No Hisopado"
            $estadoNoHisopado = Estado::where('nombre', 'No Hisopado')->first();




            // Actualizar todos los usuarios al estado "No Hisopado"
            DB::transaction(function () use ($estadoNoHisopado) {
                User::query()
                    ->where('estado_hisopado_id', '!=', $estadoNoHisopado->id)
                    ->orWhereNull('estado_hisopado_id')
                    ->update(['estado_hisopado_id' => $estadoNoHisopado->id]);
            });

            return redirect()
                ->route('hisopados.index')
                ->with('success', 'Estado de hisopado reseteado correctamente para todos los usuarios.');
        } catch (\Exception $e) {
            dd($e->getMessage());
            return redirect()
                ->route('hisopados.index')
                ->with('error', 'Error al resetear el estado de hisopado: ' . $e->getMessage());
        }
    }



    // Agrega estos métodos al controlador

/**
 * Marcar usuario como capacitado
 */
public function marcarComoCapacitado(Request $request)
{
    DB::beginTransaction();

    try {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'correccion_id' => ['required', 'exists:PLL_hisopados_correcciones,id'],
        ]);

        // Buscar estado "Capacitado"
        $estadoCapacitado = Estado::where('nombre', 'Capacitado')->first();



        // Buscar la corrección
        $correccion = HisopadoCorreccion::find($validated['correccion_id']);

        if (!$correccion) {
            throw new \Exception('Corrección no encontrada');
        }

        // Actualizar la corrección con fecha y usuario
        $correccion->update([
            'tiempo' => now(),
            'user_id' => auth()->id(),
        ]);

        // Actualizar el estado del usuario a "Capacitado"
        User::where('id', $validated['user_id'])->update([
            'estado_hisopado_id' => $estadoCapacitado->id
        ]);

        DB::commit();

        return redirect()
            ->route('hisopados.index')
            ->with('success', 'Usuario marcado como capacitado correctamente.');

    } catch (\Exception $e) {
        DB::rollBack();


        return redirect()
            ->route('hisopados.index')
            ->with('error', 'Error al marcar como capacitado: ' . $e->getMessage());
    }
}

/**
 * Crear nuevo hisopado para usuario capacitado
 */
public function crearHisopadoCapacitado(Request $request)
{
    DB::beginTransaction();

    try {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        // Verificar que el usuario esté en estado "Capacitado"
        $estadoCapacitado = Estado::where('nombre', 'Capacitado')->first();
        $user = User::find($validated['user_id']);

        if (!$user || $user->estado_hisopado_id != $estadoCapacitado->id) {
            throw new \Exception('El usuario no está en estado "Capacitado"');
        }


        // Obtener el estado "Pendiente" para el hisopado
        $estadoPendiente = Estado::where('nombre', 'Pendiente')->first();

        if (!$estadoPendiente) {
            throw new \Exception('Estado "Pendiente" no encontrado');
        }

        // Obtener el estado "Sembrado" para el usuario
        $estadoSembrado = Estado::where('nombre', 'Sembrado')->first();

        if (!$estadoSembrado) {
            throw new \Exception('Estado "Sembrado" no encontrado');
        }

        // Crear el hisopado
        Hisopado::create([
            'tiempo' => now(),
            'user_id' => $validated['user_id'],
            'estado_id' => $estadoPendiente->id,
            'usuario_siembra_id' => auth()->id(),
            'tiempo_siembra' => now(),
            'usuario_lectura_id' => null,
        ]);

        // Actualizar el estado del usuario a "Sembrado"
        $user->update([
            'estado_hisopado_id' => $estadoSembrado->id
        ]);

        DB::commit();

        return redirect()
            ->route('hisopados.index')
            ->with('success', 'Nuevo hisopado creado para usuario capacitado.');

    } catch (\Exception $e) {
        DB::rollBack();


        return redirect()
            ->route('hisopados.index')
            ->with('error', 'Error al crear hisopado: ' . $e->getMessage());
    }
}


public function pdf(Request $request)
{
    try {
        $user = auth()->user();
        $isAdmin = $user->hasRole('admin');
        $ubicacionId = $user->ubicacion_id;

        $query = Hisopado::with([
            'user',
            'usuarioSiembra',
            'usuarioLectura',
            'estado',
            'hisopadoCorrecciones.user',
        ]);

        // Filtros de fecha
        if ($request->filled('fecha_desde')) {
            $fechaDesde = Carbon::parse($request->fecha_desde)->startOfDay();
            $query->where('tiempo', '>=', $fechaDesde);
        }
        if ($request->filled('fecha_hasta')) {
            $fechaHasta = Carbon::parse($request->fecha_hasta)->endOfDay();
            $query->where('tiempo', '<=', $fechaHasta);
        }

        // Solo hisopados con estado "Completado" (o el que corresponda)
        $estadoCompletado = Estado::where('nombre', 'Completado')->first();
        if ($estadoCompletado) {
            $query->where('estado_id', $estadoCompletado->id);
        }

        // Filtrar por ubicación si no es admin (asumiendo que Hisopado tiene relación con User -> ubicacion_id)
        if (!$isAdmin && $ubicacionId) {
            $query->whereHas('user', function($q) use ($ubicacionId) {
                $q->where('ubicacion_id', $ubicacionId);
            });
        }

        $hisopados = $query->orderBy('tiempo')->get();

        // Recolectar únicamente usuarios de siembra y lectura.
        $usuariosMap = [];
        foreach ($hisopados as $h) {
            if ($h->usuarioSiembra && $h->usuarioSiembra->codigo) {
                $codigo = $h->usuarioSiembra->codigo;
                if (!isset($usuariosMap[$codigo])) {
                    $usuariosMap[$codigo] = [
                        'codigo' => $codigo,
                        'nombre' => trim(($h->usuarioSiembra->name ?? '') . ' ' . ($h->usuarioSiembra->apellido ?? '')),
                    ];
                }
            }
            if ($h->usuarioLectura && $h->usuarioLectura->codigo) {
                $codigo = $h->usuarioLectura->codigo;
                if (!isset($usuariosMap[$codigo])) {
                    $usuariosMap[$codigo] = [
                        'codigo' => $codigo,
                        'nombre' => trim(($h->usuarioLectura->name ?? '') . ' ' . ($h->usuarioLectura->apellido ?? '')),
                    ];
                }
            }
        }

        $usuariosInvolucrados = array_values($usuariosMap);

        return response()->json([
            'hisopados' => $hisopados,
            'usuarios_involucrados' => $usuariosInvolucrados,
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}
