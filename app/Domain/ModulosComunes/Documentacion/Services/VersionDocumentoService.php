<?php

namespace App\Domain\ModulosComunes\Documentacion\Services;

use App\Domain\ModulosComunes\Documentacion\Models\Documento;
use App\Domain\ModulosComunes\Documentacion\Models\VersionDocumento;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class VersionDocumentoService
{
    public function __construct(
        protected VersionDocumento $versionDocumento
    ) {}

    /**
     * Crear una nueva versión de documento
     */
    public function crearVersion(Documento $documento, array $datos, array $archivos = []): VersionDocumento
    {
        // Obtener la última versión para calcular el siguiente número
        $ultimaVersion = $documento->versiones()->orderBy('numero_version', 'desc')->first();
        $nuevoNumero = $ultimaVersion ? $this->incrementarVersion($ultimaVersion->numero_version) : '1.0';

        // Subir archivos si existen
        $pdfUrl = null;
        $wordUrl = null;

        if (isset($archivos['archivo_pdf'])) {
            $pdfUrl = $this->subirArchivo($archivos['archivo_pdf'], 'pdf', $documento->id);
        }

        if (isset($archivos['archivo_word'])) {
            $wordUrl = $this->subirArchivo($archivos['archivo_word'], 'word', $documento->id);
        }

        // Crear la versión
        $version = new VersionDocumento([
            'documento_id' => $documento->id,
            'numero_version' => $nuevoNumero,
            'cambios' => $datos['cambios'],
            'observaciones' => $datos['observaciones'] ?? null,
            'creado_por' => auth()->id(),
            'revisado1_por' => $datos['revisado1_por'] ?? null,
            'revisado2_por' => $datos['revisado2_por'] ?? null,
            'aprobado_por' => $datos['aprobado_por'] ?? null,
            'estado_id' => Estado::where('nombre', 'borrador')->first()->id,
            'fecha_creacion' => now(),
        ]);

        if ($pdfUrl) {
            $version->archivo_pdf_url = $pdfUrl;
        }

        if ($wordUrl) {
            $version->archivo_word_url = $wordUrl;
        }

        $version->save();

        return $version;
    }

    /**
     * Enviar versión a revisión
     */
    public function enviarRevision(VersionDocumento $version, array $data)
    {
        
        Log::info('Enviando versión a revisión', [
            'version_id' => $version->id,
            'usuario_actual' => Auth::id()
        ]);

        // Cambiar estado a "en_revision"
        $version->estado_id = $this->getEstadoId('en_revision');

        // Asignar automáticamente al usuario actual como revisor si no hay uno
        if (Auth::check() && !$version->revisor1_id) {
            $version->revisor1_id = Auth::id();
            Log::info('Asignado revisor automáticamente', ['revisor_id' => Auth::id()]);
        }

        $version->save();

        Log::info('Versión enviada a revisión exitosamente', ['version_id' => $version->id]);
    }

    /**
     * Aprobar versión
     */
    public function aprobarVersion(VersionDocumento $version, array $data)
    {
        $user = Auth::user();
        $estadoActual = $version->estado->nombre;

        Log::info('Aprobando versión', [
            'version_id' => $version->id,
            'estado_actual' => $estadoActual,
            'usuario' => $user->id
        ]);

        if ($estadoActual === 'en_revision') {
            // El revisor está aprobando (marcando como Revisado)
            $version->estado_id = $this->getEstadoId('Revisado');

            // Asignar revisor automáticamente
            if (!$version->revisor1_id && $user) {
                $version->revisor1_id = $user->id;
            }

            Log::info('Versión marcada como Revisada', ['version_id' => $version->id]);
        } elseif ($estadoActual === 'Revisado') {
            // El aprobador está aprobando
            $version->estado_id = $this->getEstadoId('Aprobado');

            // Redondear la versión al siguiente entero
            $nuevaVersion = $this->redondearVersion($version->numero_version);
            $version->numero_version = $nuevaVersion;

            // Asignar aprobador automáticamente
            if (!$version->aprobador_id && $user) {
                $version->aprobador_id = $user->id;
            }

            Log::info('Versión aprobada y redondeada', [
                'version_id' => $version->id,
                'version_anterior' => $version->numero_version,
                'version_nueva' => $nuevaVersion
            ]);
        }

        $version->save();
    }

    /**
     * Rechazar versión
     */
    public function rechazarVersion(VersionDocumento $version, array $data)
    {
        Log::info('Rechazando versión', [
            'version_id' => $version->id,
            'usuario' => Auth::id(),
            'observaciones' => $data['observaciones'] ?? ''
        ]);

        $version->estado_id = $this->getEstadoId('Rechazado');

        if (isset($data['observaciones'])) {
            $version->observaciones = $data['observaciones'];
        }

        $version->save();

        Log::info('Versión rechazada', ['version_id' => $version->id]);
    }

    /**
     * Publicar versión como vigente
     */
    public function publicarVersion(VersionDocumento $version)
    {
        Log::info('Publicando versión como vigente', [
            'version_id' => $version->id,
            'usuario' => Auth::id()
        ]);

        // Cambiar estado de la versión a "Vigente"
        $version->estado_id = $this->getEstadoId('Vigente');
        $version->save();

        // Actualizar el documento para que esta sea la versión vigente
        $documento = $version->documento;
        $documento->version_vigente_id = $version->id;

        // También cambiar el estado del documento a "Vigente"
        $documento->estado_id = $this->getEstadoId('Vigente');
        $documento->save();

        Log::info('Versión publicada como vigente', [
            'documento_id' => $documento->id,
            'version_id' => $version->id
        ]);
    }


    /**
     * Incrementar número de versión
     */
    private function incrementarVersion(string $versionActual): string
    {
        $partes = explode('.', $versionActual);

        if (count($partes) === 2) {
            $partes[1] = (int)$partes[1] + 1;
            return implode('.', $partes);
        }

        // Si no está en formato X.Y, convertir y sumar
        return (string)((float)$versionActual + 0.1);
    }

    /**
     * Subir archivo al storage
     */
    private function subirArchivo(UploadedFile $archivo, string $tipo, int $documentoId): string
    {
        $nombreArchivo = time() . '_' . $archivo->getClientOriginalName();
        $ruta = "documentos/{$documentoId}/{$tipo}/{$nombreArchivo}";

        Storage::disk('public')->put($ruta, file_get_contents($archivo));

        return Storage::url($ruta);
    }
    private function redondearVersion(string $versionActual): string
    {
        // Convertir la versión a float y redondear hacia arriba
        $versionFloat = (float) $versionActual;
        $versionRedondeada = ceil($versionFloat);

        // Convertir a string sin decimales si es entero
        return number_format($versionRedondeada, 0, '', '');
    }
    private function getEstadoId(string $nombreEstado): int
    {
        return Estado::firstOrCreate(
            ['nombre' => $nombreEstado],
            ['descripcion' => 'Generado automáticamente', 'color' => '#9ca3af']
        )->id;
    }
}
