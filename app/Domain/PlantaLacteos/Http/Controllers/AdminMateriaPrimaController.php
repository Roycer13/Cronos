<?php


namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\CategoriaMateriaPrima;
use App\Domain\PlantaLacteos\Models\AlmacenMateriaPrima;
use App\Domain\PlantaLacteos\Models\ItemMateriaPrima;
use App\Domain\PlantaLacteos\Models\ProveedorMateriaPrima;
use App\Domain\Sistema\Configuracion\Models\Unidad;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminMateriaPrimaController extends Controller
{
    // Vista única con todos los datos
    public function index(Request $request)
    {
        $user = auth()->user();
        $ubicacionId = $user->ubicacion_id;
        $tab = $request->get('tab', 'categorias');

        // Inicializar consultas
        $categorias = collect();
        $almacenes = collect();
        $items = collect();
        $proveedores = collect();

        // Categorías con filtro
        if ($tab == 'categorias') {
            $query = CategoriaMateriaPrima::where('ubicacion_id', $ubicacionId);

            if ($request->has('search_categorias') && $request->search_categorias) {
                $search = $request->search_categorias;
                $query->where(function ($q) use ($search) {
                    $q->where('nombre', 'like', "%{$search}%")
                        ->orWhere('descripcion', 'like', "%{$search}%");
                });
            }

            $categorias = $query->paginate(10)->withQueryString();
        }

        // Almacenes con filtro
        if ($tab == 'almacenes') {
            $query = AlmacenMateriaPrima::where('ubicacion_id', $ubicacionId);

            if ($request->has('search_almacenes') && $request->search_almacenes) {
                $search = $request->search_almacenes;
                $query->where('nombre', 'like', "%{$search}%");
            }

            $almacenes = $query->paginate(10)->withQueryString();
        }

        // Items con filtro
        if ($tab == 'items') {
            $query = ItemMateriaPrima::where('ubicacion_id', $ubicacionId)
                ->with(['categoriaMateriaPrima', 'unidad', 'unidad2']);

            if ($request->has('search_items') && $request->search_items) {
                $search = $request->search_items;
                $query->where(function ($q) use ($search) {
                    $q->where('codigo', 'like', "%{$search}%")
                        ->orWhere('nombre', 'like', "%{$search}%")
                        ->orWhere('descripcion', 'like', "%{$search}%")
                        ->orWhereHas('categoriaMateriaPrima', function ($q) use ($search) {
                            $q->where('nombre', 'like', "%{$search}%");
                        });
                });
            }

            $items = $query->paginate(10)->withQueryString();
        }

        // Proveedores con filtro
        if ($tab == 'proveedores') {
            $query = ProveedorMateriaPrima::where('ubicacion_id', $ubicacionId);

            if ($request->has('search_proveedores') && $request->search_proveedores) {
                $search = $request->search_proveedores;
                $query->where(function ($q) use ($search) {
                    $q->where('nombre', 'like', "%{$search}%")
                        ->orWhere('descripcion', 'like', "%{$search}%");
                });
            }

            $proveedores = $query->paginate(10)->withQueryString();
        }

        $unidades = Unidad::all();
        $todasCategorias = CategoriaMateriaPrima::where('ubicacion_id', $ubicacionId)->get();

        return Inertia::render('planta_lacteos/materiaPrima/administrar/index', [
            'categorias' => $categorias,
            'almacenes' => $almacenes,
            'items' => $items,
            'proveedores' => $proveedores,
            'unidades' => $unidades,
            'todasCategorias' => $todasCategorias,
            'filters' => $request->only([
                'search_categorias',
                'search_almacenes',
                'search_items',
                'search_proveedores'
            ]),
        ]);
    }

    // Métodos CRUD para Categorías (mantienen la misma lógica que antes)
    public function categoriasStore(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
        ]);

        CategoriaMateriaPrima::create([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'ubicacion_id' => auth()->user()->ubicacion_id,
        ]);

        return redirect()->route('admin.materia-prima.index')
            ->with('success', 'Categoría creada exitosamente.');
    }

    public function categoriasUpdate(Request $request, CategoriaMateriaPrima $categoria)
    {
        if ($categoria->ubicacion_id !== auth()->user()->ubicacion_id) {
            abort(403, 'No autorizado');
        }

        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
        ]);

        $categoria->update($request->only('nombre', 'descripcion'));

        return redirect()->route('admin.materia-prima.index')
            ->with('success', 'Categoría actualizada exitosamente.');
    }

    public function categoriasDestroy(CategoriaMateriaPrima $categoria)
    {
        if ($categoria->ubicacion_id !== auth()->user()->ubicacion_id) {
            abort(403, 'No autorizado');
        }

        if ($categoria->itemsMateriaPrima()->exists()) {
            return redirect()->back()
                ->with('error', 'No se puede eliminar la categoría porque tiene items asociados.');
        }

        $categoria->delete();

        return redirect()->route('admin.materia-prima.index')
            ->with('success', 'Categoría eliminada exitosamente.');
    }

    // Métodos CRUD para Almacenes
    public function almacenesStore(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:PLL_almacen_materia_prima,nombre',
        ]);

        AlmacenMateriaPrima::create([
            'nombre' => $request->nombre,
            'ubicacion_id' => auth()->user()->ubicacion_id,
        ]);

        return redirect()->route('admin.materia-prima.index')
            ->with('success', 'Almacén creado exitosamente.');
    }

    public function almacenesUpdate(Request $request, AlmacenMateriaPrima $almacen)
    {
        if ($almacen->ubicacion_id !== auth()->user()->ubicacion_id) {
            abort(403, 'No autorizado');
        }

        $request->validate([
            'nombre' => 'required|string|max:255|unique:PLL_almacen_materia_prima,nombre,' . $almacen->id,
        ]);

        $almacen->update($request->only('nombre'));

        return redirect()->route('admin.materia-prima.index')
            ->with('success', 'Almacén actualizado exitosamente.');
    }

    public function almacenesDestroy(AlmacenMateriaPrima $almacen)
    {
        if ($almacen->ubicacion_id !== auth()->user()->ubicacion_id) {
            abort(403, 'No autorizado');
        }

        $almacen->delete();

        return redirect()->route('admin.materia-prima.index')
            ->with('success', 'Almacén eliminado exitosamente.');
    }

    // Métodos CRUD para Items
    public function itemsStore(Request $request)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:50',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'categoria_materia_prima_id' => 'required|exists:PLL_categoria_materia_primas,id',
            'unidad_id' => 'required|exists:unidades,id',
            'unidad2_id' => 'nullable|exists:unidades,id',
            'nivel_inspeccion' => 'nullable|integer',
            'nca_max' => 'nullable|numeric',
            'nca_min' => 'nullable|numeric',
            'Nivel_dilucion' => 'nullable|numeric',
            'temp_max' => 'nullable|numeric',
            'temp_min' => 'nullable|numeric',
            'ph_max' => 'nullable|numeric',
            'ph_min' => 'nullable|numeric',
            'solidos_max' => 'nullable|numeric',
            'solidos_min' => 'nullable|numeric',
            'acidez_max' => 'nullable|numeric',
            'acidez_min' => 'nullable|numeric',
            'densidad_max' => 'nullable|numeric',
            'densidad_min' => 'nullable|numeric',
            'viscosidad_max' => 'nullable|numeric',
            'viscosidad_min' => 'nullable|numeric',
            'organoleptica' => 'nullable|string',
        ]);

        $validated['ubicacion_id'] = auth()->user()->ubicacion_id;


        // Establecer valor por defecto si organoleptica es null
        $validated['organoleptica'] = $validated['organoleptica'] ?? '';

        ItemMateriaPrima::create($validated);

        return redirect()->route('admin.materia-prima.index')
            ->with('success', 'Item creado exitosamente.');
    }

    public function itemsUpdate(Request $request, ItemMateriaPrima $item)
    {
        if ($item->ubicacion_id !== auth()->user()->ubicacion_id) {
            abort(403, 'No autorizado');
        }

        $validated = $request->validate([
            'codigo' => 'required|string|max:50|unique:PLL_item_materia_primas,codigo,' . $item->id,
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'categoria_materia_prima_id' => 'required|exists:PLL_categoria_materia_primas,id',
            'unidad_id' => 'required|exists:unidades,id',
            'unidad2_id' => 'nullable|exists:unidades,id',
            'nivel_inspeccion' => 'nullable|integer',
            'nca_max' => 'nullable|numeric',
            'nca_min' => 'nullable|numeric',
            'Nivel_dilucion' => 'nullable|numeric',
            'temp_max' => 'nullable|numeric',
            'temp_min' => 'nullable|numeric',
            'ph_max' => 'nullable|numeric',
            'ph_min' => 'nullable|numeric',
            'solidos_max' => 'nullable|numeric',
            'solidos_min' => 'nullable|numeric',
            'acidez_max' => 'nullable|numeric',
            'acidez_min' => 'nullable|numeric',
            'densidad_max' => 'nullable|numeric',
            'densidad_min' => 'nullable|numeric',
            'viscosidad_max' => 'nullable|numeric',
            'viscosidad_min' => 'nullable|numeric',
            'organoleptica' => 'nullable|string',
        ]);

        $item->update($validated);

        return redirect()->route('admin.materia-prima.index')
            ->with('success', 'Item actualizado exitosamente.');
    }

    public function itemsDestroy(ItemMateriaPrima $item)
    {
        if ($item->ubicacion_id !== auth()->user()->ubicacion_id) {
            abort(403, 'No autorizado');
        }

        if ($item->recepcionesMateriaPrima()->exists()) {
            return redirect()->back()
                ->with('error', 'No se puede eliminar el item porque tiene recepciones asociadas.');
        }

        $item->delete();

        return redirect()->route('admin.materia-prima.index')
            ->with('success', 'Item eliminado exitosamente.');
    }

    // Métodos CRUD para Proveedores
    public function proveedoresStore(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
        ]);

        ProveedorMateriaPrima::create([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'ubicacion_id' => auth()->user()->ubicacion_id,
        ]);

        return redirect()->route('admin.materia-prima.index')
            ->with('success', 'Proveedor creado exitosamente.');
    }

    public function proveedoresUpdate(Request $request, ProveedorMateriaPrima $proveedor)
    {
        if ($proveedor->ubicacion_id !== auth()->user()->ubicacion_id) {
            abort(403, 'No autorizado');
        }

        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
        ]);

        $proveedor->update($request->only('nombre', 'descripcion'));

        return redirect()->route('admin.materia-prima.index')
            ->with('success', 'Proveedor actualizado exitosamente.');
    }

    public function proveedoresDestroy(ProveedorMateriaPrima $proveedor)
    {
        if ($proveedor->ubicacion_id !== auth()->user()->ubicacion_id) {
            abort(403, 'No autorizado');
        }

        if ($proveedor->recepcionesMateriaPrima()->exists()) {
            return redirect()->back()
                ->with('error', 'No se puede eliminar el proveedor porque tiene recepciones asociadas.');
        }

        $proveedor->delete();

        return redirect()->route('admin.materia-prima.index')
            ->with('success', 'Proveedor eliminado exitosamente.');
    }
}
