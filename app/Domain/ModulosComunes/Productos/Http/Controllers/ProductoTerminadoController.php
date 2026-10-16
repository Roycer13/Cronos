<?php

namespace App\Domain\ModulosComunes\Productos\Http\Controllers;

use App\Domain\ModulosComunes\Productos\Http\Requests\ProductoTerminadoRequest;
use App\Domain\ModulosComunes\Productos\Services\ProductoTerminadoService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductoTerminadoController extends Controller
{
    protected $productoTerminadoService;

    public function __construct(ProductoTerminadoService $productoTerminadoService)
    {
        $this->productoTerminadoService = $productoTerminadoService;
    }

    public function index(Request $request)
    {
        $filtros = $request->only([
            'search', 'codigo_sap', 'codigo_interno', 'ubicacion_id', 
            'categoria_producto_id', 'subcategoria_producto_id', 
            'linea_id', 'destino_id', 'activos'
        ]);

        $productos = $this->productoTerminadoService->listar($filtros, 10);

        return Inertia::render('comunes/productoTerminado/index', [
            'productos' => $productos,
            'filtros' => $filtros
        ]);
    }

    public function create()
    {
        $datosFormulario = $this->productoTerminadoService->obtenerParaFormulario();

        return Inertia::render('comunes/productoTerminado/crear', $datosFormulario);
    }

    public function store(ProductoTerminadoRequest $request)
    {
        $producto = $this->productoTerminadoService->crear($request->validated());

        return redirect()->route('productos-terminados.index')
            ->with('success', 'Producto terminado creado correctamente.');
    }

    public function show($id)
    {
        $producto = $this->productoTerminadoService->encontrar($id);

        if (!$producto) {
            abort(404);
        }

        return Inertia::render('comunes/productoTerminado/show', [
            'producto' => $producto
        ]);
    }

    public function edit($id)
    {
        $producto = $this->productoTerminadoService->encontrar($id);

        if (!$producto) {
            abort(404);
        }

        $datosFormulario = $this->productoTerminadoService->obtenerParaFormulario();

        return Inertia::render('comunes/productoTerminado/editar', array_merge($datosFormulario, [
            'producto' => $producto
        ]));
    }

    public function update(ProductoTerminadoRequest $request, $id)
    {
        $producto = $this->productoTerminadoService->encontrar($id);

        if (!$producto) {
            abort(404);
        }

        $this->productoTerminadoService->actualizar($producto, $request->validated());

        return redirect()->route('productos-terminados.index')
            ->with('success', 'Producto terminado actualizado correctamente.');
    }

    public function destroy($id)
    {
        $producto = $this->productoTerminadoService->encontrar($id);

        if (!$producto) {
            abort(404);
        }

        $this->productoTerminadoService->eliminar($producto);

        return redirect()->route('productos-terminados.index')
            ->with('success', 'Producto terminado eliminado correctamente.');
    }
}