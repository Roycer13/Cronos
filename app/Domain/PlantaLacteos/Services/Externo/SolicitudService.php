<?php

namespace App\Domain\PlantaLacteos\Services\Externo;

use App\Domain\PlantaLacteos\Models\ExtSolicitudAnalisis;
use App\Domain\PlantaLacteos\Models\ExtDetalleSolicitudAnalisis;
use App\Domain\PlantaLacteos\Models\ExtTipoMuestra;
use App\Domain\PlantaLacteos\Models\ProductoTerminado; // Ajusta namespace real
use App\Domain\Sistema\Configuracion\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SolicitudService
{
    /**
     * Crear solicitud con sus detalles, manejando códigos correlativos.
     */
    public function crearSolicitud(array $data, User $user): ExtSolicitudAnalisis
    {
        return DB::transaction(function () use ($data, $user) {
            // Generar código correlativo "000001", etc.
            $ultimoCodigo = ExtSolicitudAnalisis::max('codigo');
            $nuevoCodigo = str_pad((int)$ultimoCodigo + 1, 6, '0', STR_PAD_LEFT);

            $solicitud = ExtSolicitudAnalisis::create([
                'tiempo' => now(),
                'user_id' => $user->id,
                'ubicacion_id' => $user->ubicacion_id, // Asume que User tiene ubicacion_id
                'codigo' => $nuevoCodigo,
                'estado' => 'Pendiente',
                'observaciones' => $data['observaciones'] ?? null,
            ]);

            // Procesar cada detalle
            $contador = 1;
            foreach ($data['detalles'] as $detalleData) {
                $this->crearDetalle($solicitud, $detalleData, $nuevoCodigo, $contador);
                $contador++;
            }

            return $solicitud->load('detalles');
        });
    }

    private function crearDetalle(ExtSolicitudAnalisis $solicitud, array $datos, string $codigoSolicitud, int &$contador): void
    {
        // Si el detalle tiene personal_ambiente_superficie, forzar tipo_analisis a Fisicoquímico
        $tipos = $datos['tipo_analisis']; // podría ser 'Microbiología,Fisicoquímico' si vienen ambos? Mejor tratarlos como array.
        // En la request, 'tipo_analisis' lo enviaremos como string separado por comas o array.
        // Asumamos que la request lo valida como string, pero en frontend lo manejaremos como array y lo convertiremos a string separado por comas en el modelo. O almacenamos un solo tipo.
        // Dado que puede ser múltiple, lo ideal es que el frontend envíe un array ['Microbiología'] o ['Microbiología','Fisicoquímico']. 
        // Para simplificar, en la request validamos un string pero en el formulario enviaremos algo como "Microbiología,Fisicoquímico". Luego lo explotamos.

        foreach ($tipos as $tipo) {
            $subCodigo = $codigoSolicitud . '-' . $contador;

            $detalle = new ExtDetalleSolicitudAnalisis([
                'ext_solicitud_analisis_id' => $solicitud->id,
                'producto_terminado_id' => $datos['producto_terminado_id'] ?? null,
                'subcodigo' => $subCodigo,
                'estado' => 'Pendiente',
                'fecha_muestreo' => $datos['fecha_muestreo'],
                'lote' => empty($datos['personal_ambiente_superficie']) ? ($datos['lote'] ?? null) : null,
                'fecha_elaboracion' => empty($datos['personal_ambiente_superficie']) ? ($datos['fecha_elaboracion'] ?? null) : null,
                'fecha_vencimiento' => empty($datos['personal_ambiente_superficie']) ? ($datos['fecha_vencimiento'] ?? null) : null,
                'tipo_muestra_id' => $datos['tipo_muestra_id'],
                'tipo_analisis' => $tipo,
                'personal_ambiente_superficie' => $datos['personal_ambiente_superficie'] ?? null,
                'observaciones' => null,
            ]);
            $detalle->save();
            $contador++;
        }
    }

    /**
     * Cambiar estado de la solicitud. Si se acepta, crear registros de análisis automáticamente.
     */
    public function cambiarEstadoSolicitud(ExtSolicitudAnalisis $solicitud, string $estado, ?string $observaciones = null): void
    {
        $solicitud->estado = $estado;
        $solicitud->observaciones = $observaciones;
        $solicitud->save();
    }

    private function crearAnalisisPorDetalle(ExtDetalleSolicitudAnalisis $detalle): void
    {
        // Determinar la tabla destino según tipo_analisis y si tiene personal_ambiente_superficie
        if ($detalle->tipo_analisis === 'Microbiología') {
            Log::debug('microbiologia: ' . $detalle->tipo_analisis);
            \App\Domain\PlantaLacteos\Models\ExtMicrobiologia::create([
                'ext_detalle_solicitud_analisis_id' => $detalle->id,
                'estado' => 'Pendiente',
            ]);
            return;
        }

        if ($detalle->tipo_analisis === 'Agua') {


            try {
                \App\Domain\PlantaLacteos\Models\ExtAguaFisico::create([
                    'ext_detalle_solicitud_analisis_id' => $detalle->id,
                    'estado' => 'Pendiente',
                ]);
                Log::debug('ExtActividadAgua created for detalle id: ' . $detalle->id);
                return;
            } catch (\Throwable $th) {
                Log::error('Error creando ExtActividadAgua: ' . $th->getMessage());
            }
        }

        if ($detalle->tipo_analisis === 'Fisicoquímico') {
            Log::debug('fisicoquimico: ' . $detalle->tipo_analisis);
            if (!empty($detalle->personal_ambiente_superficie)) {
                \App\Domain\PlantaLacteos\Models\ExtActividadAgua::create([
                    'ext_detalle_solicitud_analisis_id' => $detalle->id,
                    'estado' => 'Pendiente',
                ]);
                return;
            }

            // Si existe otro destino para Fisicoquímico sin personal_ambiente_superficie,
            // agréguelo aquí.
            return;
        }

        Log::warning('tipo_analisis no reconocido: ' . $detalle->tipo_analisis);

        // Aquí puede agregarse manejo para otros tipos o lanzar excepción si es requerido.
    }

    /**
     * Cambiar estado de un detalle individual.
     */
    public function cambiarEstadoDetalle(ExtDetalleSolicitudAnalisis $detalle, string $estado, ?string $observaciones = null): void
    {
        DB::transaction(function () use ($detalle, $estado, $observaciones) {
            $detalle->estado = $estado;
            $detalle->observaciones = $observaciones;
            $detalle->save();

            if ($estado === 'Aceptado') {
                $this->crearAnalisisPorDetalle($detalle);
            }
        });
    }

    /**
     * Obtener listado de solicitudes con filtros para el index.
     */
    public function listarSolicitudes(array $filters = [])
    {
        $query = ExtSolicitudAnalisis::with([
            'user',
            'detalles.productoTerminado',   // ← para nombre_comercial
            'detalles.tipoMuestra',         // ← para nombre del tipo de muestra
        ]);

        if (!empty($filters['estado'])) {
            $query->where('estado', $filters['estado']);
        }
        if (!empty($filters['ubicacion_id'])) {
            $query->where('ubicacion_id', $filters['ubicacion_id']);
        }
        if (!empty($filters['codigo'])) {
            $query->where('codigo', 'like', '%' . $filters['codigo'] . '%');
        }

        return $query->orderBy('tiempo', 'desc')->paginate($filters['per_page'] ?? 10);
    }
}
