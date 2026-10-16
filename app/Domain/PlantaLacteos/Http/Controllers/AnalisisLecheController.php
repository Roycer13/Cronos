<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\AnalisisLeche;
use App\Domain\PlantaLacteos\Models\AnalisisLinea;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\PlantaLacteos\Http\Requests\AnalisisLecheRequest;
use App\Domain\PlantaLacteos\Models\RutaAcopio;
use App\Domain\PlantaLacteos\Models\SubRutaAcopio;
use App\Domain\PlantaLacteos\Services\AnalisisLecheService;
use Illuminate\Http\Request;
use Inertia\Inertia;
    use Carbon\Carbon;
    use Illuminate\Support\Facades\Log;


class AnalisisLecheController extends Controller
{
    protected AnalisisLecheService $analisisLecheService;

    public function __construct(AnalisisLecheService $analisisLecheService)
    {
        $this->analisisLecheService = $analisisLecheService;
    }

    public function index(Request $request)
    {
        $filters = $request->only([
            'estado_id',
            'user_fq_id',
            'user_mb_siembra_id',
            'user_mb_lectura_id',
            'subruta_id',
            'ruta_id',
            'per_page'
        ]);




        $analisis = AnalisisLeche::with([
            'recepcion.subruta.ruta',
             'recepcion.usuario',
            'analistaFQ',
            'analistaMBSiembra',
            'analistaMBLectura',
            'estado'
        ])
            ->filter($filters)
            ->orderBy($request->get('sort', 'created_at'), $request->get('direction', 'desc'))
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        $estados = Estado::all();
        $analistas = User::all();
        $subrutas = SubRutaAcopio::with('ruta')->where('estado', true)->get();
        $rutas = RutaAcopio::where('estado', true)->get();

        $pendientesLineaCount = AnalisisLinea::pendientes()->count();

        return Inertia::render('planta_lacteos/leches/analisis/index', [
            'analisis' => $analisis,
            'estados' => $estados,
            'analistas' => $analistas,
            'subrutas' => $subrutas,
            'rutas' => $rutas,
            'pendientesLineaCount' => $pendientesLineaCount,
            'filters' => $filters,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function edit(AnalisisLeche $analisis_leche)
    {
        $analisis_leche->load([
            'recepcion.subruta.ruta',
            'analistaFQ',
            'analistaMBSiembra',
            'analistaMBLectura',
            'estado'
        ]);

        $estados = Estado::where('tipo', 'analisis_leche')->get();
        $analistas = User::where('estado', true)->get();

        return Inertia::render('planta_lacteos/leches/analisis/editar', [
            'analisis' => $analisis_leche,
            'estados' => $estados,
            'analistas' => $analistas,
        ]);
    }

    // Métodos para las tres etapas del análisis - todos usan el mismo Request
    public function updateFQ(AnalisisLecheRequest $request, AnalisisLeche $analisis_leche)
    {
        try {
            $this->analisisLecheService->updateAnalisisFQ($analisis_leche, $request->validated());
            return redirect()->route('analisis-leche.index')->with('success', 'Análisis Físico-Químico completado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al completar el análisis Físico-Químico: ' . $e->getMessage());
        }
    }

    public function updateSiembra(AnalisisLecheRequest $request, AnalisisLeche $analisis_leche)
    {
        try {
            $this->analisisLecheService->updateAnalisisSiembra($analisis_leche, $request->validated());
            return redirect()->route('analisis-leche.index')->with('success', 'Etapa de siembra completada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al completar la etapa de siembra: ' . $e->getMessage());
        }
    }

    public function updateLectura(AnalisisLecheRequest $request, AnalisisLeche $analisis_leche)
    {
        try {
            $this->analisisLecheService->updateAnalisisLectura($analisis_leche, $request->validated());
            return redirect()->route('analisis-leche.index')->with('success', 'Etapa de lectura completada exitosamente. Análisis finalizado.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al completar la etapa de lectura: ' . $e->getMessage());
        }
    }

    public function destroy(AnalisisLeche $analisis_leche)
    {
        try {
            $this->analisisLecheService->deleteAnalisisLeche($analisis_leche);
            return redirect()->route('analisis-leche.index')
                ->with('success', 'Análisis de leche eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('analisis-leche.index')
                ->with('error', 'Error al eliminar el análisis de leche: ' . $e->getMessage());
        }
    }

    public function graficas(Request $request)
    {

        $filters = $request->only(['ruta_id', 'subruta_id', 'fecha_inicio', 'fecha_fin']);

        // Obtener datos para las gráficas
        $analisis = AnalisisLeche::with([
                'recepcion.subruta.ruta',
                'estado'
            ])
            ->whereHas('recepcion') // Solo análisis con recepción
            ->filter($filters)
            ->orderBy('created_at', 'desc')
            ->limit(500) // Limitar para mejor performance
            ->get();

        $subrutas = SubRutaAcopio::with('ruta')->where('estado', true)->get();
        $rutas = RutaAcopio::where('estado', true)->get();
        $estados = Estado::all();

        return Inertia::render('planta_lacteos/leches/analisis/graficas', [
            'analisis' => $analisis,
            'subrutas' => $subrutas,
            'rutas' => $rutas,
            'estados' => $estados,
            'filters' => $filters,
        ]);
    }



public function pdf(Request $request)
{
    try {
        $fechaDesde = $request->input('fecha_desde');
        $fechaHasta = $request->input('fecha_hasta');
        if (!$fechaDesde || !$fechaHasta) {
            return response()->json(['error' => 'Fechas requeridas'], 400);
        }

        $query = AnalisisLeche::with([
            'recepcion.subruta.ruta',
            'recepcion.usuario',
            'analistaFQ',
            'analistaMBSiembra',
            'analistaMBLectura',
            'estado'
        ])
        ->whereHas('recepcion', function ($q) use ($fechaDesde, $fechaHasta) {
            $desde = Carbon::parse($fechaDesde)->startOfDay();
            $hasta = Carbon::parse($fechaHasta)->endOfDay();
            $q->whereBetween('tiempo', [$desde, $hasta]);
        });
        if ($request->filled('ruta_id')) {
            $query->whereHas('recepcion.subruta', function ($q) use ($request) {
                $q->where('PLL_ruta_acopios_id', $request->ruta_id);
            });
        }
        if ($request->filled('subruta_id')) {
            $query->whereHas('recepcion', function ($q) use ($request) {
                $q->where('PLL_subruta_acopios_id', $request->subruta_id);
            });
        }

        $analisis = $query->orderBy('created_at', 'desc')->get();

        $usuariosMap = [];

        foreach ($analisis as $a) {
            // Analistas
            $usuarios = [$a->analistaFQ, $a->analistaMBSiembra, $a->analistaMBLectura];
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
            // Usuario solicitante (de la recepción)
            $solicitante = $a->recepcion->usuario ?? null;
            if ($solicitante && $solicitante->codigo) {
                $codigo = $solicitante->codigo;
                if (!isset($usuariosMap[$codigo])) {
                    $usuariosMap[$codigo] = [
                        'codigo' => $codigo,
                        'nombre' => trim(($solicitante->name ?? '') . ' ' . ($solicitante->apellido ?? '')),
                    ];
                }
            }
        }

        $usuariosInvolucrados = array_values($usuariosMap);

        return response()->json([
            'analisis' => $analisis,
            'usuarios_involucrados' => $usuariosInvolucrados,
            'filtros' => [
                'fecha_desde' => $fechaDesde,
                'fecha_hasta' => $fechaHasta,
            ]
        ]);
    } catch (\Exception $e) {
        // Devolvemos el mensaje de error y la traza para depurar
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
}
}
