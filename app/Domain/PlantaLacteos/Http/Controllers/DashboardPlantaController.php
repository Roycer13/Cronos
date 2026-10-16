<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Domain\PlantaLacteos\Http\Requests\EstadoPlantaRequest;
use App\Domain\PlantaLacteos\Services\DashboardPlantaService;
use App\Domain\PlantaLacteos\Services\EstadoPlantaService;
use App\Domain\ModulosComunes\Orp\Models\Orp; // ✅ Importar el modelo Orp
use App\Domain\ModulosComunes\Orp\Models\OrpEstado; // ✅ Importar OrpEstado
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardPlantaController extends Controller
{
    protected DashboardPlantaService $dashboardPlantaService;
    protected EstadoPlantaService $estadoPlantaService;

    public function __construct(DashboardPlantaService $dashboardPlantaService, EstadoPlantaService $estadoPlantaService)
    {
        $this->dashboardPlantaService = $dashboardPlantaService;
        $this->estadoPlantaService = $estadoPlantaService;
    }

    public function index()
    {
        try {
            $dashboardData = $this->dashboardPlantaService->getDashboardData();

            // ORPs para PRODUCCIÓN: último estado "En Proceso"
            $orpsProduccion = Orp::select(['id', 'codigo', 'producto_terminado_id', 'lote'])
                ->with('productoTerminado:id,codigo_sap,nombre_sap')
                ->where('ubicacion_id', 1)
                ->whereHas('ultimoEstado.estado', function ($query) {
                    $query->where('nombre', 'En Proceso');
                })
                ->get();

            // ORPs para ALMACENAMIENTO: por ejemplo, IDs 1,2,3 (o cualquier criterio)
            $orpsAlmacen = Orp::select(['id', 'codigo', 'producto_terminado_id', 'lote'])
                ->with('productoTerminado:id,codigo_sap,nombre_sap')
                ->where('ubicacion_id', 1)
                ->whereIn('codigo', [1, 2, 3])// Ajusta los IDs según necesites
                ->get();


            // Etapas (igual que antes)
            $etapas = \App\Domain\Sistema\Configuracion\Models\Estado::where('nombre', 'LIKE', 'Mezcla%')
                ->orWhere('nombre', 'LIKE', '%Pasteurizado%')
                ->orWhere('nombre', 'LIKE', '%Inoculacion%')
                ->orWhere('nombre', 'LIKE', '%Corte%')
                ->orWhere('nombre', 'LIKE', '%Saborizacion%')
                ->orWhere('nombre', 'LIKE', '%Envasando%')
                ->select(['id', 'nombre'])
                ->get();

            if ($etapas->isEmpty()) {
                $etapas = [
                    (object)['id' => 30, 'nombre' => 'Mezcla'],
                    (object)['id' => 31, 'nombre' => 'Pasteurizado'],
                    (object)['id' => 32, 'nombre' => 'Inoculacion'],
                    (object)['id' => 33, 'nombre' => 'Antes de Corte'],
                    (object)['id' => 34, 'nombre' => 'Despues de Corte'],
                    (object)['id' => 35, 'nombre' => 'Saborizacion'],
                    (object)['id' => 36, 'nombre' => 'Envasando'],
                ];
            }

            Log::info('ORPs cargadas:', ['produccion' => $orpsProduccion->count(), 'almacen' => $orpsAlmacen->count()]);

            return Inertia::render('planta_lacteos/estadoPlanta/dashboradPlanta', array_merge($dashboardData, [
                'orps' => $orpsProduccion,          // Para producción
                'orps_almacen' => $orpsAlmacen,     // Para almacenamiento
                'etapas' => $etapas,
            ]));
        } catch (\Exception $e) {
            Log::error('Error en DashboardPlantaController@index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('planta_lacteos/estadoPlanta/dashboradPlanta', [
                'error' => 'Error al cargar los datos del dashboard: ' . $e->getMessage(),
                'orps' => [],
                'orps_almacen' => [],
                'etapas' => []
            ]);
        }
    }
    public function dashboardPlantaOld()
      {
        try {
            $dashboardData = $this->dashboardPlantaService->getDashboardData();

            // ORPs para PRODUCCIÓN: último estado "En Proceso"
            $orpsProduccion = Orp::with(['productoTerminado', 'historialEstados.estado'])
                ->where('ubicacion_id', 1)
                ->get()
                ->filter(function ($orp) {
                    $ultimoEstado = $orp->historialEstados()->latest('fecha_hora')->first();
                    return $ultimoEstado && $ultimoEstado->estado->nombre === 'En Proceso';
                })
                ->values(); // Reindexar

            // ORPs para ALMACENAMIENTO: por ejemplo, IDs 1,2,3 (o cualquier criterio)
            $orpsAlmacen = Orp::with(['productoTerminado'])
                ->where('ubicacion_id', 1)
                ->whereIn('id', [4, 5, 6]) // Ajusta los IDs según necesites
                ->get();

            // Etapas (igual que antes)
            $etapas = \App\Domain\Sistema\Configuracion\Models\Estado::where('nombre', 'LIKE', 'Mezcla%')
                ->orWhere('nombre', 'LIKE', '%Pasteurizado%')
                ->orWhere('nombre', 'LIKE', '%Inoculacion%')
                ->orWhere('nombre', 'LIKE', '%Corte%')
                ->orWhere('nombre', 'LIKE', '%Saborizacion%')
                ->orWhere('nombre', 'LIKE', '%Envasando%')
                ->get();

            if ($etapas->isEmpty()) {
                $etapas = [
                    (object)['id' => 30, 'nombre' => 'Mezcla'],
                    (object)['id' => 31, 'nombre' => 'Pasteurizado'],
                    (object)['id' => 32, 'nombre' => 'Inoculacion'],
                    (object)['id' => 33, 'nombre' => 'Antes de Corte'],
                    (object)['id' => 34, 'nombre' => 'Despues de Corte'],
                    (object)['id' => 35, 'nombre' => 'Saborizacion'],
                    (object)['id' => 36, 'nombre' => 'Envasando'],
                ];
            }

            Log::info('ORPs cargadas:', ['produccion' => $orpsProduccion->count(), 'almacen' => $orpsAlmacen->count()]);

            return Inertia::render('planta_lacteos/estadoPlanta/dashboradPlantaOld', array_merge($dashboardData, [
                'orps' => $orpsProduccion,          // Para producción
                'orps_almacen' => $orpsAlmacen,     // Para almacenamiento
                'etapas' => $etapas,
            ]));
        } catch (\Exception $e) {
            Log::error('Error en DashboardPlantaController@index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('planta_lacteos/estadoPlanta/dashboradPlantaOld', [
                'error' => 'Error al cargar los datos del dashboard: ' . $e->getMessage(),
                'orps' => [],
                'orps_almacen' => [],
                'etapas' => []
            ]);
        }
    }


    public function storeFromDashboard(EstadoPlantaRequest $request)
    {
        try {
            $estadoPlanta = $this->estadoPlantaService->createEstadoPlanta($request->validated());
            // Si la petición viene desde Inertia / AJAX, devolver 200 sin contenido
            // para que onSuccess se dispare correctamente sin redireccionar
            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return response()->noContent(200);
            }

            return redirect()
                ->route('dashboardPlanta.index')
                ->with('success', 'Estado de planta creado exitosamente.');
        } catch (\Exception $e) {
            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return response()->noContent(500);
            }

            return redirect()->back()
                ->with('error', 'Error al crear el estado de planta: ' . $e->getMessage());
        }
    }
}
