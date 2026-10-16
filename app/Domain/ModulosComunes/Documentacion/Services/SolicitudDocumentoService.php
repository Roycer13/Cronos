<?php

namespace App\Domain\ModulosComunes\Documentacion\Services;

use App\Domain\ModulosComunes\Documentacion\Models\Documento;
use App\Domain\ModulosComunes\Documentacion\Models\SolicitudDocumento;
use App\Domain\Sistema\Configuracion\Models\Area;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class SolicitudDocumentoService
{
    public function __construct(
        protected SolicitudDocumento $solicitudDocumento,
        protected Documento $documento,
        protected User $user,
        protected Ubicacion $ubicacion,
        protected Area $area,
        protected Estado $estado
    ) {}

    /**
     * Devuelve paginado con filtros aplicados.
     */
    public function getSolicitudDocumentosFiltrados(array $filters = []): LengthAwarePaginator
    {
        $perPage = isset($filters['per_page']) ? (int)$filters['per_page'] : 20;

        $query = $this->solicitudDocumento
            ->newQuery()
            ->with(['documento', 'ubicacion', 'estado', 'solicitante'])
            ->filter($filters)
            ->orderBy('fecha_solicitud', 'desc');

        return $query->paginate($perPage);
    }

    public function getDatosParaCrearSolicitud()
    {
        return [
            'documentos' => $this->documento->all(),
            'ubicaciones' => $this->ubicacion->all(),
            'areas' => $this->area->all(),
            'estados' => $this->estado->all(),
            'documentos' => $this->documento->all(),
            'usuarios' => $this->user->all(),

        ];
    }

    public function create(array $data): SolicitudDocumento
    {

        return DB::transaction(function () use ($data) {
            $codigoSolicitud = $this->generarCodigoSolicitud();
            if ($data['tipo_solicitud'] === 'Modificacion') {

                $solicitudData = [
                    'codigo_solicitud' => $codigoSolicitud, // Generado automáticamente
                    'fecha_solicitud' => now(), // Fecha actual
                    'solicitante_id' => auth()->id(), // Usuario que envía
                    'tipo_solicitud' => 'Modificacion',
                    'documento_id' => $data['documento_id'], // ID del documento a modificar
                    'justificacion' => $data['justificacion'],
                    'alcance' => $data['alcance'],
                    'estado_id' => $this->getEstadoId('Pendiente')

                ];

                return $this->solicitudDocumento->create($solicitudData);
                // ✅ SE HA CREADO UN REGISTRO EN 'solicitud_documentos'
            }

            if ($data['tipo_solicitud'] === 'Creacion') {

                $documentoData = [
                    'codigo' => $data['codigo'],
                    'titulo' => $data['titulo'],
                    'descripcion' => $data['descripcion'] ?? null,
                    'tipo' => $data['tipo'],
                    'area_id' => $data['area_id'],
                    'ubicacion_id' => $data['ubicacion_id'],
                    'estado_id' => $this->getEstadoId('Por Aprobar'),
                    'creador_asignado' => $data['creador_asignado'],
                ];
                $nuevo_documento = $this->documento->create($documentoData);

                $solicitudData = [
                    'codigo_solicitud' => $codigoSolicitud, // Generado automáticamente
                    'fecha_solicitud' => now(), // Fecha actual
                    'solicitante_id' => auth()->id(), // Usuario que envía
                    'tipo_solicitud' => $data['tipo_solicitud'],
                    'documento_id' => $nuevo_documento->id, // ID del documento a modificar
                    'justificacion' => $data['justificacion'],
                    'alcance' => $data['alcance'],
                    'estado_id' => $this->getEstadoId('Pendiente')
                ];

                return $this->solicitudDocumento->create($solicitudData);
            }
        });
    }



    public function approve(SolicitudDocumento $solicitud, array $data): void
    {
        DB::transaction(function () use ($solicitud, $data) {
            // 1. Actualizar la solicitud con los datos de fechas límite
            $solicitud->update([
                'limite_fecha_elaboracion' => $data['limite_fecha_elaboracion'] ?? null,
                'limite_fecha_revision_tecnica' => $data['limite_fecha_revision_tecnica'] ?? null,
                'limite_fecha_revision_calidad' => $data['limite_fecha_revision_calidad'] ?? null,
                'limite_fecha_revision_aprobacion' => $data['limite_fecha_revision_aprobacion'] ?? null,
                'estado_id' => $this->getEstadoId('Aprobada'),
            ]);

            // 2. Actualizar el documento con los datos de asignación
            if ($solicitud->documento) {
                $documento = $solicitud->documento;

                // Cambiar estado del documento a "En Elaboración"
                $documento->estado_id = $this->getEstadoId('En Elaboración');

                // Asignar los responsables
                $documento->update([
                    'creador_asignado' => $data['creador_asignado'],
                    'revisor1_asignado' => $data['revisor1_asignado'] ?? null,
                    'revisor2_asignado' => $data['revisor2_asignado'] ?? null,
                    'aprobador_asignado' => $data['aprobador_asignado'],
                    'documento_padre_id' => $data['documento_padre_id'] ?? null,
                    'custodio' => $data['custodio'] ?? null,
                    'tipo_distribucion' => $data['tipo_distribucion'] ?? 'Interna',
                    'ubicacion_fisica' => $data['ubicacion_fisica'] ?? null,
                ]);
            }

            // 3. Si es modificación, también podrías crear una nueva versión aquí
            if ($solicitud->tipo_solicitud === 'Modificacion') {
                // Lógica para crear nueva versión del documento
                // Por ahora solo actualizamos el estado
            }
        });
    }

    public function reject(SolicitudDocumento $solicitud, string $razon): void
    {
        DB::transaction(function () use ($solicitud, $razon) {
            // 1. Cambiar estado de la solicitud a "Rechazada"
            $solicitud->estado_id = $this->getEstadoId('Rechazada');

            // 2. Guardar la razón en observaciones
            $solicitud->observaciones = $razon;
            $solicitud->save();

            // 3. Si la solicitud era de creación, cambiar estado del documento a "Rechazado"
            if ($solicitud->tipo_solicitud === 'Creacion' && $solicitud->documento) {
                $solicitud->documento->estado_id = $this->getEstadoId('Rechazado');
                $solicitud->documento->save();
            }
        });
    }


    private function getEstadoId(string $nombreEstado): int
    {
        return Estado::firstOrCreate(
            ['nombre' => $nombreEstado],
            ['descripcion' => 'Generado automáticamente', 'color' => '#9ca3af']
        )->id;
    }

    private function generarCodigoSolicitud(): string
    {
        // Obtener el año actual en 2 dígitos
        $anio = date('y'); // 'y' da 24 para 2024, 25 para 2025, etc.

        // Buscar el último código con el patrón SD-XX- (donde XX es el año en 2 dígitos)
        $ultimoCodigo = $this->solicitudDocumento
            ->where('codigo_solicitud', 'like', "SD-{$anio}-%")
            ->orderBy('codigo_solicitud', 'desc')
            ->value('codigo_solicitud');

        if ($ultimoCodigo) {
            // Extraer el número del último código
            $partes = explode('-', $ultimoCodigo);
            $numero = intval(end($partes)) + 1;
        } else {
            $numero = 1; // Primer código del año
        }

        // Formatear con ceros a la izquierda (4 dígitos)
        $numeroFormateado = str_pad($numero, 4, '0', STR_PAD_LEFT);

        return "SD-{$anio}-{$numeroFormateado}";
    }
}
