<?php

namespace App\Domain\ModulosComunes\Productos\Services;

use App\Domain\ModulosComunes\Productos\Models\FichaTecnica;
use Illuminate\Pagination\LengthAwarePaginator;

class FichaTecnicaService
{
    public function listar(array $filtros = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = FichaTecnica::with([
            'productoTerminado',
            'versionAnterior',
            'usuarioAprobador',
            'informacionNutricional'
        ]);

        if (isset($filtros['search'])) {
            $query->search($filtros['search']);
        }

        if (isset($filtros['aprobado'])) {
            $query->porAprobacion($filtros['aprobado']);
        }

        if (isset($filtros['producto_terminado_id'])) {
            $query->porProducto($filtros['producto_terminado_id']);
        }

        if (isset($filtros['refrigerado'])) {
            $query->refrigerados();
        }

        if (isset($filtros['congelado'])) {
            $query->congelados();
        }

        if (isset($filtros['version'])) {
            $query->porVersion($filtros['version']);
        }

        return $query->paginate($perPage);
    }

    public function crear(array $data): FichaTecnica
    {
        return FichaTecnica::create($data);
    }

    public function actualizar(FichaTecnica $fichaTecnica, array $data): bool
    {
        return $fichaTecnica->update($data);
    }

    public function eliminar(FichaTecnica $fichaTecnica): ?bool
    {
        return $fichaTecnica->delete();
    }

    public function encontrar(int $id): ?FichaTecnica
    {
        return FichaTecnica::with([
            'productoTerminado',
            'versionAnterior',
            'usuarioAprobador',
            'informacionNutricional'
        ])->find($id);
    }

    public function aprobar(FichaTecnica $fichaTecnica, int $usuarioAprobadorId): bool
    {
        return $fichaTecnica->update([
            'aprobado' => true,
            'usuario_aprobador_id' => $usuarioAprobadorId
        ]);
    }

    public function obtenerParaFormulario(): array
    {
        return [
            'productosTerminados' => \App\Domain\ModulosComunes\Productos\Models\ProductoTerminado::all(),
            'usuarios' => \App\Domain\Sistema\Configuracion\Models\User::all(),
            'fichasTecnicas' => \App\Domain\ModulosComunes\Productos\Models\FichaTecnica::all(),
        ];
    }
}