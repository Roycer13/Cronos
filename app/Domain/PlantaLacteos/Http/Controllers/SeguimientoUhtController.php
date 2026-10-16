<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use Carbon\Carbon;
use App\Domain\ModulosComunes\Orp\Models\Orp;
use App\Domain\ModulosComunes\Orp\Models\OrpEstado;
use App\Domain\ModulosComunes\Productos\Models\ProductoTerminado;
use App\Http\Controllers\Controller;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\PlantaLacteos\Models\Origen;
use App\Domain\PlantaLacteos\Models\SeguimientoUht;
use App\Domain\PlantaLacteos\Models\DetalleSeguimientoUht;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class SeguimientoUhtController extends Controller
{
    public function index(Request $request)
    {

        $filters = $request->only([
            'search',
            'orp',
            'producto_terminado',
            'estado',
            'origen',
            'usuario',
            'usuario_siembra',
            'usuario_dia_2',
            'usuario_dia_5',
            'fecha_vencimiento_desde',   // ← nuevo
            'fecha_vencimiento_hasta',   // ← nuevo
            'per_page',
        ]);

        $seguimientos = SeguimientoUht::with([
            'origen',
            'user',
            'estado',
            'usuarioSiembra',
            'usuarioDia2',
            'usuarioDia5',
            'detalles.orp.productoTerminado', // Cargar ORPs a través de detalles
        ])
            ->filter($filters)
            ->orderBy(
                $request->get('sort', 'created_at'),
                $request->get('direction', 'desc')
            )
            ->paginate($request->get('per_page', 10))
            ->withQueryString();
        $productosTerminados = ProductoTerminado::select('id', 'nombre_sap')
            ->whereHas('linea', function ($query) {
                $query->where('nombre', 'UHT');
            })
            ->whereHas('ubicacion', function ($query) {
                $query->whereIn('nombre', ['Lácteos', 'Soya']);
            })
            ->orderBy('nombre_sap')
            ->get();




        return Inertia::render('planta_lacteos/seguimientos/uht/index', [
            'seguimientos' => $seguimientos,

            // Combos / filtros
            'orps' => Orp::with([
                'productoTerminado' => function ($query) {
                    $query->select('id', 'nombre_sap', 'codigo_sap');
                }
            ])
                ->whereHas('productoTerminado.linea', function ($query) {
                    $query->where('nombre', 'UHT');
                })
                ->orderBy('codigo')
                ->get(),
            'estados' => Estado::select('nombre')->orderBy('nombre')->get(),
            'productosTerminados' => $productosTerminados,

            'origenes' => Origen::select('id', 'alias')
                ->whereIn('descripcion', [
                    'ENVASADORA UHT',
                    'ENVASADORA CD',
                    'ENVASADORA JK',
                ])
                ->orderBy('alias')
                ->get(),
            'usuarios' => User::whereHas('ubicacion', function ($query) {
                $query->where('nombre', 'Lácteos');
            })
                ->orderBy('name')
                ->get(),


            'filters' => $filters,

            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }


    public function create()
    {
        return Inertia::render('planta_lacteos/seguimientos/uht/crear', [
            'orps' => Orp::with([
                'productoTerminado' => function ($query) {
                    $query->select('id', 'nombre_sap', 'codigo_sap');
                }
            ])
                ->whereHas('productoTerminado.linea', function ($query) {
                    $query->where('nombre', 'UHT');
                })
                ->select('id', 'codigo', 'producto_terminado_id', 'fecha_vencimiento1') // Asegúrate de incluir la FK
                ->orderBy('codigo')
                ->get()
                ->map(function ($orp) {
                    return [
                        'id' => $orp->id,
                        'codigo' => $orp->codigo,
                        'fecha_vencimiento' => $orp->fecha_vencimiento1 ? $orp->fecha_vencimiento1->format('Y-m-d') : null,
                        'producto_terminado' => $orp->productoTerminado ? [
                            'id' => $orp->productoTerminado->id,
                            'nombre_sap' => $orp->productoTerminado->nombre_sap,
                            'codigo_sap' => $orp->productoTerminado->codigo_sap,
                        ] : null
                    ];
                }),


            'origenes' => Origen::select('id', 'alias')
                ->whereIn('descripcion', [
                    'ENVASADORA UHT',
                    'ENVASADORA CD',
                    'ENVASADORA JK',
                ])
                ->orderBy('alias')
                ->get(),
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'lote' => ['required', 'string', 'max:255'],
            'seguimientos' => ['required', 'array', 'min:1'], // Cambiamos de 'numeros' a 'seguimientos'
            'seguimientos.*.numero' => ['required', 'string', 'max:50'],
            'seguimientos.*.origen_id' => ['required', 'exists:PLL_origenes,id'],
            'orp_ids' => ['required', 'array', 'min:1'],
            'orp_ids.*' => ['required', 'exists:orps,id'],
            'observacion_siembra' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::beginTransaction();
        try {
            $now = Carbon::now();
            if ($now->hour >= 22) {
                $tiempoSiembra = $now->addDay()->setTime(8, 0, 0);
            } else {
                $tiempoSiembra = $now;
            }

            $registrosCreados = 0;
            $errores = [];
            $procesados = []; // Para evitar duplicados en la misma operación

            // Crear un seguimiento para cada combinación número/origen
            foreach ($validated['seguimientos'] as $seguimientoData) {
                $numero = $seguimientoData['numero'];
                $origenId = $seguimientoData['origen_id'];

                // Clave única para esta combinación
                $clave = "{$origenId}-{$numero}";

                // Verificar si ya procesamos esta combinación en esta operación
                if (in_array($clave, $procesados)) {
                    $origen = Origen::find($origenId);
                    $errores[] = "La combinación número {$numero} - origen {$origen->alias} está duplicada en esta operación.";
                    continue;
                }

                $procesados[] = $clave;

                // Verificar si ya existe un seguimiento con este número, mismo origen y alguna de las ORPs seleccionadas
                $existingOrpIds = DetalleSeguimientoUht::whereHas('seguimientoUht', function ($q) use ($origenId, $numero) {
                    $q->where('origen_id', $origenId)
                        ->where('numero', $numero);
                })
                    ->whereIn('orp_id', $validated['orp_ids'])
                    ->pluck('orp_id')
                    ->toArray();

                if (!empty($existingOrpIds)) {
                    $origen = Origen::find($origenId);
                    $orpsRepetidas = Orp::whereIn('id', $existingOrpIds)->pluck('codigo')->join(', ');
                    $errores[] = "El número {$numero} ya existe para el origen {$origen->alias} con la(s) ORP(s): {$orpsRepetidas}.";
                    continue;
                }

                // Crear el seguimiento principal
                $seguimiento = SeguimientoUht::create([
                    'origen_id' => $origenId,
                    'user_id' => auth()->id(),
                    'lote' => $validated['lote'],
                    'estado_id' => Estado::where('nombre', 'Pendiente')->value('id'),
                    'tiempo' => now(),
                    'aerovios' => 0,
                    'numero' => $numero,
                    'observacion_siembra' => $validated['observacion_siembra'] ?? null,
                    'tiempo_siembra' => $tiempoSiembra,
                    'usuario_siembra_id' => auth()->id(),
                ]);

                // Crear los detalles con las ORPs
                foreach ($validated['orp_ids'] as $orpId) {
                    DetalleSeguimientoUht::create([
                        'seguimiento_uht_id' => $seguimiento->id,
                        'orp_id' => $orpId,
                    ]);
                }

                $registrosCreados++;
            }

            DB::commit();

            $mensaje = $registrosCreados > 0
                ? "Se crearon {$registrosCreados} seguimiento(s) UHT correctamente."
                : "No se crearon seguimientos.";

            if (!empty($errores)) {
                if ($registrosCreados > 0) {
                    $mensaje .= " Se omitieron algunas combinaciones: " . implode(' ', array_slice($errores, 0, 3));
                } else {
                    $mensaje = "No se pudieron crear los seguimientos. Errores: " . implode(' ', array_slice($errores, 0, 3));
                }

                if (count($errores) > 3) {
                    $mensaje .= " y " . (count($errores) - 3) . " más...";
                }
            }

            return redirect()
                ->route('seguimiento-uht.index')
                ->with('success', $mensaje);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withInput()
                ->with('error', 'Error al registrar los seguimientos: ' . $e->getMessage());
        }
    }
    public function sembrar(SeguimientoUht $seguimientoUht)
    {

        $seguimientoUht->update([
            'mohos' => 0,
        ]);

        return back()->with('success', 'Siembra registrada correctamente.');
    }

    public function guardarMoho(Request $request, SeguimientoUht $seguimientoUht)
    {
        $data = $request->validate([
            'mohos' => ['required', 'numeric', 'min:0'],
            'observacion_lectura' => ['nullable', 'string', 'max:1000'],
        ]);

        $seguimientoUht->update([
            'mohos' => $data['mohos'],
            'observacion_lectura' => $data['observacion_lectura'],
            'usuario_dia_5_id' => auth()->id(),
            'tiempo_dia_5' => Carbon::now(),

            'estado_id'       => Estado::where('nombre', 'Completado')->value('id'),
        ]);

        return back()->with('success', 'Lectura de mohos registrada.');
    }

    public function mohoCero(SeguimientoUht $seguimientoUht)
    {
        $seguimientoUht->update([
            'mohos' => 0,
            'observacion_lectura' => null,
            'usuario_dia_5_id' => auth()->id(),
            'tiempo_dia_5' => Carbon::now(),

            'estado_id'       => Estado::where('nombre', 'Completado')->value('id'),
        ]);

        return back()->with('success', 'Moho registrado en cero.');
    }

    public function mohoNulo(SeguimientoUht $seguimientoUht)
    {
        $seguimientoUht->update([
            'mohos' => null,
            'observacion_lectura' => null,
            'usuario_dia_5_id' => null,
            'tiempo_dia_5' => null,
        ]);

        return back()->with('success', 'Moho reiniciado a nulo.');
    }

    public function actualizarLote(Request $request, SeguimientoUht $seguimientoUht)
    {
        $data = $request->validate([
            'lote' => ['nullable', 'string', 'max:255'],
        ]);

        $seguimientoUht->update([
            'lote' => $data['lote'],
        ]);

        return back()->with('success', 'Lote actualizado correctamente.');
    }

    public function guardarColiformes(Request $request, SeguimientoUht $seguimientoUht)
    {
        $data = $request->validate([
            'aerovios' => ['required', 'numeric', 'min:0'],
        ]);

        $seguimientoUht->update([
            'aerovios' => $data['aerovios'],
            'usuario_dia_2_id' => auth()->id(),
            'tiempo_dia_2' => Carbon::now(),

        ]);

        if (is_null($seguimientoUht->mohos)) {
            $updateData['estado_id'] = Estado::where('nombre', 'Completado')->value('id');
            $seguimientoUht->update($updateData);
        }


        return back()->with('success', 'Coliformes registrados correctamente.');
    }

    public function coliformesCero(SeguimientoUht $seguimientoUht)
    {
        $seguimientoUht->update([
            'aerovios' => 0,
            'usuario_dia_2_id' => auth()->id(),
            'tiempo_dia_2' => Carbon::now(),
        ]);

        if (is_null($seguimientoUht->mohos)) {
            $updateData['estado_id'] = Estado::where('nombre', 'Completado')->value('id');
            $seguimientoUht->update($updateData);
        }


        return back()->with('success', 'Coliformes registrados en cero.');
    }

    // Método para mostrar los detalles de un seguimiento
    public function show(SeguimientoUht $seguimientoUht)
    {
        $seguimientoUht->load([
            'origen',
            'user',
            'estado',
            'usuarioSiembra',
            'usuarioDia2',
            'usuarioDia5',
            'detalles.orp.productoTerminado',
        ]);

        return Inertia::render('planta_lacteos/seguimientos/uht/ver', [
            'seguimiento' => $seguimientoUht,
        ]);
    }








    // En SeguimientoUhtController.php
    public function autocompletarDia2()
    {
        // Calcular la fecha exacta de hace 2 días (todo el día)
        $fechaHaceDosDias = Carbon::now()->subDays(2);
        $inicioDelDia = $fechaHaceDosDias->copy()->startOfDay();
        $finDelDia = $fechaHaceDosDias->copy()->endOfDay();

        // Obtener seguimientos con fecha de siembra EXACTAMENTE hace 2 días (todo el día)
        // y sin usuario_dia_2
        $seguimientosPendientes = SeguimientoUht::whereBetween('tiempo_siembra', [$inicioDelDia, $finDelDia])
            ->whereNull('usuario_dia_2_id')
            ->get();

        // Si no hay pendientes, retornar mensaje
        if ($seguimientosPendientes->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No hay registros pendientes para autocompletar.',
                'count' => 0
            ]);
        }

        // Contador de registros actualizados
        $actualizados = 0;

        // Actualizar cada registro
        foreach ($seguimientosPendientes as $seguimiento) {
            $seguimiento->update([
                'usuario_dia_2_id' => auth()->id(),
                'tiempo_dia_2' => Carbon::now(),
                'aerovios' => 0, // Si quieres ponerlos en cero automáticamente
            ]);
            $actualizados++;
        }

        return response()->json([
            'success' => true,
            'message' => "Se autocompletaron {$actualizados} registros correctamente.",
            'count' => $actualizados
        ]);
    }

    public function contarPendientesDia2()
    {
        // Calcular la fecha exacta de hace 2 días (todo el día)
        $fechaHaceDosDias = Carbon::now()->subDays(2);
        $inicioDelDia = $fechaHaceDosDias->copy()->startOfDay();
        $finDelDia = $fechaHaceDosDias->copy()->endOfDay();

        $pendientes = SeguimientoUht::whereBetween('tiempo_siembra', [$inicioDelDia, $finDelDia])
            ->whereNull('usuario_dia_2_id')
            ->count();

        return response()->json([
            'count' => $pendientes
        ]);
    }



    // En SeguimientoUhtController.php

    // Método para autocompletar día 5
    public function autocompletarDia5()
    {
        // Calcular la fecha exacta de hace 5 días (todo el día)
        $fechaHaceCincoDias = Carbon::now()->subDays(5);
        $inicioDelDia = $fechaHaceCincoDias->copy()->startOfDay();
        $finDelDia = $fechaHaceCincoDias->copy()->endOfDay();

        // Obtener seguimientos con fecha de siembra EXACTAMENTE hace 5 días,
        // con mohos diferente de null (ya fueron sembrados) y sin usuario_dia_5
        $seguimientosPendientes = SeguimientoUht::whereBetween('tiempo_siembra', [$inicioDelDia, $finDelDia])
            ->whereNotNull('mohos') // Solo registros que ya tienen siembra (mohos no nulo)
            ->whereNull('usuario_dia_5_id')
            ->get();

        // Si no hay pendientes, retornar mensaje
        if ($seguimientosPendientes->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No hay registros pendientes para autocompletar (día 5).',
                'count' => 0
            ]);
        }

        // Contador de registros actualizados
        $actualizados = 0;

        // Actualizar cada registro
        foreach ($seguimientosPendientes as $seguimiento) {
            $seguimiento->update([
                'usuario_dia_5_id' => auth()->id(),
                'tiempo_dia_5' => Carbon::now(),
            ]);
            $actualizados++;
        }

        return response()->json([
            'success' => true,
            'message' => "Se autocompletaron {$actualizados} registros del día 5 correctamente.",
            'count' => $actualizados
        ]);
    }

    // Método para contar pendientes día 5
    public function contarPendientesDia5()
    {
        // Calcular la fecha exacta de hace 5 días (todo el día)
        $fechaHaceCincoDias = Carbon::now()->subDays(5);
        $inicioDelDia = $fechaHaceCincoDias->copy()->startOfDay();
        $finDelDia = $fechaHaceCincoDias->copy()->endOfDay();

        $pendientes = SeguimientoUht::whereBetween('tiempo_siembra', [$inicioDelDia, $finDelDia])
            ->whereNotNull('mohos') // Solo registros que ya tienen siembra
            ->whereNull('usuario_dia_5_id')
            ->count();

        return response()->json([
            'count' => $pendientes
        ]);
    }



    public function destroy(SeguimientoUht $seguimientoUht)
    {
        DB::beginTransaction();
        try {
            // Primero eliminar los detalles asociados
            DetalleSeguimientoUht::where('seguimiento_uht_id', $seguimientoUht->id)->delete();

            // Luego eliminar el seguimiento principal
            $seguimientoUht->delete();

            DB::commit();

            return redirect()
                ->route('seguimiento-uht.index')
                ->with('success', 'Seguimiento UHT eliminado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->with('error', 'Error al eliminar el seguimiento: ' . $e->getMessage());
        }
    }








    public function autocompletarDia2Feriado(Request $request)
    {
        $request->validate([
            'date' => 'required|date_format:Y-m-d'
        ]);

        $selectedDate = Carbon::parse($request->date);
        $targetDate = $selectedDate->copy()->subDays(2);
        $inicio = $targetDate->copy()->startOfDay();
        $fin = $targetDate->copy()->endOfDay();

        $seguimientosPendientes = SeguimientoUht::whereBetween('tiempo_siembra', [$inicio, $fin])
            ->whereNull('usuario_dia_2_id')
            ->get();

        if ($seguimientosPendientes->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No hay registros pendientes para autocompletar en la fecha calculada (2 días antes del feriado).',
                'count' => 0
            ]);
        }

        $actualizados = 0;
        foreach ($seguimientosPendientes as $seguimiento) {
            $seguimiento->update([
                'usuario_dia_2_id' => auth()->id(),
                'tiempo_dia_2' => Carbon::now(),
                'aerovios' => 0,
            ]);
            $actualizados++;
        }

        return response()->json([
            'success' => true,
            'message' => "Se autocompletaron {$actualizados} registros correctamente (día 2 del feriado).",
            'count' => $actualizados
        ]);
    }

    public function autocompletarDia5Feriado(Request $request)
    {
        $request->validate([
            'date' => 'required|date_format:Y-m-d'
        ]);

        $selectedDate = Carbon::parse($request->date);
        $targetDate = $selectedDate->copy()->subDays(5);
        $inicio = $targetDate->copy()->startOfDay();
        $fin = $targetDate->copy()->endOfDay();

        $seguimientosPendientes = SeguimientoUht::whereBetween('tiempo_siembra', [$inicio, $fin])
            ->whereNotNull('mohos')
            ->whereNull('usuario_dia_5_id')
            ->get();

        if ($seguimientosPendientes->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No hay registros pendientes para autocompletar en la fecha calculada (5 días antes del feriado).',
                'count' => 0
            ]);
        }

        $actualizados = 0;
        foreach ($seguimientosPendientes as $seguimiento) {
            $seguimiento->update([
                'usuario_dia_5_id' => auth()->id(),
                'tiempo_dia_5' => Carbon::now(),
            ]);
            $actualizados++;
        }

        return response()->json([
            'success' => true,
            'message' => "Se autocompletaron {$actualizados} registros correctamente (día 5 del feriado).",
            'count' => $actualizados
        ]);
    }



    public function pdf(Request $request)
    {
        try {
            $orpCodigo = $request->input('orp_codigo');
            if (!$orpCodigo) {
                return response()->json(['error' => 'Debe especificar un ORP'], 400);
            }

            $orp = Orp::with(['productoTerminado.destino'])->where('codigo', $orpCodigo)->first();
            if (!$orp) {
                return response()->json(['error' => 'ORP no encontrada'], 404);
            }

            $fechaProduccion = OrpEstado::where('orp_id', $orp->id)
                ->whereHas('estado', function ($q) {
                    $q->where('nombre', 'En Proceso');
                })
                ->orderBy('fecha_hora', 'asc')
                ->value('fecha_hora');

            $seguimientos = SeguimientoUht::with(['origen', 'usuarioSiembra', 'usuarioDia2', 'usuarioDia5'])
                ->whereHas('detalles', function ($q) use ($orp) {
                    $q->where('orp_id', $orp->id);
                })
                ->get();

            if ($seguimientos->isEmpty()) {
                return response()->json(['error' => 'No hay seguimientos para esta ORP'], 404);
            }

            // Agrupar por numero
            $grupos = $seguimientos->groupBy('numero');

            // Orígenes fijos (ajusta los IDs según tu base de datos) 22 -28
            $origenes = Origen::whereBetween('id', [22, 28])->pluck('alias', 'id');

            $filas = [];
            foreach ($grupos as $numero => $items) {
                $lote = $items->first()->lote ?? '-';
                $fila = [
                    'lote' => $lote,
                    'numero' => $numero,
                    'valores' => []
                ];
                foreach ($origenes as $origenId => $origenAlias) {
                    $item = $items->firstWhere('origen_id', $origenId);
                    $fila['valores'][$origenId] = [
                        'rt' => $item ? $item->aerovios : null,
                        'myl' => $item ? $item->mohos : null,
                    ];
                }
                $filas[] = $fila;
            }

            // Conteo por origen
            $conteoPorOrigen = [];
            foreach ($origenes as $origenId => $origenAlias) {
                $itemsOrigen = $seguimientos->where('origen_id', $origenId);
                $total = $itemsOrigen->count();
                $rtPositivos = $itemsOrigen->filter(fn($i) => $i->aerovios > 0)->count();
                // Para MyL: solo considerar los que tienen mohos no nulos (sembrados)
                $itemsSembrados = $itemsOrigen->filter(fn($i) => !is_null($i->mohos));
                $mylTotal = $itemsSembrados->count();
                $mylPositivos = $itemsSembrados->filter(fn($i) => $i->mohos > 0)->count();

                $conteoPorOrigen[$origenId] = [
                    'alias' => $origenAlias,
                    'rt_total' => $total,
                    'rt_positivos' => $rtPositivos,
                    'myl_total' => $mylTotal,
                    'myl_positivos' => $mylPositivos,
                ];
            }

            // Usuarios
            $usuariosSiembraIds = $seguimientos->pluck('usuario_siembra_id')->filter()->unique();
            $usuariosDia2Ids = $seguimientos->pluck('usuario_dia_2_id')->filter()->unique();
            $usuariosDia5Ids = $seguimientos->pluck('usuario_dia_5_id')->filter()->unique();

            $usuariosSiembra = User::whereIn('id', $usuariosSiembraIds)->get();
            $usuariosDia2 = User::whereIn('id', $usuariosDia2Ids)->get();
            $usuariosDia5 = User::whereIn('id', $usuariosDia5Ids)->get();

            $todosUsuarios = $usuariosSiembra->merge($usuariosDia2)->merge($usuariosDia5)->unique('id');
            $usuariosInvolucrados = $todosUsuarios->map(fn($user) => [
                'codigo' => $user->codigo ?? $user->id,
                'nombre' => trim(($user->name ?? '') . ' ' . ($user->apellido ?? '')),
            ])->values();

            return response()->json([
                'orp' => $orp,
                'filas' => $filas,
                'origenes' => $origenes,
                'conteoPorOrigen' => $conteoPorOrigen,
                'usuariosSiembra' => $usuariosSiembra,
                'usuariosDia2' => $usuariosDia2,
                'usuariosDia5' => $usuariosDia5,
                'usuarios_involucrados' => $usuariosInvolucrados,
                'fecha_produccion' => $fechaProduccion ? Carbon::parse($fechaProduccion)->format('Y-m-d') : null,
            ]);
        } catch (\Exception $e) {
            // \Log::error('Error en pdf UHT: ' . $e->getMessage());
            dd($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
