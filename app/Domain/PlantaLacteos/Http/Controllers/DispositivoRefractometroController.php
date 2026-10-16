<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\DispositivoRefractometro;
use App\Domain\PlantaLacteos\Http\Requests\DispositivoRefractometroRequest;
use App\Domain\PlantaLacteos\Services\DispositivoRefractometroService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use App\Domain\PlantaLacteos\Models\DispositivoMedicion;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Carbon\Carbon;

class DispositivoRefractometroController extends Controller
{
    protected DispositivoRefractometroService $service;

    public function __construct(DispositivoRefractometroService $service)
    {
        $this->service = $service;
    }

    // public function index(Request $request)
    // {

    //     try {
    //         $filtros = $request->only([
    //             'fecha_inicio',
    //             'fecha_fin',
    //             'dispositivos_medicion_id',
    //             'estado_id',
    //             'user_id',
    //             'requiere_ajuste',
    //             'orden'
    //         ]);

    //         $perPage = $request->input('per_page', 15);
    //         $resultados = $this->service->listar($filtros, $perPage);

    //         return Inertia::render('planta_lacteos/dispositivos_medicion/index', [
    //             'refractometros' => $resultados->items(),
    //             'pagination' => [
    //                 'total' => $resultados->total(),
    //                 'per_page' => $resultados->perPage(),
    //                 'current_page' => $resultados->currentPage(),
    //                 'last_page' => $resultados->lastPage(),
    //             ],
    //             'filtros' => $filtros,
    //             'dispositivos' => DispositivoMedicion::where('baja', false)->get(),
    //             'estados' => Estado::all(),
    //             'usuarios' => User::all(),
    //         ]);
    //     } catch (\Exception $e) {
    //         return redirect()->back()->withErrors([
    //             'error' => 'Error al obtener los registros: ' . $e->getMessage()
    //         ]);
    //     }
    // }

    public function create()
    {
        return Inertia::render('planta_lacteos/dispositivos_medicion/dispositivos_refractometros/crear', [
            'dispositivos' => DispositivoMedicion::where('dispositivo', 'Refractometro')->where('baja', '-')->get(),
            'estados' => Estado::whereIn('nombre', ['Verificado', 'Observado'])->get(),
            'server_now' => now()->format('Y-m-d\TH:i'),
        ]);
    }

    public function store(DispositivoRefractometroRequest $request)
    {
        try {
            $data = $request->validated();
            $this->service->crear($data);

             return redirect()->route('verificaciones-dispositivos.index', ['tipo' => 'refractometros'])
                ->with('success', 'Registro de refractómetro creado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Error al crear el registro: ' . $e->getMessage()]);
        }
    }

    public function show(DispositivoRefractometro $refractometro)
    {
        try {
            $refractometro->load(['dispositivoMedicion', 'usuario', 'estado']);

            return Inertia::render('planta_lacteos/dispositivos_refractometros/show', [
                'refractometro' => $refractometro,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Error al obtener el registro: ' . $e->getMessage()
            ]);
        }
    }

    public function edit($id)
    {
        try {
            $refractometro = DispositivoRefractometro::find($id);

        if (!$refractometro) {
            dd("Registro con ID $id no encontrado en la tabla PLL_dispositivo_refractometros");
        }

        $refractometro->load(['dispositivoMedicion', 'usuario', 'estado']);
            return Inertia::render('planta_lacteos/dispositivos_medicion/dispositivos_refractometros/editar', [
                'refractometro' => $refractometro,
                'dispositivos' => DispositivoMedicion::where('dispositivo', 'Refractometro')->where('baja', '-')->get(),
                'estados' => Estado::whereIn('nombre', ['Verificado', 'Observado'])->get(),
                'server_now' => now()->format('Y-m-d\TH:i'),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Error al cargar el formulario: ' . $e->getMessage()
            ]);
        }
    }

    public function update(DispositivoRefractometroRequest $request, $id)
    {
        try {
            $refractometro = DispositivoRefractometro::findOrFail($id);
            $data = $request->validated();
            $this->service->actualizar($refractometro, $data);

            return redirect()->route('verificaciones-dispositivos.index', ['tipo' => 'refractometros'])
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
            $refractometro = DispositivoRefractometro::findOrFail($id);
            $this->service->eliminar($refractometro);

            return redirect()->route('verificaciones-dispositivos.index', ['tipo' => 'refractometros'])
                ->with('success', 'Registro eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Error al eliminar el registro: ' . $e->getMessage()]);
        }
    }

    public function estadisticas(Request $request)
    {
        try {
            $fechaInicio = $request->input('fecha_inicio');
            $fechaFin = $request->input('fecha_fin');

            $estadisticas = $this->service->obtenerEstadisticas($fechaInicio, $fechaFin);

            return Inertia::render('planta_lacteos/dispositivos_refractometros/estadisticas', [
                'estadisticas' => $estadisticas,
                'filtros' => [
                    'fecha_inicio' => $fechaInicio,
                    'fecha_fin' => $fechaFin,
                ],
            ]);
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Error al obtener estadísticas: ' . $e->getMessage()]);
        }
    }





public function pdf(Request $request)
{
    try {
        $query = DispositivoRefractometro::with([
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
        \Log::error('Error en pdf refractometros: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}
