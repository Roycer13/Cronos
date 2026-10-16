<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Domain\PlantaLacteos\Models\AguaHelada;
use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\ServicioFrio;
use App\Domain\PlantaLacteos\Models\LugarControlTemperatura;
use App\Domain\PlantaLacteos\Services\ServicioFrioService;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ServicioFrioController extends Controller
{
    protected ServicioFrioService $servicioFrioService;

    public function __construct(ServicioFrioService $servicioFrioService)
    {
        $this->servicioFrioService = $servicioFrioService;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['user_id', 'lugar_id', 'fecha_inicio', 'fecha_fin', 'per_page']);

        $serviciosFrios = ServicioFrio::with(['usuario', 'lugar'])
            ->filter($filters)
            ->orderBy($request->get('sort', 'tiempo'), $request->get('direction', 'desc'))
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        $usuarios = User::where('estado', 'Activo')->get();
        $lugares = LugarControlTemperatura::where('estado', true)->get();

        return Inertia::render('planta_lacteos/servicioFrios/index', [
            'serviciosFrios' => $serviciosFrios,
            'usuarios' => $usuarios,
            'lugares' => $lugares,
            'filters' => $filters,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create()
    {
        // Solo lugares de tipo 'Cámara de frio' activos
        $lugares = LugarControlTemperatura::where('estado', true)
            ->where('tipo', 'Cámara de frio')
            ->get();

        return Inertia::render('planta_lacteos/servicioFrios/crear', [
            'lugares' => $lugares
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'tiempo' => 'required|date',
                'registros' => 'required|array|min:1',
                'registros.*.lugar_id' => 'required|exists:PLL_lugar_control_temperaturas,id',
                'registros.*.display1' => 'nullable|numeric|between:-50,100',
                'registros.*.display2' => 'nullable|numeric|between:-50,100',
                'registros.*.display3' => 'nullable|numeric|between:-50,100',
                'registros.*.termometro_mano' => 'nullable|numeric|between:-50,100',
                'registros.*.separacion_pared' => 'boolean',
                'registros.*.observaciones' => 'nullable|string|max:1000',
            ]);

            DB::transaction(function () use ($validated) {
                foreach ($validated['registros'] as $registro) {
                    $registro['tiempo'] = $validated['tiempo'];
                    $registro['user_id'] = auth()->id();
                    ServicioFrio::create($registro);
                }
            });

            return redirect()->route('servicios-frios.index')
                ->with('success', 'Registros creados exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al crear los registros: ' . $e->getMessage());
        }
    }

    public function update(Request $request, ServicioFrio $servicios_frio)
    {
        try {
            $validated = $request->validate([
                'tiempo' => 'required|date',
                'lugar_id' => 'required|exists:PLL_lugar_control_temperaturas,id',
                'display1' => 'nullable|numeric|between:-50,100',
                'display2' => 'nullable|numeric|between:-50,100',
                'display3' => 'nullable|numeric|between:-50,100',
                'termometro_mano' => 'nullable|numeric|between:-50,100',
                'separacion_pared' => 'boolean',
                'observaciones' => 'nullable|string|max:1000'
            ]);

            $this->servicioFrioService->update($servicios_frio, $validated);

            return redirect()->route('servicios-frios.index')
                ->with('success', 'Registro de servicio de frío actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al actualizar el registro: ' . $e->getMessage());
        }
    }

    public function destroy(ServicioFrio $servicios_frio)
    {
        try {
            $this->servicioFrioService->delete($servicios_frio);

            return redirect()->route('servicios-frios.index')
                ->with('success', 'Registro eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al eliminar el registro: ' . $e->getMessage());
        }
    }

    public function pdf(Request $request)
    {
        try {
            $fechaDesde = $request->input('fecha_desde');
            $fechaHasta = $request->input('fecha_hasta');

            if (!$fechaDesde || !$fechaHasta) {
                return response()->json(['error' => 'Fechas requeridas'], 400);
            }

            $query = ServicioFrio::with(['usuario', 'lugar'])
                ->whereBetween('tiempo', [
                    Carbon::parse($fechaDesde)->startOfDay(),
                    Carbon::parse($fechaHasta)->endOfDay()
                ]);

            if ($request->filled('lugar_id')) {
                $query->where('lugar_id', $request->lugar_id);
            }

            $serviciosFrios = $query->orderBy('tiempo', 'desc')->get();

            return response()->json([
                'serviciosFrios' => $serviciosFrios,
                'filtros' => [
                    'fecha_desde' => $fechaDesde,
                    'fecha_hasta' => $fechaHasta,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function pdfControlFrio(Request $request)
    {
        try {
            $fechaDesde = $request->input('fecha_desde');
            $fechaHasta = $request->input('fecha_hasta');

            if (!$fechaDesde || !$fechaHasta) {
                return response()->json(['error' => 'Fechas requeridas'], 400);
            }

            $inicio = Carbon::parse($fechaDesde)->startOfDay();
            $fin = Carbon::parse($fechaHasta)->endOfDay();

            // Servicios de Frío
            $servicios = ServicioFrio::with(['usuario', 'lugar'])
                ->whereBetween('tiempo', [$inicio, $fin])
                ->get()
                ->map(function ($item) {
                    return [
                        'tipo' => 'Servicio de Frío',
                        'fecha' => $item->tiempo->format('d/m/Y H:i'),
                        'lugar' => $item->lugar->nombre ?? '—',
                        'mediciones' => [
                            'Display 1' => $item->display1 !== null ? $item->display1 . '°C' : '—',
                            'Display 2' => $item->display2 !== null ? $item->display2 . '°C' : '—',
                            'Display 3' => $item->display3 !== null ? $item->display3 . '°C' : '—',
                            'Termómetro Mano' => $item->termometro_mano !== null ? $item->termometro_mano . '°C' : '—',
                            'Separación Pared' => $item->separacion_pared ? 'Sí' : 'No',
                        ],
                        'observaciones' => $item->observaciones ?? '—',
                        'usuario' => $item->usuario->codigo ?? $item->usuario->id ?? '—',
                    ];
                });

            // Agua Helada
            $aguaHelada = AguaHelada::with(['ubicacion', 'usuario'])
                ->whereBetween('fecha', [$inicio, $fin])
                ->get()
                ->map(function ($item) {
                    return [
                        'tipo' => 'Agua Helada',
                        'fecha' => $item->fecha->format('d/m/Y H:i'),
                        'lugar' => $item->ubicacion->nombre ?? '—',
                        'mediciones' => [
                            'P1 DIR' => $item->p1_dir ?? '—',
                            'P2 D1' => $item->p2_d1 ?? '—',
                            'P3 D2' => $item->p3_d2 ?? '—',
                            'P4 DIR' => $item->p4_dir ?? '—',
                            'P5 DIR' => $item->p5_dir ?? '—',
                            'P6 D3' => $item->p6_d3 ?? '—',
                            'P7 DIR' => $item->p7_dir ?? '—',
                        ],
                        'observaciones' => '—',
                        'usuario' => $item->usuario->codigo ?? $item->usuario->id ?? '—',
                    ];
                });

            $combinados = $servicios->concat($aguaHelada)
                ->sortByDesc('fecha')
                ->values();

            return response()->json([
                'datos' => $combinados,
                'fecha_desde' => $fechaDesde,
                'fecha_hasta' => $fechaHasta,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error PDF Control de Frío: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
