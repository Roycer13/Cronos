<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Domain\ModulosComunes\Orp\Models\Orp;
use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\EstadoPlanta;
use App\Domain\PlantaLacteos\Models\Origen;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\PlantaLacteos\Http\Requests\EstadoPlantaRequest;
use App\Domain\PlantaLacteos\Models\AnalisisLinea;
use App\Domain\PlantaLacteos\Services\EstadoPlantaCopiaService;
use App\Domain\PlantaLacteos\Services\EstadoPlantaService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EstadoPlantaController extends Controller
{
    protected EstadoPlantaService $estadoPlantaService;
    protected EstadoPlantaCopiaService $estadoPlantaCopiaService;

    public function __construct(EstadoPlantaService $estadoPlantaService, EstadoPlantaCopiaService $estadoPlantaCopiaService)
    {
        $this->estadoPlantaService = $estadoPlantaService;
        $this->estadoPlantaCopiaService = $estadoPlantaCopiaService;
    }

    public function index(Request $request)
    {
        $filters = $request->only([
            'search',
            'origen_id',
            'proceso_id',
            'etapa_id',
            'user_id',
            'per_page'
        ]);

        $estadosPlanta = EstadoPlanta::with(['origen', 'proceso', 'etapa', 'user', 'detalles.orp', 'analisisLinea.estado', 'analisisLinea.solicitante', 'analisisLinea.analista']) // Cambiado a detalles.orp
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('observaciones', 'like', "%{$search}%");
            })
            ->when($filters['origen_id'] ?? null, function ($query, $origenId) {
                $query->where('origen_id', $origenId);
            })
            ->when($filters['proceso_id'] ?? null, function ($query, $procesoId) {
                $query->where('proceso_id', $procesoId);
            })
            ->when($filters['etapa_id'] ?? null, function ($query, $etapaId) {
                $query->where('etapa_id', $etapaId);
            })
            ->when($filters['user_id'] ?? null, function ($query, $userId) {
                $query->where('user_id', $userId);
            })
            ->orderBy($request->get('sort', 'tiempo'), $request->get('direction', 'desc'))
            ->paginate($request->get('per_page', 10))
            ->withQueryString();


        $origenes = Origen::all();
        $estados = Estado::all();
        $usuarios = User::all();

        return Inertia::render('planta_lacteos/estadoPlanta/index', [
            'estadosPlanta' => $estadosPlanta,
            'origenes' => $origenes,
            'estados' => $estados,
            'usuarios' => $usuarios,
            'filters' => $filters,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
                'warning' => session('warning'),
            ],
        ]);
    }

    public function create()
    {
        $origenes = Origen::all();
        $estados = Estado::all(); // Para proceso y etapa
        $orps = Orp::where('ubicacion_id', 1)->get(); //orden de produccion, 1 siendo lacteos

        return Inertia::render('planta_lacteos/estadoPlanta/crear', [
            'origenes' => $origenes,
            'estados' => $estados,
            'orps' => $orps,
        ]);
    }

    public function store(EstadoPlantaRequest $request)
    {
        try {
            // Preparar los datos para el servicio
            $data = $request->validated();

            // Si es pasteurización, reorganizar los datos
            if ($request->has('pasteurizador_id')) {
                $data['origen_id'] = $request->pasteurizador_id; // Esto podría no ser necesario
                $data['origen_id_pasteurizacion'] = $request->origen_id; // El destino final
                $data['pasteurizador_id'] = $request->pasteurizador_id;
            }

            $estadoPlanta = $this->estadoPlantaService->createEstadoPlanta($data);

            // if ($request->wantsJson() || $request->header('X-Inertia')) {
            //     return response()->json([
            //         'success' => true,
            //         'message' => 'Pasteurización creada exitosamente',
            //         'data' => $estadoPlanta
            //     ], 200);
            // }
            return redirect()->back()->with('success', 'Etapa cambiada exitosamente.');
        } catch (\Exception $e) {
            Log::error('Error en store de EstadoPlantaController', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // if ($request->wantsJson() || $request->header('X-Inertia')) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Error al crear: ' . $e->getMessage()
            //     ], 500);
            // }

            return redirect()->back()
                ->with('error', 'Error al crear el estado de planta: ' . $e->getMessage());
        }
    }

    public function edit(EstadoPlanta $estado_planta)
    {
        $estado_planta->load(['detalles.orp', 'origen', 'proceso', 'etapa', 'user']);

        $origenes = Origen::all();
        $estados = Estado::all();
        $orps = Orp::where('ubicacion_id', 1)->get(); // ORPs en proceso para lacteos

        return Inertia::render('planta_lacteos/estadoPlanta/editar', [
            'estadoPlanta' => $estado_planta,
            'origenes' => $origenes,
            'estados' => $estados,
            'orps' => $orps,
        ]);
    }

    public function update(EstadoPlantaRequest $request, EstadoPlanta $estado_planta)
    {
        try {
            $this->estadoPlantaService->updateEstadoPlanta($estado_planta, $request->validated());
            return redirect()->route('estados-planta.index')->with('success', 'Estado de planta actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al actualizar el estado de planta: ' . $e->getMessage());
        }
    }

    public function destroy(EstadoPlanta $estado_planta)
    {
        try {
            $this->estadoPlantaService->deleteEstadoPlanta($estado_planta);
            return redirect()->route('estados-planta.index')
                ->with('success', 'Estado de planta eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('estados-planta.index')
                ->with('error', 'Error al eliminar el estado de planta: ' . $e->getMessage());
        }
    }
    // En EstadoPlantaController - método solicitarAnalisis
    public function solicitarAnalisis(Request $request, EstadoPlanta $estados_planta)
    {
        try {
            $peso = $request->input('peso');
            $creado = $this->estadoPlantaService->solicitarAnalisis($estados_planta, $peso);

            if ($creado) {
                return redirect()->back()->with('success', 'Solicitud de análisis enviada exitosamente.');
            }
             else {
                return redirect()->back()->with('warning', 'Ya existe una solicitud en estado Pendiente.');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al enviar la solicitud de análisis: ' . $e->getMessage());
        }
    }
    public function cambiarEtapa(Request $request, EstadoPlanta $estados_planta)
    {
        try {
            $request->validate([
                'etapa_id' => 'required|exists:estados,id',
                'observaciones' => 'nullable|string'
            ]);

            $nuevoEstado = $this->estadoPlantaCopiaService->copiarConCambioEtapa(
                $estados_planta,
                $request->etapa_id,
                $request->observaciones
            );

            // ✅ Devolver redirección de Inertia en lugar de JSON
            return redirect()->back()->with('success', 'Etapa cambiada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al cambiar la etapa: ' . $e->getMessage());
        }
    }

    public function actualizarOrps(Request $request, EstadoPlanta $estados_planta)
    {
        try {
            $request->validate([
                'detalles' => 'required|array',
                'detalles.*.orp_id' => 'required|exists:orps,id',
                'detalles.*.cantidad' => 'required|numeric|min:0',
                'observaciones' => 'nullable|string'
            ]);

            $nuevoEstado = $this->estadoPlantaCopiaService->copiarConCambioOrps(
                $estados_planta,
                $request->detalles,
                $request->observaciones
            );

            // ✅ Devolver redirección de Inertia
            return redirect()->back()->with('success', 'ORPs actualizados exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al actualizar ORPs: ' . $e->getMessage());
        }
    }

    public function cambiarEtapaYOrps(Request $request, EstadoPlanta $estados_planta)
    {
        try {
            $request->validate([
                'etapa_id' => 'required|exists:estados,id',
                'detalles' => 'required|array',
                'detalles.*.orp_id' => 'required|exists:orps,id',
                'detalles.*.cantidad' => 'required|numeric|min:0',
                'observaciones' => 'nullable|string'
            ]);

            $nuevoEstado = $this->estadoPlantaCopiaService->copiarConCambiosCompletos(
                $estados_planta,
                $request->etapa_id,
                $request->detalles,
                $request->observaciones
            );

            // ✅ Devolver redirección de Inertia
            return redirect()->back()->with('success', 'Cambios aplicados exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al aplicar cambios: ' . $e->getMessage());
        }
    }
}
