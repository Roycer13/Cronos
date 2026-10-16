<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\TemperaturaAlmacenCongelador;
use App\Domain\PlantaLacteos\Models\LugarControlTemperatura;
use App\Domain\PlantaLacteos\Services\TemperaturaAlmacenCongeladorService;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TemperaturaAlmacenCongeladorController extends Controller
{
    protected TemperaturaAlmacenCongeladorService $temperaturaService;

    public function __construct(TemperaturaAlmacenCongeladorService $temperaturaService)
    {
        $this->temperaturaService = $temperaturaService;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['user_id', 'lugar_id', 'fecha_inicio', 'fecha_fin', 'per_page']);

        $temperaturas = TemperaturaAlmacenCongelador::with(['usuario', 'lugar'])
            ->filter($filters)
            ->orderBy($request->get('sort', 'tiempo'), $request->get('direction', 'desc'))
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        $usuarios = User::where('estado', 'Activo')->get();
        $lugares = LugarControlTemperatura::where('estado', true)->get();

        return Inertia::render('planta_lacteos/temperaturaAlmacenCongelador/index', [
            'temperaturas' => $temperaturas,
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
        // Solo lugares de tipo 'Almacén' activos
        $lugares = LugarControlTemperatura::where('estado', true)
            ->where('tipo', 'Almacén')
            ->get();

        return Inertia::render('planta_lacteos/temperaturaAlmacenCongelador/crear', [
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
                'registros.*.temperatura' => 'nullable|numeric|between:-50,100',
                'registros.*.humedad' => 'nullable|numeric|between:0,100',
                'registros.*.ident' => 'boolean',
                'registros.*.observaciones' => 'nullable|string|max:1000',
            ]);

            // Usamos una transacción para asegurar integridad
            DB::transaction(function () use ($validated) {
                foreach ($validated['registros'] as $registro) {
                    $registro['tiempo'] = $validated['tiempo'];
                    $registro['user_id'] = auth()->id();
                    TemperaturaAlmacenCongelador::create($registro);
                }
            });

            return redirect()->route('temperaturas-almacen-congelador.index')
                ->with('success', 'Registros creados exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al crear los registros: ' . $e->getMessage());
        }
    }


    public function update(Request $request, TemperaturaAlmacenCongelador $temperaturas_almacen_congelador)
    {
        try {
            $validated = $request->validate([
                'tiempo' => 'required|date',
                'lugar_id' => 'required|exists:PLL_lugar_control_temperaturas,id',
                'temperatura' => 'nullable|numeric|between:-50,100',
                'humedad' => 'nullable|numeric|between:0,100',
                'ident' => 'boolean',
                'observaciones' => 'nullable|string|max:1000'
            ]);

            $this->temperaturaService->update($temperaturas_almacen_congelador, $validated);

            return redirect()->route('temperaturas-almacen-congelador.index')
                ->with('success', 'Registro de temperatura actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al actualizar el registro: ' . $e->getMessage());
        }
    }

    public function destroy(TemperaturaAlmacenCongelador $temperaturas_almacen_congelador)
    {
        try {
            $this->temperaturaService->delete($temperaturas_almacen_congelador);

            return redirect()->route('temperaturas-almacen-congelador.index')
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

            $query = TemperaturaAlmacenCongelador::with(['usuario', 'lugar'])
                ->whereBetween('tiempo', [
                    Carbon::parse($fechaDesde)->startOfDay(),
                    Carbon::parse($fechaHasta)->endOfDay()
                ]);

            if ($request->filled('lugar_id')) {
                $query->where('lugar_id', $request->lugar_id);
            }

            $temperaturas = $query->orderBy('tiempo', 'desc')->get();

            return response()->json([
                'temperaturas' => $temperaturas,
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
    public function pdfAlmacenTemperaturas(Request $request)
    {
        try {
            $fechaDesde = $request->input('fecha_desde');
            $fechaHasta = $request->input('fecha_hasta');

            if (!$fechaDesde || !$fechaHasta) {
                return response()->json(['error' => 'Fechas requeridas'], 400);
            }

            $inicio = Carbon::parse($fechaDesde)->startOfDay();
            $fin = Carbon::parse($fechaHasta)->endOfDay();

            $registros = TemperaturaAlmacenCongelador::with(['usuario', 'lugar'])
                ->whereBetween('tiempo', [$inicio, $fin])
                ->orderBy('tiempo', 'desc')
                ->get()
                ->map(function ($item) {
                    return [
                        'fecha' => $item->tiempo->format('d/m/Y H:i'),
                        'lugar' => $item->lugar->nombre ?? '—',
                        'temperatura' => $item->temperatura !== null ? $item->temperatura . '°C' : '—',
                        'humedad' => $item->humedad !== null ? $item->humedad . '%' : '—',
                        'ident' => $item->ident ? 'Sí' : 'No',
                        'observaciones' => $item->observaciones ?? '—',
                        'usuario' => $item->usuario->codigo ?? $item->usuario->id ?? '—',
                    ];
                });

            return response()->json([
                'datos' => $registros,
                'fecha_desde' => $fechaDesde,
                'fecha_hasta' => $fechaHasta,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error PDF Almacén Temperaturas: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
