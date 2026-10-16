<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Domain\PlantaLacteos\Models\AnalisisLinea;
use App\Domain\PlantaLacteos\Models\AnalisisLeche;
use App\Domain\PlantaLacteos\Services\AnalisisLineaService;
use App\Domain\PlantaLacteos\Http\Requests\AnalisisLineaRequest;
use App\Domain\PlantaLacteos\Models\ParametroLinea;
use App\Http\Controllers\Controller;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\PlantaLacteos\Models\Origen;
use App\Domain\ModulosComunes\Productos\Models\Destino;
use App\Domain\ModulosComunes\Productos\Models\ProductoTerminado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class AnalisisLineaController extends Controller
{
    protected AnalisisLineaService $analisisLineaService;

    public function __construct(AnalisisLineaService $analisisLineaService)
    {
        $this->analisisLineaService = $analisisLineaService;
    }

    public function index(Request $request)
    {
        $allowedPerPage = [10, 25, 50, 100];
        $requestedPerPage = (int) $request->input('per_page', 10);
        $perPage = in_array($requestedPerPage, $allowedPerPage, true) ? $requestedPerPage : 10;
        $allowedSorts = [
            'id',
            'tiempo_solicitud',
            'tiempo_analisis',
            'estado_id',
            'solicitante_id',
            'analista_id',
        ];
        $sort = in_array($request->input('sort'), $allowedSorts, true)
            ? $request->input('sort')
            : 'tiempo_solicitud';
        $direction = $request->input('direction') === 'asc' ? 'asc' : 'desc';

        $filters = $request->only([
            'estado_planta_id',
            'estado_id',
            'solicitante_id',
            'analista_id',
            'fecha_inicio',
            'fecha_fin',
            'per_page',
            'search_orp',
            'search_producto',
            'search_origen',
            'search_destino',
            'etapa_id',
            'origen_id',
            'destino_id',
            'producto_id',
            'preparacion',
            'fecha_vencimiento_inicio',
            'fecha_vencimiento_fin',
        ]);
        $filters['per_page'] = $perPage;

        $query = AnalisisLinea::select([
            'id',
            'tiempo_solicitud',
            'solicitante_id',
            'estado_planta_id',
            'estado_id',
            'tiempo_analisis',
            'analista_id',
            'temperatura',
            'ph',
            'acidez',
            'brix',
            'viscosidad',
            'densidad',
            'color',
            'olor',
            'sabor',
            'aspecto',
            'peso',
            'volumen',
            'observaciones',
            'tempUHT',
        ])->with([
            'estado:id,nombre',
            'estadoPlanta' => function ($q) {
                $q->select('id', 'origen_id', 'etapa_id');
            },
            'estadoPlanta.origen:id,alias',
            'estadoPlanta.etapa:id,nombre',
            'estadoPlanta.detalles' => function ($q) {
                $q->select('id', 'estado_planta_id', 'orp_id', 'preparacion');
            },
            'estadoPlanta.detalles.orp' => function ($q) {
                $q->select('id', 'codigo', 'producto_terminado_id', 'fecha_vencimiento1', 'fecha_vencimiento2');
            },
            'estadoPlanta.detalles.orp.productoTerminado:id,nombre_comercial,nombre_sap,destino_id',
            'estadoPlanta.detalles.orp.productoTerminado.destino:id,nombre',
            'solicitante:id,name',
            'analista:id,name'
        ]);

        // Filtros existentes
        if (isset($filters['estado_planta_id'])) {
            $query->where('estado_planta_id', $filters['estado_planta_id']);
        }
        if (isset($filters['estado_id'])) {
            $query->where('estado_id', $filters['estado_id']);
        }
        if (isset($filters['solicitante_id'])) {
            $query->where('solicitante_id', $filters['solicitante_id']);
        }
        if (isset($filters['analista_id'])) {
            $query->where('analista_id', $filters['analista_id']);
        }
        if (isset($filters['fecha_inicio']) && isset($filters['fecha_fin'])) {
            $query->whereBetween('tiempo_solicitud', [$filters['fecha_inicio'], $filters['fecha_fin']]);
        }
        if (isset($filters['search_orp'])) {
            $query->whereHas('estadoPlanta.detalles.orp', function ($q) use ($filters) {
                $q->where('codigo', 'like', '%' . $filters['search_orp'] . '%');
            });
        }
        if (isset($filters['search_producto'])) {
            $query->whereHas('estadoPlanta.detalles.orp.productoTerminado', function ($q) use ($filters) {
                $q->where('nombre_comercial', 'like', '%' . $filters['search_producto'] . '%')
                    ->orWhere('nombre_sap', 'like', '%' . $filters['search_producto'] . '%');
            });
        }
        if (isset($filters['search_destino'])) {
            $query->whereHas('estadoPlanta.detalles.orp.productoTerminado.destino', function ($q) use ($filters) {
                $q->where('nombre', 'like', '%' . $filters['search_destino'] . '%');
            });
        }
        if (isset($filters['search_origen'])) {
            $query->whereHas('estadoPlanta.origen', function ($q) use ($filters) {
                $q->where('alias', 'like', '%' . $filters['search_origen'] . '%');
            });
        }

        // Filtros por relaciones
        if (isset($filters['etapa_id'])) {
            $query->whereHas('estadoPlanta.etapa', function ($q) use ($filters) {
                $q->where('id', $filters['etapa_id']);
            });
        }
        if (isset($filters['origen_id'])) {
            $query->whereHas('estadoPlanta.origen', function ($q) use ($filters) {
                $q->where('id', $filters['origen_id']);
            });
        }
        if (isset($filters['destino_id'])) {
            $query->whereHas('estadoPlanta.detalles.orp.productoTerminado.destino', function ($q) use ($filters) {
                $q->where('id', $filters['destino_id']);
            });
        }
        if (isset($filters['producto_id'])) {
            $query->whereHas('estadoPlanta.detalles.orp.productoTerminado', function ($q) use ($filters) {
                $q->where('id', $filters['producto_id']);
            });
        }
        if (isset($filters['preparacion']) && $filters['preparacion'] !== '') {
            $query->whereHas('estadoPlanta.detalles', function ($q) use ($filters) {
                $q->where('preparacion', 'like', '%' . $filters['preparacion'] . '%');
            });
        }

        // Filtro por fecha de vencimiento
        if (isset($filters['fecha_vencimiento_inicio']) && isset($filters['fecha_vencimiento_fin'])) {
            $query->whereHas('estadoPlanta.detalles.orp', function ($q) use ($filters) {
                $q->where(function ($sub) use ($filters) {
                    $sub->whereBetween('fecha_vencimiento1', [$filters['fecha_vencimiento_inicio'], $filters['fecha_vencimiento_fin']])
                        ->orWhereBetween('fecha_vencimiento2', [$filters['fecha_vencimiento_inicio'], $filters['fecha_vencimiento_fin']]);
                });
            });
        } elseif (isset($filters['fecha_vencimiento_inicio'])) {
            $query->whereHas('estadoPlanta.detalles.orp', function ($q) use ($filters) {
                $q->where('fecha_vencimiento1', '>=', $filters['fecha_vencimiento_inicio'])
                    ->orWhere('fecha_vencimiento2', '>=', $filters['fecha_vencimiento_inicio']);
            });
        } elseif (isset($filters['fecha_vencimiento_fin'])) {
            $query->whereHas('estadoPlanta.detalles.orp', function ($q) use ($filters) {
                $q->where('fecha_vencimiento1', '<=', $filters['fecha_vencimiento_fin'])
                    ->orWhere('fecha_vencimiento2', '<=', $filters['fecha_vencimiento_fin']);
            });
        }

        // Ordenación y paginación
        $analisis = $query->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        // Cargar parámetros de línea
        $this->cargarParametrosLinea($analisis);

        // Listas para filtros (cacheadas)
        $estados = Cache::remember('estados_analisis_linea', 3600, function () {
            return Estado::select('id', 'nombre')->get();
        });
        $analistas = Cache::remember('analistas_activos', 3600, function () {
            return User::where('estado', 'Activo')->select('id', 'name')->get();
        });
        $etapas = $estados;
        $origenes = Cache::remember('origenes_analisis_linea', 3600, function () {
            return Origen::select('id', 'alias')->get();
        });
        $destinos = Cache::remember('destinos_analisis_linea', 3600, function () {
            return Destino::select('id', 'nombre')->get();
        });
        $productos = Cache::remember('productos_terminados', 3600, function () {
            return ProductoTerminado::select('id', 'nombre_comercial', 'nombre_sap')->get();
        });

        $pendientesLecheCount = Cache::remember('pendientes_leche_count', 60, function () {
            return AnalisisLeche::whereHas('estado', function ($q) {
                $q->where('nombre', 'Pendiente');
            })->count();
        });

        return Inertia::render('planta_lacteos/analisis_linea/index', [
            'analisis' => $analisis,
            'estados' => $estados,
            'analistas' => $analistas,
            'etapas' => $etapas,
            'origenes' => $origenes,
            'destinos' => $destinos,
            'productos' => $productos,
            'pendientesLecheCount' => $pendientesLecheCount,
            'filters' => $filters,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    private function cargarParametrosLinea($analisis)
    {
        $items = $analisis->items();
        $combinaciones = [];
        foreach ($items as $item) {
            $etapaId = $item->estadoPlanta->etapa_id ?? null;
            $productos = $this->getProductosTerminadosFromAnalisis($item);
            foreach ($productos as $producto) {
                if ($etapaId && $producto) {
                    $combinaciones[$etapaId . '-' . $producto->id] = [
                        'etapa_id' => $etapaId,
                        'producto_terminado_id' => $producto->id,
                    ];
                }
            }
        }

        if (empty($combinaciones)) {
            foreach ($items as $item) {
                $item->parametro_linea = null;
            }
            return;
        }

        $parametros = ParametroLinea::select([
            'id',
            'etapa_id',
            'producto_terminado_id',
            'temperatura_min',
            'temperatura_max',
            'ph_min',
            'ph_max',
            'acidez_min',
            'acidez_max',
            'brix_min',
            'brix_max',
            'viscosidad_min',
            'viscosidad_max',
            'densidad_min',
            'densidad_max',
        ])->where(function ($query) use ($combinaciones) {
            foreach ($combinaciones as $combinacion) {
                $query->orWhere(function ($q) use ($combinacion) {
                    $q->where('etapa_id', $combinacion['etapa_id'])
                        ->where('producto_terminado_id', $combinacion['producto_terminado_id']);
                });
            }
        })->get()->keyBy(function ($param) {
            return $param->etapa_id . '-' . $param->producto_terminado_id;
        });

        foreach ($items as $item) {
            $etapaId = $item->estadoPlanta->etapa_id ?? null;
            $productos = $this->getProductosTerminadosFromAnalisis($item);
            $parametro = null;
            foreach ($productos as $producto) {
                if ($etapaId && $producto) {
                    $key = $etapaId . '-' . $producto->id;
                    if (isset($parametros[$key])) {
                        $parametro = $parametros[$key];
                        break;
                    }
                }
            }
            $item->parametro_linea = $parametro;
        }
    }

    private function getProductosTerminadosFromAnalisis($analisisItem)
    {
        $detalles = $analisisItem->estadoPlanta->detalles ?? collect();
        $productos = [];
        foreach ($detalles as $detalle) {
            if ($detalle->orp && $detalle->orp->productoTerminado) {
                $productos[] = $detalle->orp->productoTerminado;
            }
        }
        return collect($productos)->unique('id')->values();
    }
    // Nuevo método para iniciar análisis
    public function analizar(AnalisisLinea $analisis_linea)
    {
        // Verificar que el análisis no esté ya completado
        if ($analisis_linea->tieneAnalisis()) {
            return redirect()->route('analisis-linea.index')
                ->with('error', 'Este análisis ya ha sido completado.');
        }

        $analisis_linea->load([
            'estado',
            'estadoPlanta.origen',
            'estadoPlanta.proceso',
            'estadoPlanta.etapa',
            'estadoPlanta.estadoDetalle.orp.productoTerminado',
            'solicitante',
            'analista'
        ]);

        $estados = Estado::all();
        $analistas = User::where('estado', 'Activo')->get();

        return Inertia::render('planta_lacteos/analisis_linea/analizar', [
            'analisis' => $analisis_linea,
            'estados' => $estados,
            'analistas' => $analistas,
        ]);
    }

    public function edit(AnalisisLinea $analisis_linea)
    {
        $analisis_linea->load([
            'estado',
            'estadoPlanta.origen',
            'estadoPlanta.proceso',
            'estadoPlanta.etapa',
            'solicitante',
            'analista'
        ]);

        $estados = Estado::all();
        $analistas = User::where('estado', 'Activo')->get();

        return Inertia::render('planta_lacteos/analisis_linea/editar', [
            'analisis' => $analisis_linea,
            'estados' => $estados,
            'analistas' => $analistas,
        ]);
    }

    public function update(AnalisisLineaRequest $request, AnalisisLinea $analisis_linea)
    {
        try {
            $this->analisisLineaService->updateAnalisis($analisis_linea, $request->validated());
            return redirect()->route('analisis-linea.index')->with('success', 'Análisis de línea actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al actualizar el análisis: ' . $e->getMessage());
        }
    }

    public function destroy(AnalisisLinea $analisis_linea)
    {
        try {
            $this->analisisLineaService->deleteAnalisisLinea($analisis_linea);
            return redirect()->route('analisis-linea.index')
                ->with('success', 'Análisis de línea eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('analisis-linea.index')
                ->with('error', 'Error al eliminar el análisis de línea: ' . $e->getMessage());
        }
    }

    public function graficas(Request $request)
    {
        $filters = $request->only(['estado_planta_id', 'fecha_inicio', 'fecha_fin']);

        $analisis = AnalisisLinea::with([
            'estadoPlanta.origen',
            'estadoPlanta.proceso',
            'estadoPlanta.etapa',
            'estado',
            'solicitante',
            'analista'
        ])
            ->whereHas('estadoPlanta')
            ->when(isset($filters['estado_planta_id']), function ($query) use ($filters) {
                return $query->where('estado_planta_id', $filters['estado_planta_id']);
            })
            ->when(isset($filters['fecha_inicio']) && isset($filters['fecha_fin']), function ($query) use ($filters) {
                return $query->whereBetween('tiempo_solicitud', [$filters['fecha_inicio'], $filters['fecha_fin']]);
            })
            ->orderBy('tiempo_solicitud', 'desc')
            ->limit(500)
            ->get();

        return Inertia::render('planta_lacteos/analisis_linea/graficas', [
            'analisis' => $analisis,
            'filters' => $filters,
        ]);
    }
}
