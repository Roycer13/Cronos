<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\DispositivoCrioscopo;
use App\Domain\PlantaLacteos\Http\Requests\DispositivoCrioscopoRequest;
use App\Domain\PlantaLacteos\Services\DispositivoCrioscopoService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Domain\PlantaLacteos\Models\DispositivoMedicion;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Carbon\Carbon;

class DispositivoCrioscopoController extends Controller
{
    protected DispositivoCrioscopoService $service;

    public function __construct(DispositivoCrioscopoService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        try {
            $filtros = $request->only([
                'fecha_inicio',
                'fecha_fin',
                'dispositivos_medicion_id',
                'estado_id',
                'user_id',
                'punto_ajuste_a',
                'punto_ajuste_b',
                'orden'
            ]);

            $perPage = $request->input('per_page', 15);
            $resultados = $this->service->listar($filtros, $perPage);

            return Inertia::render('planta_lacteos/dispositivos_medicion/index', [
                'crioscopos' => $resultados->items(),
                'pagination' => [
                    'total' => $resultados->total(),
                    'per_page' => $resultados->perPage(),
                    'current_page' => $resultados->currentPage(),
                    'last_page' => $resultados->lastPage(),
                ],
                'filtros' => $filtros,
                'dispositivos' => DispositivoMedicion::where('baja', false)->get(),
                'estados' => Estado::all(),
                'usuarios' => User::all(),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Error al obtener los registros: ' . $e->getMessage()
            ]);
        }
    }

    public function create()
    {
        return Inertia::render('planta_lacteos/dispositivos_medicion/dispositivos_crioscopos/crear', [
            'dispositivos' => DispositivoMedicion::where('dispositivo', 'Crióscopo')->where('baja', '-')->get(),
            'estados' => Estado::whereIn('nombre', ['Verificado', 'Observado'])->get(),
            'server_now' => now()->format('Y-m-d\TH:i'),
        ]);
    }

    public function store(DispositivoCrioscopoRequest $request)
    {
        try {
            $data = $request->validated();
            $this->service->crear($data);

            return redirect()->route('verificaciones-dispositivos.index', ['tipo' => 'crioscopos'])
                ->with('success', 'Registro de crioscopo creado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Error al crear el registro: ' . $e->getMessage()]);
        }
    }

    public function edit($id)
    {
        try {
            $crioscopo = DispositivoCrioscopo::findOrFail($id);
            $crioscopo->load(['dispositivoMedicion', 'usuario', 'estado']);

            return Inertia::render('planta_lacteos/dispositivos_medicion/dispositivos_crioscopos/editar', [
                'crioscopo' => $crioscopo,
                'dispositivos' => DispositivoMedicion::where('dispositivo', 'Crioscopo')->where('baja', '-')->get(),
                'estados' => Estado::whereIn('nombre', ['Verificado', 'Observado'])->get(),
                'server_now' => now()->format('Y-m-d\TH:i'),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Error al cargar el formulario: ' . $e->getMessage()
            ]);
        }
    }

    public function update(DispositivoCrioscopoRequest $request, $id)
    {
        try {
            $crioscopo = DispositivoCrioscopo::findOrFail($id);
            $data = $request->validated();
            $this->service->actualizar($crioscopo, $data);

            return redirect()->route('verificaciones-dispositivos.index', ['tipo' => 'crioscopos'])
                ->with('success', 'Registro actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Error al actualizar el registro: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        try {
            $crioscopo = DispositivoCrioscopo::findOrFail($id);
            $this->service->eliminar($crioscopo);

            return redirect()->route('verificaciones-dispositivos.index', ['tipo' => 'crioscopos'])
                ->with('success', 'Registro eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Error al eliminar el registro: ' . $e->getMessage()]);
        }
    }


public function pdf(Request $request)
{
    try {
        $query = DispositivoCrioscopo::with([
            'dispositivoMedicion',
            'usuario',
            'estado'
        ]);

        if ($request->filled('fecha_desde')) {
            $fechaDesde = Carbon::parse($request->fecha_desde)->startOfDay();
            $query->where('fecha_hora', '>=', $fechaDesde);
        }
        if ($request->filled('fecha_hasta')) {
            $fechaHasta = Carbon::parse($request->fecha_hasta)->endOfDay();
            $query->where('fecha_hora', '<=', $fechaHasta);
        }

        $registros = $query->orderBy('fecha_hora')->get();

        $usuariosMap = [];
        foreach ($registros as $reg) {
            if ($reg->usuario && $reg->usuario->codigo) {
                $codigo = $reg->usuario->codigo;
                if (!isset($usuariosMap[$codigo])) {
                    $usuariosMap[$codigo] = [
                        'codigo' => $codigo,
                        'nombre' => trim(($reg->usuario->name ?? '') . ' ' . ($reg->usuario->apellido ?? '')),
                    ];
                }
            }
        }

        $usuariosInvolucrados = array_values($usuariosMap);

        return response()->json([
            'registros' => $registros,
            'usuarios_involucrados' => $usuariosInvolucrados,
        ]);
    } catch (\Exception $e) {
        \Log::error('Error en pdf crioscopos: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}
