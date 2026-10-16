<?php

namespace App\Domain\ModulosComunes\Documentacion\Services;

use App\Domain\ModulosComunes\Documentacion\Models\Documento;
use App\Domain\Sistema\Configuracion\Models\Area;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class DocumentoService
{
    public function __construct(
        protected Documento $documento,
        protected Ubicacion $ubicacion,
        protected Area $area,
        protected Estado $estado,
        protected User $user
    ) {}

    /**
     * Obtener documentos paginados con filtros
     */
    public function getDocumentosFiltrados(array $filters): LengthAwarePaginator
    {
        $query = $this->documento->query()
            ->with(['area', 'ubicacion', 'estado', 'versionVigente', 'creador'])
            ->orderBy('codigo');

        // Aplicar filtros
        if (!empty($filters['ubicacion_id'])) {
            $query->where('ubicacion_id', $filters['ubicacion_id']);
        }
        
        if (!empty($filters['tipo'])) {
            $query->where('tipo', $filters['tipo']);
        }
        
        if (!empty($filters['area_id'])) {
            $query->where('area_id', $filters['area_id']);
        }
        
        if (!empty($filters['estado_id'])) {
            $query->where('estado_id', $filters['estado_id']);
        }

        // Búsqueda por código, título o descripción
        if (!empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $query->where(function($q) use ($searchTerm) {
                $q->where('codigo', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('titulo', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('descripcion', 'LIKE', "%{$searchTerm}%");
            });
        }

        return $query->paginate(20);
    }

    /**
     * Obtener documentos para recorrerlos en un orden estable.
     */
    public function getDocumentosParaNavegacion(array $filters)
    {
        $query = $this->documento->query()
            ->with(['area', 'ubicacion', 'estado', 'versionVigente', 'creador'])
            ->orderBy('tipo')
            ->orderBy('area_id')
            ->orderBy('codigo')
            ->orderBy('created_at');

        if (!empty($filters['ubicacion_id'])) {
            $query->where('ubicacion_id', $filters['ubicacion_id']);
        }

        if (!empty($filters['tipo'])) {
            $query->where('tipo', $filters['tipo']);
        }

        if (!empty($filters['area_id'])) {
            $query->where('area_id', $filters['area_id']);
        }

        if (!empty($filters['estado_id'])) {
            $query->where('estado_id', $filters['estado_id']);
        }

        if (!empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('codigo', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('titulo', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('descripcion', 'LIKE', "%{$searchTerm}%");
            });
        }

        return $query->get();
    }

    public function getTiposParaNavegacion(array $filters)
    {
        $query = $this->documento->newQuery()
            ->whereNotNull('tipo')
            ->where('tipo', '<>', '')
            ->select('tipo')
            ->distinct()
            ->orderBy('tipo');

        if (!empty($filters['ubicacion_id'])) {
            $query->where('ubicacion_id', $filters['ubicacion_id']);
        }

        return $query->pluck('tipo')->values();
    }

    /**
     * Obtener datos para formulario de creación
     */
    public function getDatosParaCrear(): array
    {
        return [
            'ubicaciones' => $this->ubicacion->all(),
            'areas' => $this->area->all(),
            'estados' => $this->estado->all(),
            'documentos' => $this->documento->all(),
            'usuarios' => $this->user->all(),
        ];
    }

    /**
     * Crear un nuevo documento
     */
    public function crearDocumento(array $datos): Documento
    {
        return $this->documento->create($datos);
    }

    /**
     * Obtener documento por ID con relaciones
     */
    public function getDocumentoConRelaciones(int $id): ?Documento
    {
        return $this->documento->with(['area', 'ubicacion', 'estado', 'versionVigente', 'creador'])->find($id);
    }

    /**
     * Actualizar documento
     */
    public function actualizarDocumento(int $id, array $datos): bool
    {
        $documento = $this->documento->find($id);
        
        if (!$documento) {
            return false;
        }

        return $documento->update($datos);
    }

    /**
     * Eliminar documento
     */
    public function eliminarDocumento(int $id): bool
    {
        $documento = $this->documento->find($id);
        
        if (!$documento) {
            return false;
        }

        return $documento->delete();
    }

    /**
     * Buscar documentos por término
     */
    public function buscarDocumentos(string $termino, int $perPage = 20): LengthAwarePaginator
    {
        return $this->documento->where('titulo', 'LIKE', "%{$termino}%")
            ->orWhere('codigo', 'LIKE', "%{$termino}%")
            ->orWhere('descripcion', 'LIKE', "%{$termino}%")
            ->with(['area', 'ubicacion', 'estado', 'versionVigente'])
            ->paginate($perPage);
    }
}