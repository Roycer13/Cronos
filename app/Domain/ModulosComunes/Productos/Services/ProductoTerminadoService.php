<?php

namespace App\Domain\ModulosComunes\Productos\Services;

use App\Domain\ModulosComunes\Productos\Models\ProductoTerminado;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductoTerminadoService
{
    public function listar(array $filtros = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = ProductoTerminado::with([
            'ubicacion',
            'categoriaProducto',
            'subcategoriaProducto',
            'linea',
            'destino',
            'unidad',
            'estado',
            'fichaTecnica'
        ]);

        // Aplicar scopes según los filtros
        if (isset($filtros['search'])) {
            $query->search($filtros['search']);
        }

        if (isset($filtros['codigo_sap'])) {
            $query->porCodigoSap($filtros['codigo_sap']);
        }

        if (isset($filtros['codigo_interno'])) {
            $query->porCodigoInterno($filtros['codigo_interno']);
        }

        if (isset($filtros['ubicacion_id'])) {
            $query->porUbicacion($filtros['ubicacion_id']);
        }

        if (isset($filtros['categoria_producto_id'])) {
            $query->porCategoria($filtros['categoria_producto_id']);
        }

        if (isset($filtros['subcategoria_producto_id'])) {
            $query->porSubcategoria($filtros['subcategoria_producto_id']);
        }

        if (isset($filtros['linea_id'])) {
            $query->porLinea($filtros['linea_id']);
        }

        if (isset($filtros['destino_id'])) {
            $query->porDestino($filtros['destino_id']);
        }

        if (isset($filtros['activos'])) {
            $query->activos();
        }

        return $query->paginate($perPage);
    }

    public function crear(array $data): ProductoTerminado
    {
        return ProductoTerminado::create($data);
    }

    public function actualizar(ProductoTerminado $productoTerminado, array $data): bool
    {
        return $productoTerminado->update($data);
    }

    public function eliminar(ProductoTerminado $productoTerminado): ?bool
    {
        return $productoTerminado->delete();
    }

    public function encontrar(int $id): ?ProductoTerminado
    {
        return ProductoTerminado::with([
            'ubicacion',
            'categoriaProducto',
            'subcategoriaProducto',
            'linea',
            'destino',
            'unidad',
            'estado',
            'fichaTecnica'
        ])->find($id);
    }

    public function obtenerParaFormulario(): array
    {
        return [
            'ubicaciones' => \App\Domain\Sistema\Configuracion\Models\Ubicacion::all(),
            'categorias' => \App\Domain\ModulosComunes\Productos\Models\CategoriaProducto::all(),
            'subcategorias' => \App\Domain\ModulosComunes\Productos\Models\SubcategoriaProducto::all(),
            'lineas' => \App\Domain\ModulosComunes\Productos\Models\Linea::all(),
            'destinos' => \App\Domain\ModulosComunes\Productos\Models\Destino::all(),
            'unidades' => \App\Domain\Sistema\Configuracion\Models\Unidad::all(),
              'estados' => \App\Domain\Sistema\Configuracion\Models\Estado::whereIn('nombre', ['Activo', 'Inactivo'])->get(),
        ];
    }
}
