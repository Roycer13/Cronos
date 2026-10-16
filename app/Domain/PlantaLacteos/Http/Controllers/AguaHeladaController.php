<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\AguaHelada;
use App\Domain\PlantaLacteos\Services\AguaHeladaService;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AguaHeladaController extends Controller
{
    protected $service;

    public function __construct(AguaHeladaService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $filters = $request->only(['ubicacion_id', 'user_id', 'fecha_desde', 'fecha_hasta', 'per_page']);

        $canViewAllUbicaciones = $user && ($user->hasRole('admin') || $user->hasRole('Admin'));
        $defaultUbicacionId = $user?->ubicacion_id;

        if (!$canViewAllUbicaciones && $defaultUbicacionId) {
            $filters['ubicacion_id'] = $defaultUbicacionId;
        }

        $query = AguaHelada::with(['ubicacion', 'usuario'])
            ->filter($filters)
            ->orderBy('fecha', 'desc');

        if (!$canViewAllUbicaciones && $defaultUbicacionId) {
            $query->where('ubicacion_id', $defaultUbicacionId);
        }

        $registros = $query->paginate($request->get('per_page', 10))->withQueryString();

        $ubicacionesQuery = Ubicacion::query()->orderBy('nombre');
        if (!$canViewAllUbicaciones && $defaultUbicacionId) {
            $ubicacionesQuery->where('id', $defaultUbicacionId);
        }

        $ubicaciones = $ubicacionesQuery->get();
        $usuarios = User::all()->sortBy('name')->values();

        return Inertia::render('planta_lacteos/aguaHelada/index', [
            'registros' => $registros,
            'filters' => $filters,
            'ubicaciones' => $ubicaciones,
            'usuarios' => $usuarios,
            'flash' => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fecha' => 'required|date',
            'p1_dir' => 'nullable|numeric|between:-100,100',
            'p2_d1' => 'nullable|numeric|between:-100,100',
            'p3_d2' => 'nullable|numeric|between:-100,100',
            'p4_dir' => 'nullable|numeric|between:-100,100',
            'p5_dir' => 'nullable|numeric|between:-100,100',
            'p6_d3' => 'nullable|numeric|between:-100,100',
            'p7_dir' => 'nullable|numeric|between:-100,100',
        ]);

        $this->service->create($validated);

        return redirect()->route('agua-helada.index')
            ->with('success', 'Registro de agua helada creado correctamente.');
    }

    public function update(Request $request, AguaHelada $agua_helada)
    {
        $validated = $request->validate([
            'fecha' => 'required|date',
            'p1_dir' => 'nullable|numeric|between:-100,100',
            'p2_d1' => 'nullable|numeric|between:-100,100',
            'p3_d2' => 'nullable|numeric|between:-100,100',
            'p4_dir' => 'nullable|numeric|between:-100,100',
            'p5_dir' => 'nullable|numeric|between:-100,100',
            'p6_d3' => 'nullable|numeric|between:-100,100',
            'p7_dir' => 'nullable|numeric|between:-100,100',
        ]);

        $this->service->update($agua_helada, $validated);

        return redirect()->route('agua-helada.index')
            ->with('success', 'Registro actualizado correctamente.');
    }

    public function destroy(AguaHelada $agua_helada)
    {
        $this->service->delete($agua_helada);

        return redirect()->route('agua-helada.index')
            ->with('success', 'Registro eliminado.');
    }

    public function pdf(Request $request)
    {
        try {
            $fechaDesde = $request->input('fecha_desde');
            $fechaHasta = $request->input('fecha_hasta');

            if (!$fechaDesde || !$fechaHasta) {
                return response()->json(['error' => 'Fechas requeridas'], 400);
            }

            $user = auth()->user();
            $ubicacionId = $user->ubicacion_id;

            $query = AguaHelada::with(['ubicacion', 'usuario'])
                ->whereBetween('fecha', [
                    Carbon::parse($fechaDesde)->startOfDay(),
                    Carbon::parse($fechaHasta)->endOfDay()
                ])
                ->where('ubicacion_id', $ubicacionId)
                ->orderBy('fecha', 'desc');

            $registros = $query->get()->map(function ($registro) {
                return [
                    'fecha' => $registro->fecha->format('d/m/Y H:i'),
                    'ubicacion' => $registro->ubicacion->nombre ?? '—',
                    'p1_dir' => $registro->p1_dir ?? '—',
                    'p2_d1' => $registro->p2_d1 ?? '—',
                    'p3_d2' => $registro->p3_d2 ?? '—',
                    'p4_dir' => $registro->p4_dir ?? '—',
                    'p5_dir' => $registro->p5_dir ?? '—',
                    'p6_d3' => $registro->p6_d3 ?? '—',
                    'p7_dir' => $registro->p7_dir ?? '—',
                    'usuario' => $registro->usuario->codigo ?? $registro->usuario->id ?? '—',
                ];
            });

            return response()->json([
                'datos' => $registros,
                'fecha_desde' => $fechaDesde,
                'fecha_hasta' => $fechaHasta,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error PDF Agua Helada: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
