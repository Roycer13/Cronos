<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\ParametroLinea;
use App\Domain\ModulosComunes\Productos\Models\ProductoTerminado;
use App\Domain\ModulosComunes\Productos\Models\CategoriaProducto;
use App\Domain\ModulosComunes\Productos\Models\SubcategoriaProducto;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ParametroLineaController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only([
            'search',
            'categoria_id',
            'subcategoria_id',
            'etapa_id',
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
            'per_page',
        ]);

        $query = ParametroLinea::with([
            'productoTerminado' => function($q) {
                $q->with(['categoriaProducto', 'subcategoriaProducto']);
            },
            'etapa'
        ]);

        // Búsqueda por nombre/código de producto
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('productoTerminado', function($q) use ($search) {
                $q->where('codigo_interno', 'like', "%{$search}%")
                  ->orWhere('nombre_comercial', 'like', "%{$search}%")
                  ->orWhere('nombre_sap', 'like', "%{$search}%");
            });
        }

        // Filtros exactos
       if (!empty($filters['categoria_id']) && $filters['categoria_id'] !== 'all') {
    $query->whereHas('productoTerminado', function($q) use ($filters) {
        $q->where('categoria_producto_id', $filters['categoria_id']);
    });
}

if (!empty($filters['subcategoria_id']) && $filters['subcategoria_id'] !== 'all') {
    $query->whereHas('productoTerminado', function($q) use ($filters) {
        $q->where('subcategoria_producto_id', $filters['subcategoria_id']);
    });
}

if (!empty($filters['etapa_id']) && $filters['etapa_id'] !== 'all') {
    $query->where('etapa_id', $filters['etapa_id']);
}
        // Filtros de rangos (min/max)
        $rangeFields = [
            'temperatura' => ['min' => 'temperatura_min', 'max' => 'temperatura_max'],
            'ph' => ['min' => 'ph_min', 'max' => 'ph_max'],
            'acidez' => ['min' => 'acidez_min', 'max' => 'acidez_max'],
            'brix' => ['min' => 'brix_min', 'max' => 'brix_max'],
            'viscosidad' => ['min' => 'viscosidad_min', 'max' => 'viscosidad_max'],
            'densidad' => ['min' => 'densidad_min', 'max' => 'densidad_max'],
        ];

        foreach ($rangeFields as $field => $keys) {
            if (!empty($filters[$keys['min']])) {
                $query->where($keys['min'], '>=', (float) $filters[$keys['min']]);
            }
            if (!empty($filters[$keys['max']])) {
                $query->where($keys['max'], '<=', (float) $filters[$keys['max']]);
            }
        }

        $parametros = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15))
            ->withQueryString();

        // Datos para selects
        $productos = ProductoTerminado::activos()
            ->select('id', 'codigo_interno', 'nombre_comercial')
            ->orderBy('nombre_comercial')
            ->get();

        $etapas = Estado::whereIn('nombre', ['Mezcla', 'Pasteurizado', 'Inoculacion', 'Antes de Corte', 'Despues de Corte', 'Saborizacion', 'Envasando']) // Ajusta según tus etapas
            ->select('id', 'nombre')
            ->orderBy('nombre')
            ->get();

        $categorias = CategoriaProducto::select('id', 'nombre')
            ->orderBy('nombre')
            ->get();

        $subcategorias = SubcategoriaProducto::select('id', 'nombre', 'categoria_id')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('planta_lacteos/analisis_linea/parametros/index', [
            'parametros' => $parametros,
            'filters' => $filters,
            'productos' => $productos,
            'etapas' => $etapas,
            'categorias' => $categorias,
            'subcategorias' => $subcategorias,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'producto_terminado_id' => 'required|exists:producto_terminados,id',
            'etapa_id' => 'required|exists:estados,id',
            'temperatura_min' => 'nullable|numeric|min:0',
            'temperatura_max' => 'nullable|numeric|min:0',
            'ph_min' => 'nullable|numeric|min:0|max:14',
            'ph_max' => 'nullable|numeric|min:0|max:14',
            'acidez_min' => 'nullable|numeric|min:0',
            'acidez_max' => 'nullable|numeric|min:0',
            'brix_min' => 'nullable|numeric|min:0',
            'brix_max' => 'nullable|numeric|min:0',
            'viscosidad_min' => 'nullable|numeric|min:0',
            'viscosidad_max' => 'nullable|numeric|min:0',
            'densidad_min' => 'nullable|numeric|min:0',
            'densidad_max' => 'nullable|numeric|min:0',
        ]);

        // Verificar unicidad
        $exists = ParametroLinea::where('producto_terminado_id', $validated['producto_terminado_id'])
            ->where('etapa_id', $validated['etapa_id'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'Ya existe un parámetro para este producto y etapa. Puedes editarlo en la tabla.');
        }

        ParametroLinea::create($validated);

        return redirect()
            ->route('parametros-linea.index')
            ->with('success', 'Parámetro creado correctamente.');
    }

    public function update(Request $request, ParametroLinea $parametroLinea)
    {
        $validated = $request->validate([
            'producto_terminado_id' => 'required|exists:producto_terminados,id',
            'etapa_id' => 'required|exists:estados,id',
            'temperatura_min' => 'nullable|numeric|min:0',
            'temperatura_max' => 'nullable|numeric|min:0',
            'ph_min' => 'nullable|numeric|min:0|max:14',
            'ph_max' => 'nullable|numeric|min:0|max:14',
            'acidez_min' => 'nullable|numeric|min:0',
            'acidez_max' => 'nullable|numeric|min:0',
            'brix_min' => 'nullable|numeric|min:0',
            'brix_max' => 'nullable|numeric|min:0',
            'viscosidad_min' => 'nullable|numeric|min:0',
            'viscosidad_max' => 'nullable|numeric|min:0',
            'densidad_min' => 'nullable|numeric|min:0',
            'densidad_max' => 'nullable|numeric|min:0',
        ]);

        // Verificar que no exista otro registro con la misma combinación (excluyendo el actual)
        $exists = ParametroLinea::where('producto_terminado_id', $validated['producto_terminado_id'])
            ->where('etapa_id', $validated['etapa_id'])
            ->where('id', '!=', $parametroLinea->id)
            ->exists();

        if ($exists) {
            return back()->with('error', 'Ya existe otro parámetro para este producto y etapa.');
        }

        $parametroLinea->update($validated);

        return redirect()
            ->route('parametros-linea.index')
            ->with('success', 'Parámetro actualizado correctamente.');
    }

    public function destroy(ParametroLinea $parametroLinea)
    {
        $parametroLinea->delete();

        return redirect()
            ->route('parametros-linea.index')
            ->with('success', 'Parámetro eliminado correctamente.');
    }

    /**
     * Asignación masiva: aplica los rangos a todos los productos de una categoría/subcategoría y etapa.
     */
    public function masivo(Request $request)
    {
        $validated = $request->validate([
            'categoria_id' => 'nullable|exists:categoria_productos,id',
            'subcategoria_id' => 'nullable|exists:subcategoria_productos,id',
            'etapa_id' => 'required|exists:estados,id',
            'temperatura_min' => 'nullable|numeric|min:0',
            'temperatura_max' => 'nullable|numeric|min:0',
            'ph_min' => 'nullable|numeric|min:0|max:14',
            'ph_max' => 'nullable|numeric|min:0|max:14',
            'acidez_min' => 'nullable|numeric|min:0',
            'acidez_max' => 'nullable|numeric|min:0',
            'brix_min' => 'nullable|numeric|min:0',
            'brix_max' => 'nullable|numeric|min:0',
            'viscosidad_min' => 'nullable|numeric|min:0',
            'viscosidad_max' => 'nullable|numeric|min:0',
            'densidad_min' => 'nullable|numeric|min:0',
            'densidad_max' => 'nullable|numeric|min:0',
        ]);

        // Construir query de productos
        $productosQuery = ProductoTerminado::activos();

        if (!empty($validated['categoria_id']) && $validated['categoria_id'] !== 'all') {
    $productosQuery->where('categoria_producto_id', $validated['categoria_id']);
}

if (!empty($validated['subcategoria_id']) && $validated['subcategoria_id'] !== 'all') {
    $productosQuery->where('subcategoria_producto_id', $validated['subcategoria_id']);
}

        $productos = $productosQuery->get();

        if ($productos->isEmpty()) {
            return back()->with('error', 'No se encontraron productos para los filtros seleccionados.');
        }

        DB::transaction(function () use ($productos, $validated) {
            foreach ($productos as $producto) {
                ParametroLinea::updateOrCreate(
                    [
                        'producto_terminado_id' => $producto->id,
                        'etapa_id' => $validated['etapa_id'],
                    ],
                    [
                        'temperatura_min' => $validated['temperatura_min'] ?? null,
                        'temperatura_max' => $validated['temperatura_max'] ?? null,
                        'ph_min' => $validated['ph_min'] ?? null,
                        'ph_max' => $validated['ph_max'] ?? null,
                        'acidez_min' => $validated['acidez_min'] ?? null,
                        'acidez_max' => $validated['acidez_max'] ?? null,
                        'brix_min' => $validated['brix_min'] ?? null,
                        'brix_max' => $validated['brix_max'] ?? null,
                        'viscosidad_min' => $validated['viscosidad_min'] ?? null,
                        'viscosidad_max' => $validated['viscosidad_max'] ?? null,
                        'densidad_min' => $validated['densidad_min'] ?? null,
                        'densidad_max' => $validated['densidad_max'] ?? null,
                    ]
                );
            }
        });

        return redirect()
            ->route('parametros-linea.index')
            ->with('success', 'Parámetros asignados masivamente a ' . $productos->count() . ' productos.');
    }

    /**
     * Eliminar masivo: elimina todos los parámetros de una categoría/subcategoría y etapa.
     */
    public function eliminarMasivo(Request $request)
    {
        $validated = $request->validate([
            'categoria_id' => 'nullable|exists:categoria_productos,id',
            'subcategoria_id' => 'nullable|exists:subcategoria_productos,id',
            'etapa_id' => 'required|exists:estados,id',
        ]);

        $productosQuery = ProductoTerminado::activos();

        if (!empty($validated['categoria_id'])) {
            $productosQuery->where('categoria_producto_id', $validated['categoria_id']);
        }

        if (!empty($validated['subcategoria_id'])) {
            $productosQuery->where('subcategoria_producto_id', $validated['subcategoria_id']);
        }

        $productosIds = $productosQuery->pluck('id');

        if ($productosIds->isEmpty()) {
            return back()->with('error', 'No se encontraron productos para los filtros seleccionados.');
        }

        $deleted = ParametroLinea::whereIn('producto_terminado_id', $productosIds)
            ->where('etapa_id', $validated['etapa_id'])
            ->delete();

        return redirect()
            ->route('parametros-linea.index')
            ->with('success', "Se eliminaron {$deleted} parámetros.");
    }
}
