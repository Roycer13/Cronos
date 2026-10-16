<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Domain\ModulosComunes\Orp\Models\Orp;
use App\Domain\ModulosComunes\Orp\Models\OrpEstado;
use App\Domain\PlantaLacteos\Models\Conteo;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ConteoController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only([
            'search',
            'orp',
            'estado',
            'usuario',
            'tipo',
            'ubicacion',
            'cantidad_min',
            'cantidad_max',
            'fecha_desde',
            'fecha_hasta',
            'per_page',
        ]);

        // PRIMERO: Obtener IDs únicos de ORPs que tienen conteos (con filtros)
        $orpIdsQuery = DB::table('PLL_conteos')
            ->select('orp_id')
            ->distinct();

        // Aplicar filtros a la subquery de conteos
        if (!empty($filters['search'])) {
            $orpIdsQuery->where(function ($query) use ($filters) {
                $query->where('tipo', 'like', "%{$filters['search']}%")
                    ->orWhere('observacion', 'like', "%{$filters['search']}%")
                    ->orWhere('ubicacion', 'like', "%{$filters['search']}%")
                    ->orWhere('cantidad', 'like', "%{$filters['search']}%");
            });
        }

        if (!empty($filters['tipo'])) {
            $orpIdsQuery->where('tipo', $filters['tipo']);
        }

        if (!empty($filters['ubicacion'])) {
            $orpIdsQuery->where('ubicacion', 'like', "%{$filters['ubicacion']}%");
        }

        if (!empty($filters['cantidad_min'])) {
            $orpIdsQuery->where('cantidad', '>=', $filters['cantidad_min']);
        }

        if (!empty($filters['cantidad_max'])) {
            $orpIdsQuery->where('cantidad', '<=', $filters['cantidad_max']);
        }

        if (!empty($filters['fecha_desde'])) {
            $orpIdsQuery->where('tiempo', '>=', $filters['fecha_desde']);
        }

        if (!empty($filters['fecha_hasta'])) {
            $orpIdsQuery->where('tiempo', '<=', $filters['fecha_hasta']);
        }

        if (!empty($filters['usuario'])) {
            $orpIdsQuery->whereHas('user', function ($q) use ($filters) {
                $q->where('name', $filters['usuario']);
            });
        }

        if (!empty($filters['estado'])) {
            $orpIdsQuery->whereHas('estado', function ($q) use ($filters) {
                $q->where('nombre', $filters['estado']);
            });
        }

        // Obtener IDs únicos de ORPs
        $orpIds = $orpIdsQuery->pluck('orp_id');

        // SEGUNDO: Paginar ORPs por sus IDs
        $orpsQuery = Orp::with(['productoTerminado'])
            ->whereIn('id', $orpIds);

        // Aplicar filtro de ORP por código
        if (!empty($filters['orp'])) {
            $orpsQuery->where('codigo', $filters['orp']);
        }

        // Paginar ORPs
        $orps = $orpsQuery->orderBy(
            $request->get('sort', 'id'),
            $request->get('direction', 'desc')
        )
            ->paginate($request->get('per_page', 25))
            ->withQueryString();

        // TERCERO: Para cada ORP paginado, obtener sus conteos completos (con filtros)
        $orpsData = $orps->getCollection()->map(function ($orp) use ($filters) {
            $conteosQuery = Conteo::with(['user', 'estado'])
                ->where('orp_id', $orp->id);

            // Aplicar los mismos filtros
            if (!empty($filters['search'])) {
                $conteosQuery->where(function ($q) use ($filters) {
                    $q->where('tipo', 'like', "%{$filters['search']}%")
                        ->orWhere('observacion', 'like', "%{$filters['search']}%")
                        ->orWhere('ubicacion', 'like', "%{$filters['search']}%")
                        ->orWhere('cantidad', 'like', "%{$filters['search']}%");
                });
            }

            if (!empty($filters['tipo'])) {
                $conteosQuery->where('tipo', $filters['tipo']);
            }

            if (!empty($filters['ubicacion'])) {
                $conteosQuery->where('ubicacion', 'like', "%{$filters['ubicacion']}%");
            }

            if (!empty($filters['cantidad_min'])) {
                $conteosQuery->where('cantidad', '>=', $filters['cantidad_min']);
            }

            if (!empty($filters['cantidad_max'])) {
                $conteosQuery->where('cantidad', '<=', $filters['cantidad_max']);
            }

            if (!empty($filters['fecha_desde'])) {
                $conteosQuery->where('tiempo', '>=', $filters['fecha_desde']);
            }

            if (!empty($filters['fecha_hasta'])) {
                $conteosQuery->where('tiempo', '<=', $filters['fecha_hasta']);
            }

            if (!empty($filters['usuario'])) {
                $conteosQuery->whereHas('user', function ($q) use ($filters) {
                    $q->where('name', $filters['usuario']);
                });
            }

            if (!empty($filters['estado'])) {
                $conteosQuery->whereHas('estado', function ($q) use ($filters) {
                    $q->where('nombre', $filters['estado']);
                });
            }

            $conteos = $conteosQuery->orderBy('tiempo', 'desc')->get();

            // Calcular estadísticas
            $totalCantidad = $conteos->sum('cantidad');
            $totalPorTurnoCantidad = $conteos->where('tipo', 'Total por Turno')->sum('cantidad');
            $tieneTotal = $conteos->where('tipo', 'Total')->isNotEmpty();

            return [
                'orp' => $orp,
                'conteos' => $conteos,
                'total_cantidad' => $totalCantidad,
                'total_por_turno_cantidad' => $totalPorTurnoCantidad,
                'tiene_total' => $tieneTotal,
                'conteos_count' => $conteos->count(), // Para estadísticas
            ];
        });

        // Reemplazar la colección con datos enriquecidos
        $orps->setCollection($orpsData);

        // Obtener valores únicos para los filtros
        $tiposUnicos = Conteo::distinct('tipo')
            ->whereNotNull('tipo')
            ->orderBy('tipo')
            ->pluck('tipo');

        $ubicacionesUnicas = Conteo::distinct('ubicacion')
            ->whereNotNull('ubicacion')
            ->orderBy('ubicacion')
            ->pluck('ubicacion');

        // Calcular total de conteos (para mostrar en estadísticas)
        $conteosQueryTotal = Conteo::query();

        if (!empty($filters['search'])) {
            $conteosQueryTotal->where(function ($q) use ($filters) {
                $q->where('tipo', 'like', "%{$filters['search']}%")
                    ->orWhere('observacion', 'like', "%{$filters['search']}%")
                    ->orWhere('ubicacion', 'like', "%{$filters['search']}%")
                    ->orWhere('cantidad', 'like', "%{$filters['search']}%");
            });
        }

        if (!empty($filters['tipo'])) {
            $conteosQueryTotal->where('tipo', $filters['tipo']);
        }

        if (!empty($filters['ubicacion'])) {
            $conteosQueryTotal->where('ubicacion', 'like', "%{$filters['ubicacion']}%");
        }

        if (!empty($filters['cantidad_min'])) {
            $conteosQueryTotal->where('cantidad', '>=', $filters['cantidad_min']);
        }

        if (!empty($filters['cantidad_max'])) {
            $conteosQueryTotal->where('cantidad', '<=', $filters['cantidad_max']);
        }

        if (!empty($filters['fecha_desde'])) {
            $conteosQueryTotal->where('tiempo', '>=', $filters['fecha_desde']);
        }

        if (!empty($filters['fecha_hasta'])) {
            $conteosQueryTotal->where('tiempo', '<=', $filters['fecha_hasta']);
        }

        if (!empty($filters['usuario'])) {
            $conteosQueryTotal->whereHas('user', function ($q) use ($filters) {
                $q->where('name', $filters['usuario']);
            });
        }

        if (!empty($filters['estado'])) {
            $conteosQueryTotal->whereHas('estado', function ($q) use ($filters) {
                $q->where('nombre', $filters['estado']);
            });
        }


    $allOrps = Orp::with('productoTerminado.ubicacion')
    ->whereHas('productoTerminado.ubicacion', function ($query) {
        $query->where('nombre', 'Lácteos'); // Ajusta si el campo se llama diferente
    })
    ->select('id', 'codigo', 'producto_terminado_id')
    ->orderBy('id', 'desc')
    ->get();
        $totalConteos = $conteosQueryTotal->count();

        $estadosCompletados = Estado::whereIn('nombre', ['Completado', 'Finalizado'])->pluck('id');

        $orpsDisponibles = Orp::with('productoTerminado')
            ->select('id', 'codigo', 'producto_terminado_id')
            ->where(function ($query) use ($estadosCompletados) {
                // Excluir ORPs cuyo último estado sea completado y haya pasado más de una semana
                $query->whereDoesntHave('historialEstados', function ($q) use ($estadosCompletados) {
                    $q->whereIn('estado_id', $estadosCompletados)
                        ->where('fecha_hora', '<', now()->subWeek())
                        ->whereRaw('fecha_hora = (SELECT MAX(fecha_hora) FROM orp_estados WHERE orp_id = orps.id)');
                })
                    // Incluir ORPs que no tienen ningún estado registrado
                    ->orWhereDoesntHave('historialEstados');
            })
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('planta_lacteos/conteos/index', [
            'conteos' => $orps,
            'total_conteos' => $totalConteos,

            // Combos / filtros
            'orps' => $orpsDisponibles,
            'all_orps' => $allOrps,
            'estados' => Estado::select('id', 'nombre')
                ->orderBy('nombre')
                ->get(),

            'usuarios' => User::select('id', 'name', 'apellido')
                ->orderBy('name')
                ->get(),

            'tipos' => $tiposUnicos,
            'ubicaciones' => $ubicacionesUnicas,

            'filters' => $filters,

            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create()
    {
        return redirect()->route('conteos.index');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'orp_id' => ['required', 'exists:orps,id'],
            'tipo' => ['required', 'string', 'in:Parcial,Total por Turno,Muestras de Calidad,Total'],
            'cantidad' => ['required', 'numeric', 'min:0'],
            'ubicacion' => ['nullable', 'string', 'max:255'],
            'observacion' => ['nullable', 'string', 'max:1000'],
        ]);


        $estadoId = Estado::where('nombre', 'En Proceso')->value('id')
            ?? Estado::where('nombre', 'Pendiente')->value('id')
            ?? Estado::first()->id;
        if ($validated['tipo'] === 'Total') {
            $estadoId = Estado::where('nombre', 'Completado')->value('id')
                ?? Estado::where('nombre', 'Finalizado')->value('id')
                ?? Estado::first()->id;
        }
        Conteo::create([
            'orp_id' => $validated['orp_id'],
            'tipo' => $validated['tipo'],
            'cantidad' => $validated['cantidad'],
            'ubicacion' => $validated['ubicacion'] ?? null,
            'observacion' => $validated['observacion'] ?? null,
            'user_id' => auth()->id(),
            'tiempo' => now(),

            'estado_id' => $estadoId,

        ]);

        if ($validated['tipo'] === 'Total') {
            // Buscar el ID del estado "Completado" (puede ser el mismo que se usó para el conteo)
            $estadoCompletadoId = Estado::where('nombre', 'Completado')->value('id')
                ?? Estado::where('nombre', 'Finalizado')->value('id')
                ?? Estado::first()->id;

            // Crear el registro en orp_estados
            OrpEstado::create([
                'orp_id' => $validated['orp_id'],
                'estado_id' => $estadoCompletadoId,
                'usuario_id' => auth()->id(),
                'fecha_hora' => now(),
                'observaciones' => 'Completada automáticamente al registrar conteo total.',
            ]);

             Orp::where('id', $validated['orp_id'])->update(['cantidad_producida' => $validated['cantidad']]);


        }

        return redirect()
            ->route('conteos.index')
            ->with('success', 'Conteo registrado correctamente.');
    }



    public function update(Request $request, Conteo $conteo)
    {
        $validated = $request->validate([
            'tipo' => ['required', 'string', 'in:Parcial,Total por Turno,Muestras de Calidad,Total'],
            'cantidad' => ['required', 'numeric', 'min:0'],
            'ubicacion' => ['nullable', 'string', 'max:255'],
            'observacion' => ['nullable', 'string', 'max:1000'],
        ]);

        $conteo->update($validated);

        return redirect()
            ->route('conteos.index')
            ->with('success', 'Conteo actualizado correctamente.');
    }

    public function destroy(Conteo $conteo)
    {
        $conteo->delete();

        return redirect()
            ->route('conteos.index')
            ->with('success', 'Conteo eliminado correctamente.');
    }
}
