<?php

namespace App\Domain\PlantaLacteos\Services;

use App\Domain\PlantaLacteos\Models\RecepcionEstadoHistorial;
use App\Domain\PlantaLacteos\Models\RecepcionLote;
use App\Domain\PlantaLacteos\Models\RecepcionMateriaPrima;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RecepcionMateriaPrimaService
{
    public function store(array $data)
    {
        return DB::transaction(function () use ($data) {
            $data['user_id'] = auth()->id();
            $data['tiempo'] = $data['tiempo'] ?? now();
            $estadoPendiente = Estado::where('nombre', 'Pendiente')->first();
            if (!$estadoPendiente) {
                throw new \RuntimeException('No existe el estado "Pendiente" en la tabla estados.');
            }
            $data['estado_id'] = $data['estado_id'] ?? $estadoPendiente->id;
            $data['liberacion_id'] = $data['liberacion_id'] ?? $estadoPendiente->id;
            // Estado de revisión por defecto: Pendiente
            $data['estado_revision_id'] = $data['estado_revision_id'] ?? $estadoPendiente->id;
            // Revisor inicialmente null
            $data['revisor_id'] = $data['revisor_id'] ?? null;

            if (!isset($data['ubicacion_id']) || empty($data['ubicacion_id'])) {
                $data['ubicacion_id'] = auth()->user()->ubicacion_id;
            }

            // Sincronizar campos legacy cantidad/unidades con los nuevos
            if (isset($data['cantidad_recepcionada_total_kg'])) {
                $data['cantidad'] = $data['cantidad_recepcionada_total_kg'];
            }
            if (isset($data['cantidad_recepcionada_unidades'])) {
                $data['unidades'] = $data['cantidad_recepcionada_unidades'];
            }

            $lotes = $data['lotes'] ?? [];
            unset($data['lotes']);

            // Limpiar campos de UI que no están en la tabla
            unset($data['_f_item'], $data['_f_proveedor'], $data['categoria_id']);

            $recepcion = RecepcionMateriaPrima::create($data);

            foreach ($lotes as $loteData) {
                // Verificar si el lote tiene al menos algún dato relevante
                $hasData = !empty($loteData['lote'])
                    || !empty($loteData['fecha_elaboracion'])
                    || !empty($loteData['fecha_vencimiento'])
                    || !empty($loteData['cantidad_recepcionada_unidades'])
                    || !empty($loteData['cantidad_recepcionada_total_kg'])
                    || !empty($loteData['tipo_material'])
                    || !empty($loteData['textura_apariencia'])
                    || !empty($loteData['sabor'])
                    || !empty($loteData['olor'])
                    || !empty($loteData['observaciones']);

                if (!$hasData) {
                    continue;
                }

                unset($loteData['_id']); // eliminar ID temporal del frontend
                $recepcion->recepcionLotes()->create($loteData);
            }

            RecepcionEstadoHistorial::create([
                'recepcion_materia_prima_id' => $recepcion->id,
                'user_id' => auth()->id(),
                'estado_id' => $data['estado_id'],
                'liberacion_id' => $data['liberacion_id'],
                'observacion' => $data['observacion'] ?? null,
            ]);

            return $recepcion;
        });
    }

    public function update(RecepcionMateriaPrima $recepcion, array $data)
    {
        return DB::transaction(function () use ($recepcion, $data) {
            unset($data['ubicacion_id']); // No permitir cambiar ubicación

            unset($data['_f_item'], $data['_f_proveedor'], $data['categoria_id']);

            if (isset($data['cantidad_recepcionada_total_kg'])) {
                $data['cantidad'] = $data['cantidad_recepcionada_total_kg'];
            }
            if (isset($data['cantidad_recepcionada_unidades'])) {
                $data['unidades'] = $data['cantidad_recepcionada_unidades'];
            }

            $lotes = $data['lotes'] ?? [];
            unset($data['lotes']);

            $recepcion->update($data);

            // Reemplazar lotes: eliminar todos y crear de nuevo
            $recepcion->recepcionLotes()->delete();

            foreach ($lotes as $loteData) {
                $hasData = !empty($loteData['lote'])
                    || !empty($loteData['fecha_elaboracion'])
                    || !empty($loteData['fecha_vencimiento'])
                    || !empty($loteData['cantidad_recepcionada_unidades'])
                    || !empty($loteData['cantidad_recepcionada_total_kg'])
                    || !empty($loteData['tipo_material'])
                    || !empty($loteData['textura_apariencia'])
                    || !empty($loteData['sabor'])
                    || !empty($loteData['olor'])
                    || !empty($loteData['observaciones']);

                if (!$hasData) {
                    continue;
                }

                unset($loteData['_id']);
                $recepcion->recepcionLotes()->create($loteData);
            }

            return $recepcion;
        });
    }    //------
    public function store1(array $data)
    {
        return DB::transaction(function () use ($data) {
            $certificadoPdf = $data['certificado_pdf'] ?? null;
            unset($data['certificado_pdf']);
            $data['user_id'] = auth()->id();
            $data['tiempo'] = $data['tiempo'] ?? now();
            $estadoPendiente = Estado::where('nombre', 'Pendiente')->first();
            if (!$estadoPendiente) {
                throw new \RuntimeException('No existe el estado "Pendiente" en la tabla estados.');
            }
            $data['estado_id'] = $data['estado_id'] ?? $estadoPendiente->id;
            $data['estado_analisis_id'] = $data['estado_id'] ?? $estadoPendiente->id;
            $data['liberacion_id'] = $data['liberacion_id'] ?? $estadoPendiente->id;
            // Estado de revisión por defecto: Pendiente
            $data['estado_revision_id'] = $data['estado_revision_id'] ?? $estadoPendiente->id;
            // Revisor inicialmente null
            $data['revisor_id'] = $data['revisor_id'] ?? null;

            if (!isset($data['ubicacion_id']) || empty($data['ubicacion_id'])) {
                $data['ubicacion_id'] = auth()->user()->ubicacion_id;
            }

            // Sincronizar cantidad y unidades desde los campos nuevos para compatibilidad
            if (isset($data['cantidad_recepcionada_total_kg'])) {
                $data['cantidad'] = $data['cantidad_recepcionada_total_kg'];
            }
            if (isset($data['cantidad_recepcionada_unidades'])) {
                $data['unidades'] = $data['cantidad_recepcionada_unidades'];
            }

            // Extraer lotes y eliminarlos del array principal
            $lotes = $data['lotes'] ?? [];
            unset($data['lotes']);

            // Limpiar campos que no están en el modelo (filtros UI)
            unset($data['_f_item'], $data['_f_proveedor'], $data['categoria_id']);

            // Crear recepción principal
            $recepcion = RecepcionMateriaPrima::create($data);

            $this->guardarCertificado($recepcion, $certificadoPdf);

            // Guardar lotes con TODOS sus campos
            foreach ($lotes as $loteData) {
                $hasData = !empty($loteData['lote'])
                    || !empty($loteData['fecha_elaboracion'])
                    || !empty($loteData['fecha_vencimiento'])
                    || !empty($loteData['cantidad_recepcionada_unidades'])
                    || !empty($loteData['cantidad_recepcionada_total_kg'])
                    || !empty($loteData['tipo_material'])
                    || !empty($loteData['textura_apariencia'])
                    || !empty($loteData['sabor'])
                    || !empty($loteData['olor'])
                    || !empty($loteData['observaciones']);

                if (!$hasData) {
                    continue;
                }

                unset($loteData['_id']);
                $recepcion->recepcionLotes()->create($loteData);
            }

            // Historial de estado
            RecepcionEstadoHistorial::create([
                'recepcion_materia_prima_id' => $recepcion->id,
                'user_id' => auth()->id(),
                'estado_id' => $data['estado_id'],
                'liberacion_id' => $data['liberacion_id'],
                'observacion' => $data['observacion'] ?? null,
            ]);

            return $recepcion;
        });
    }

    public function update1(RecepcionMateriaPrima $recepcion, array $data)
    {
        return DB::transaction(function () use ($recepcion, $data) {
            $certificadoPdf = $data['certificado_pdf'] ?? null;
            unset($data['certificado_pdf']);
            // No permitir cambiar ubicación (a menos que sea admin, pero ya se controla arriba)
            unset($data['ubicacion_id']);

            // Limpiar campos auxiliares
            unset($data['_f_item'], $data['_f_proveedor'], $data['categoria_id']);

            // Sincronizar cantidad y unidades desde los campos nuevos para compatibilidad
            if (isset($data['cantidad_recepcionada_total_kg'])) {
                $data['cantidad'] = $data['cantidad_recepcionada_total_kg'];
            }
            if (isset($data['cantidad_recepcionada_unidades'])) {
                $data['unidades'] = $data['cantidad_recepcionada_unidades'];
            }

            $lotes = $data['lotes'] ?? [];
            unset($data['lotes']);

            // Actualizar datos de la recepción
            $recepcion->update($data);

            if ($certificadoPdf instanceof UploadedFile) {
                $this->guardarCertificado($recepcion, $certificadoPdf);
            }

            // Reemplazar lotes: eliminar todos y crear de nuevo con los datos actualizados
            $recepcion->recepcionLotes()->delete();

            foreach ($lotes as $loteData) {
                $hasData = !empty($loteData['lote'])
                    || !empty($loteData['fecha_elaboracion'])
                    || !empty($loteData['fecha_vencimiento'])
                    || !empty($loteData['cantidad_recepcionada_unidades'])
                    || !empty($loteData['cantidad_recepcionada_total_kg'])
                    || !empty($loteData['tipo_material'])
                    || !empty($loteData['textura_apariencia'])
                    || !empty($loteData['sabor'])
                    || !empty($loteData['olor'])
                    || !empty($loteData['observaciones']);

                if (!$hasData) {
                    continue;
                }

                unset($loteData['_id']);
                $recepcion->recepcionLotes()->create($loteData);
            }

            return $recepcion;
        });
    }

    private function guardarCertificado(RecepcionMateriaPrima $recepcion, ?UploadedFile $archivo): void
    {
        if (!$archivo) {
            return;
        }

        $certificadoAnterior = $recepcion->certificadoPdf;
        $recepcion->loadMissing(['itemMateriaPrima', 'proveedorMateriaPrima']);

        $fecha = Carbon::parse($recepcion->tiempo)->format('Ymd');
        $materiaPrima = $this->normalizarNombreArchivo(
            $recepcion->itemMateriaPrima?->nombre,
            'MateriaPrima'
        );
        $proveedor = $this->normalizarNombreArchivo(
            $recepcion->proveedorMateriaPrima?->nombre,
            'Proveedor'
        );
        $nombreArchivo = "{$fecha}_{$materiaPrima}_{$proveedor}.pdf";

        $ruta = $archivo->storeAs(
            'certificados',
            $nombreArchivo,
            'public'
        );

        $recepcion->certificadoPdf()->updateOrCreate(
            ['recepcion_materia_prima_id' => $recepcion->id],
            [
                'ruta' => $ruta,
                'nombre_original' => $archivo->getClientOriginalName(),
                'mime_type' => $archivo->getClientMimeType(),
                'tamano' => $archivo->getSize(),
            ]
        );

        if ($certificadoAnterior && $certificadoAnterior->ruta !== $ruta) {
            Storage::disk('public')->delete($certificadoAnterior->ruta);
        }
    }

    private function normalizarNombreArchivo(?string $nombre, string $porDefecto): string
    {
        $nombre = Str::ascii(trim($nombre ?? ''));
        $nombre = preg_replace('/[^A-Za-z0-9]+/', '_', $nombre) ?? '';
        $nombre = trim($nombre, '_');

        return $nombre !== '' ? $nombre : $porDefecto;
    }
}
