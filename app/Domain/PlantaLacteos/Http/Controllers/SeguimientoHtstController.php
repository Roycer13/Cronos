<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use Carbon\Carbon;
use App\Domain\ModulosComunes\Orp\Models\Orp;
use App\Domain\ModulosComunes\Productos\Models\ProductoTerminado;
use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\AnalisisLeche;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\PlantaLacteos\Http\Requests\AnalisisLecheRequest;
use App\Domain\PlantaLacteos\Models\Origen;
use App\Domain\PlantaLacteos\Models\RutaAcopio;
use App\Domain\PlantaLacteos\Models\SeguimientoHtst;
use App\Domain\PlantaLacteos\Models\SubRutaAcopio;
use App\Domain\PlantaLacteos\Services\AnalisisLecheService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Termwind\Components\Li;

class SeguimientoHtstController extends Controller
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
    'fecha_vencimiento_desde',   // ← reemplaza a fecha_siembra_desde
    'fecha_vencimiento_hasta',   // ← reemplaza a fecha_siembra_hasta
    'per_page',
]);
        // log de filtros enviados
// dd($filters);



        $seguimientos = SeguimientoHtst::with([
            'orp.productoTerminado',

            'origen',
            'user',
            'estado',
            'usuarioSiembra',
            'usuarioDia2',
            'usuarioDia5',
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
                $query->where('nombre', 'HTST');
            })
            ->whereHas('ubicacion', function ($query) {
                $query->whereIn('nombre', ['Lácteos', 'Soya']);
            })
            ->orderBy('nombre_sap')
            ->get();

        return Inertia::render('planta_lacteos/seguimientos/htst/index', [
            'seguimientos' => $seguimientos,

            // Combos / filtros
            'orps' => Orp::select('id', 'codigo')
                ->whereHas('productoTerminado.linea', function ($query) {
                    $query->where('nombre', 'HTST');
                })
                ->orderBy('codigo')
                ->get(),
            'productosTerminados' => $productosTerminados,
            'estados' => Estado::select('nombre')->orderBy('nombre')->get(),
            'origenes' => Origen::select('id', 'alias')
                ->where('descripcion', 'LIKE', '%ENVASADORA DE HTST%')
                ->orWhere('descripcion', 'LIKE', '%ENVASADORA DE VASOS%')
                ->orWhere('descripcion', 'LIKE', '%ENVASADORA DE BOTELLAS%')
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
    $orps = Orp::with([
        'productoTerminado' => function ($query) {
            $query->select('id', 'nombre_sap', 'codigo_sap');
        }
    ])
        ->whereHas('productoTerminado.linea', function ($query) {
            $query->where('nombre', 'HTST');
        })
        ->select('id', 'codigo', 'producto_terminado_id', 'fecha_vencimiento1')
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
                ] : null,
            ];
        });

    return Inertia::render('planta_lacteos/seguimientos/htst/crear', [
        'orps' => $orps,
        'origenes' => Origen::select('id', 'alias')
            ->where('descripcion', 'LIKE', '%ENVASADORA DE HTST%')
            ->orWhere('descripcion', 'LIKE', '%ENVASADORA DE VASOS%')
            ->orWhere('descripcion', 'LIKE', '%ENVASADORA DE BOTELLAS%')
            ->orderBy('alias')
            ->get(),
    ]);
}


    public function store(Request $request)
    {
        $validated = $request->validate([
            'orp_id'      => ['required', 'exists:orps,id'],
            'preparacion' => ['required', 'string', 'max:255'],
            'lote'        => ['required', 'string', 'max:255'],
            'origen_id'   => ['required', 'exists:PLL_origenes,id'],
            'hora_sachet' => ['nullable', 'date_format:H:i'],
        ]);

        // Obtener el último código
        $lastCodigo = SeguimientoHtst::max('codigo') ?? 0;

        SeguimientoHtst::create([
            'orp_id'      => $validated['orp_id'],
            'origen_id'   => $validated['origen_id'],
            'user_id'     => auth()->id(),
            'tiempo'      => now(),
            'estado_id'    => Estado::where('nombre', 'Pendiente')->value('id'),
            'preparacion' => $validated['preparacion'],
            'lote'        => $validated['lote'],
            'hora_sachet' => $validated['hora_sachet'] ?? null,
            'codigo'      => $lastCodigo + 1, // nuevo código ascendente
        ]);

        return redirect()
            ->route('seguimiento-htst.index')
            ->with('success', 'Seguimiento HTST registrado correctamente.');
    }

    public function update(Request $request, SeguimientoHtst $seguimiento)
    {
        $user = $request->user();
        $esAdmin = $user->hasRole('admin');
        $dentroDelLimite = $seguimiento->created_at
            && $seguimiento->created_at->greaterThanOrEqualTo(now()->subHours(8));

        abort_unless(
            $esAdmin || ((int) $seguimiento->user_id === (int) $user->id && $dentroDelLimite),
            403,
            'Solo quien registró el seguimiento puede editarlo durante las primeras 8 horas.'
        );

        $validated = $request->validate([
            'orp_id'      => ['required', 'exists:orps,id'],
            'preparacion' => ['required', 'string', 'max:255'],
            'lote'        => ['required', 'string', 'max:255'],
            'origen_id'   => ['required', 'exists:PLL_origenes,id'],
            'hora_sachet' => ['nullable', 'date_format:H:i'],
        ]);

        $seguimiento->update($validated);

        return redirect()
            ->route('seguimiento-htst.index')
            ->with('success', 'Seguimiento HTST actualizado correctamente.');
    }


    public function sembrar(SeguimientoHtst $seguimiento)
    {
        // Evitar doble siembra
        if ($seguimiento->tiempo_siembra) {
            return back()->with('error', 'Este seguimiento ya fue sembrado.');
        }

        $now = Carbon::now();

        // Regla: si es entre 22:00 y 23:59 → día siguiente 08:00
        if ($now->hour >= 22) {
            $tiempoSiembra = $now
                ->addDay()
                ->setTime(8, 0, 0);
        } else {
            $tiempoSiembra = $now;
        }

        $seguimiento->update([
            'tiempo_siembra'     => $tiempoSiembra,
            'usuario_siembra_id' => auth()->id(),
        ]);

        return back()->with('success', 'Siembra registrada correctamente.');
    }


    public function guardarMoho(Request $request, SeguimientoHtst $seguimiento)
    {
        $data = $request->validate([
            'mohos' => ['required', 'numeric', 'min:0'],
            'observacion_lectura' => ['nullable', 'string', 'max:1000'],
        ]);

        $seguimiento->update([
            'mohos'               => $data['mohos'],
            'observacion_lectura' => $data['observacion_lectura'],
            'usuario_dia_5_id'    => auth()->id(),
            'tiempo_dia_5'        => Carbon::now(),

            'estado_id'       => Estado::where('nombre', 'Completado')->value('id'),
        ]);

        return back()->with('success', 'Lectura de mohos registrada.');
    }

    public function mohoCero(SeguimientoHtst $seguimiento)
    {
        $seguimiento->update([
            'mohos'            => 0,
            'observacion_lectura' => null,
            'usuario_dia_5_id' => auth()->id(),
            'tiempo_dia_5'     => Carbon::now(),
            'estado_id'       => Estado::where('nombre', 'Completado')->value('id'),
        ]);

        return back()->with('success', 'Moho registrado en cero.');
    }





    public function guardarColiformes(Request $request, SeguimientoHtst $seguimiento)
{
    $data = $request->validate([
        'aerovios'    => ['required', 'numeric', 'min:0'],
        'coliformes'  => ['required', 'numeric', 'min:0'],
        'observacion_lectura' => ['nullable', 'string', 'max:1000'], // ← nuevo
    ]);

    $seguimiento->update([
        'aerovios'          => $data['aerovios'],
        'coliformes'        => $data['coliformes'],
        'observacion_lectura' => $data['observacion_lectura'] ?? $seguimiento->observacion_lectura,
        'usuario_dia_2_id'  => auth()->id(),
        'tiempo_dia_2'      => Carbon::now(),
    ]);

    return back()->with('success', 'Coliformes registrados correctamente.');
}
    public function coliformesCero(SeguimientoHtst $seguimiento)
    {
        $seguimiento->update([
            'aerovios'         => 0,
            'coliformes'       => 0,
            'usuario_dia_2_id' => auth()->id(),
            'tiempo_dia_2'     => Carbon::now(),
        ]);

        return back()->with('success', 'Coliformes registrados en cero.');
    }



    public function destroy(SeguimientoHtst $seguimiento)
    {
        // Verificar permisos si es necesario
        // if (!auth()->user()->can('d_seguimientoHTST')) {
        //     abort(403);
        // }

        $seguimiento->delete();

        return redirect()
            ->route('seguimiento-htst.index') // Asegúrate de que esta ruta sea correcta
            ->with('success', 'Seguimiento eliminado correctamente.');
    }



    public function pdf(Request $request)
{
    try {
        $orpCodigo = $request->input('orp_codigo');
        if (!$orpCodigo) {
            return response()->json(['error' => 'Debe especificar un ORP'], 400);
        }

        $seguimientos = SeguimientoHtst::with([
             'orp.productoTerminado.destino',
            'origen',
            'user',
            'usuarioSiembra',
            'usuarioDia2',
            'usuarioDia5',
            'estado'
        ])
        ->whereHas('orp', function ($q) use ($orpCodigo) {
            $q->where('codigo', $orpCodigo);
        })
        ->orderBy('tiempo_siembra')
        ->get();

        // Recolectar usuarios involucrados (user, usuarioSiembra, usuarioDia2, usuarioDia5)
        $usuariosMap = [];
        foreach ($seguimientos as $s) {
            $usuarios = [
                $s->user,
                $s->usuarioSiembra,
                $s->usuarioDia2,
                $s->usuarioDia5
            ];
            foreach ($usuarios as $user) {
                if ($user && $user->codigo) {
                    $codigo = $user->codigo;
                    if (!isset($usuariosMap[$codigo])) {
                        $usuariosMap[$codigo] = [
                            'codigo' => $codigo,
                            'nombre' => trim(($user->name ?? '') . ' ' . ($user->apellido ?? '')),
                        ];
                    }
                }
            }
        }

        $usuariosInvolucrados = array_values($usuariosMap);

        return response()->json([
            'seguimientos' => $seguimientos,
            'usuarios_involucrados' => $usuariosInvolucrados,
        ]);
    } catch (\Exception $e) {
        // \Log::error('Error en pdf seguimiento HTST: ' . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
}


public function updateObservacion(Request $request, SeguimientoHtst $seguimiento)
{
    $data = $request->validate([
        'observacion_siembra' => ['nullable', 'string', 'max:1000'],
        'observacion_lectura' => ['nullable', 'string', 'max:1000'],
    ]);

    $seguimiento->update([
        'observacion_siembra' => $data['observacion_siembra'] ?? $seguimiento->observacion_siembra,
        'observacion_lectura' => $data['observacion_lectura'] ?? $seguimiento->observacion_lectura,
    ]);

    return back()->with('success', 'Observaciones actualizadas correctamente.');
}
}
