<?php

namespace App\Domain\ModulosComunes\Documentacion\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\ModulosComunes\Documentacion\Models\Documento;
use App\Domain\ModulosComunes\Documentacion\Models\VersionDocumento;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class VersionDocumentoController extends Controller
{
    public function index(Documento $documento)
    {
        $versiones = $documento->versiones()
            ->with([
                'estado',
                'creador',
                'revisor1',
                'revisor2',
                'aprobador'
            ])
            ->orderBy('numero_version', 'desc')
            ->paginate(10);

        return Inertia::render('Documentacion/Versiones/Index', [
            'documento' => $documento,
            'versiones' => $versiones,
        ]);
    }

    public function create(Documento $documento)
    {
        // Cargar las relaciones necesarias
        $documento->load([
            'estado',
            'area',
            'ubicacion',
            'versionVigente',
            'creador',
            'revisor1',
            'revisor2',
            'aprobador'
        ]);

        // Obtener la última versión para sugerir el número de versión
        $ultimaVersion = $documento->versiones()
            ->orderBy('numero_version', 'desc')
            ->first();

        // Obtener usuarios para selectores
        $usuarios = \App\Domain\Sistema\Configuracion\Models\User::select(
            'id',
            'name',
            'email'
        )->get();

        // Calcular la nueva versión sugerida con la misma regla del guardado
        $nuevaVersionSugerida = $this->calcularNuevaVersion($documento);

        return Inertia::render('comunes/documentacion/version-create', [
            'documento' => $documento,
            'ultimaVersion' => $ultimaVersion,
            'usuarios' => $usuarios,
            'versionSugerida' => $nuevaVersionSugerida,
            'estadoDocumento' => $documento->estado,
        ]);
    }

    public function store(Request $request, Documento $documento)
    {
        $request->validate([
            'cambios' => 'required|string|max:1000',
            'observaciones' => 'nullable|string|max:500',
            'archivo_pdf' => 'nullable|file|mimes:pdf|max:10240',
            'archivo_word' => 'nullable|file|mimes:doc,docx|max:10240',
            'revisado1_por' => 'nullable',
            'revisado2_por' => 'nullable',
            'aprobado_por' => 'nullable',
        ]);

        DB::beginTransaction();

        try {

            // Calcular nueva versión usando todas las versiones existentes
            $nuevaVersion = $this->calcularNuevaVersion($documento);

            // Crear nueva versión
            $versionData = [
                'documento_id' => $documento->id,
                'numero_version' => $nuevaVersion,
                'cambios' => $request->cambios,
                'creado_por' => auth()->id(),
                'fecha_creacion' => now(),
                'estado_id' => $this->getEstadoId('Borrador'),
            ];

            // Agregar campos opcionales
            if ($request->has('observaciones') && $request->observaciones) {
                $versionData['observaciones'] = $request->observaciones;
            }

            if ($request->revisado1_por && $request->revisado1_por !== 'null') {
                $versionData['revisado1_por'] = $request->revisado1_por;
            }

            if ($request->revisado2_por && $request->revisado2_por !== 'null') {
                $versionData['revisado2_por'] = $request->revisado2_por;
            }

            if ($request->aprobado_por && $request->aprobado_por !== 'null') {
                $versionData['aprobado_por'] = $request->aprobado_por;
            }

            $version = new VersionDocumento($versionData);

            // ============================================
            // SUBIR ARCHIVO PDF
            // ============================================

            if ($request->hasFile('archivo_pdf')) {

                $archivoPdf = $request->file('archivo_pdf');

                Log::info('Archivo PDF recibido', [
                    'nombre' => $archivoPdf->getClientOriginalName(),
                    'tamaño' => $archivoPdf->getSize(),
                    'mime' => $archivoPdf->getMimeType()
                ]);

                // Mantener nombre original y evitar duplicados
                $pdfName = $this->generarNombreUnico(
                    $archivoPdf,
                    'documentos/pdf'
                );

                // Guardar archivo
                $pdfPath = $archivoPdf->storeAs(
                    'documentos/pdf',
                    $pdfName,
                    'public'
                );

                Log::info('PDF guardado en:', [
                    'path' => $pdfPath
                ]);

                // Guardar URL
                $version->archivo_pdf_url = '/storage/' . $pdfPath;

                Log::info('URL del PDF:', [
                    'url' => $version->archivo_pdf_url
                ]);

            } else {

                Log::info('No se recibió archivo PDF');
            }

            // ============================================
            // SUBIR ARCHIVO WORD
            // ============================================

            if ($request->hasFile('archivo_word')) {

                $archivoWord = $request->file('archivo_word');

                Log::info('Archivo WORD recibido', [
                    'nombre' => $archivoWord->getClientOriginalName(),
                    'tamaño' => $archivoWord->getSize(),
                    'mime' => $archivoWord->getMimeType()
                ]);

                // Mantener nombre original y evitar duplicados
                $wordName = $this->generarNombreUnico(
                    $archivoWord,
                    'documentos/word'
                );

                // Guardar archivo
                $wordPath = $archivoWord->storeAs(
                    'documentos/word',
                    $wordName,
                    'public'
                );

                Log::info('Word guardado en:', [
                    'path' => $wordPath
                ]);

                // Guardar URL
                $version->archivo_word_url = '/storage/' . $wordPath;

                Log::info('URL del Word:', [
                    'url' => $version->archivo_word_url
                ]);
            }

            // Guardar versión
            $version->save();

            // Actualizar documento con última versión en elaboración
            $documento->ultima_version_elaboracion_id = $version->id;
            $documento->save();

            DB::commit();

            // Redireccionar a la vista del documento
            return redirect()
                ->route('documentos.show', $documento)
                ->with('success', 'Nueva versión creada exitosamente.');

        } catch (\Exception $e) {

            DB::rollBack();

            Log::error('Error al crear versión: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all(),
                'documento_id' => $documento->id,
                'user_id' => auth()->id(),
            ]);

            return back()->with(
                'error',
                'Error al crear la versión: ' . $e->getMessage()
            );
        }
    }

    public function show(Documento $documento, VersionDocumento $version)
    {
        // Cargar relaciones necesarias
        $version->load([
            'estado',
            'creador',
            'revisor1',
            'revisor2',
            'aprobador',
            'documento'
        ]);

        return Inertia::render('comunes/documentacion/version-show', [
            'documento' => $documento,
            'version' => $version,
        ]);
    }

    public function edit(Documento $documento, VersionDocumento $version)
    {
        $this->authorize('update', $version);

        return Inertia::render('Documentacion/Versiones/Edit', [
            'documento' => $documento,
            'version' => $version->load([
                'estado',
                'creador'
            ]),
        ]);
    }

    public function update(
        Request $request,
        Documento $documento,
        VersionDocumento $version
    ) {
        $this->authorize('update', $version);

        $request->validate([
            'cambios' => 'required|string|max:1000',
            'archivo_pdf' => 'nullable|file|mimes:pdf|max:10240',
            'archivo_word' => 'nullable|file|mimes:doc,docx|max:10240',
        ]);

        DB::beginTransaction();

        try {

            $version->cambios = $request->cambios;

            // ============================================
            // ACTUALIZAR ARCHIVO PDF
            // ============================================

            if ($request->hasFile('archivo_pdf')) {

                // Eliminar archivo anterior si existe
                if ($version->archivo_pdf_url) {

                    $oldPath = str_replace(
                        '/storage/',
                        '',
                        $version->archivo_pdf_url
                    );

                    Storage::disk('public')->delete($oldPath);
                }

                // Generar nombre original sin duplicar
                $pdfName = $this->generarNombreUnico(
                    $request->file('archivo_pdf'),
                    'documentos/pdf'
                );

                // Guardar nuevo archivo
                $path = $request->file('archivo_pdf')->storeAs(
                    'documentos/pdf',
                    $pdfName,
                    'public'
                );

                $version->archivo_pdf_url = '/storage/' . $path;
            }

            // ============================================
            // ACTUALIZAR ARCHIVO WORD
            // ============================================

            if ($request->hasFile('archivo_word')) {

                // Eliminar archivo anterior si existe
                if ($version->archivo_word_url) {

                    $oldPath = str_replace(
                        '/storage/',
                        '',
                        $version->archivo_word_url
                    );

                    Storage::disk('public')->delete($oldPath);
                }

                // Generar nombre original sin duplicar
                $wordName = $this->generarNombreUnico(
                    $request->file('archivo_word'),
                    'documentos/word'
                );

                // Guardar nuevo archivo
                $path = $request->file('archivo_word')->storeAs(
                    'documentos/word',
                    $wordName,
                    'public'
                );

                $version->archivo_word_url = '/storage/' . $path;
            }

            $version->save();

            DB::commit();

            return redirect()
                ->route('documentos.version.show', [
                    'documento' => $documento->id,
                    'version' => $version->id
                ])
                ->with(
                    'success',
                    'Versión actualizada exitosamente.'
                );

        } catch (\Exception $e) {

            DB::rollBack();

            return back()->with(
                'error',
                'Error al actualizar la versión: ' . $e->getMessage()
            );
        }
    }

    public function destroy(
        Documento $documento,
        VersionDocumento $version
    ) {
        $this->authorize('delete', $version);

        DB::beginTransaction();

        try {

            // ============================================
            // ELIMINAR ARCHIVO PDF
            // ============================================

            if ($version->archivo_pdf_url) {

                $path = str_replace(
                    '/storage/',
                    '',
                    $version->archivo_pdf_url
                );

                Storage::disk('public')->delete($path);
            }

            // ============================================
            // ELIMINAR ARCHIVO WORD
            // ============================================

            if ($version->archivo_word_url) {

                $path = str_replace(
                    '/storage/',
                    '',
                    $version->archivo_word_url
                );

                Storage::disk('public')->delete($path);
            }

            // ============================================
            // ELIMINAR ARCHIVO DE RECHAZO
            // ============================================

            if ($version->archivo_rechazo_url) {

                $path = str_replace(
                    '/storage/',
                    '',
                    $version->archivo_rechazo_url
                );

                Storage::disk('public')->delete($path);
            }

            // Eliminar versión
            $version->delete();

            // Actualizar referencias si es necesario
            if ($documento->ultima_version_elaboracion_id == $version->id) {

                $nuevaUltima = $documento->versiones()
                    ->orderBy('numero_version', 'desc')
                    ->first();

                $documento->ultima_version_elaboracion_id =
                    $nuevaUltima?->id;

                $documento->save();
            }

            DB::commit();

            return redirect()
                ->route('documentos.show', $documento)
                ->with(
                    'success',
                    'Versión eliminada exitosamente.'
                );

        } catch (\Exception $e) {

            DB::rollBack();

            return back()->with(
                'error',
                'Error al eliminar la versión: ' . $e->getMessage()
            );
        }
    }

    // ============================================
    // CREAR NUEVA VERSIÓN
    // ============================================

    public function crearNuevaVersion(
        Request $request,
        Documento $documento,
        VersionDocumento $version
    ) {
        $this->authorize(
            'create',
            VersionDocumento::class
        );

        $request->validate([
            'cambios' => 'required|string|max:1000',
        ]);

        DB::beginTransaction();

        try {

            // Crear nueva versión basada en la actual
            $nuevaVersion = $version->replicate();

            $nuevaVersion->numero_version =
                $this->calcularNuevaVersion($documento);

            $nuevaVersion->cambios = $request->cambios;
            $nuevaVersion->creado_por = auth()->id();
            $nuevaVersion->fecha_creacion = now();

            $nuevaVersion->estado_id =
                Estado::where('nombre', 'Borrador')
                    ->first()
                    ->id;

            $nuevaVersion->revisado1_por = null;
            $nuevaVersion->revisado2_por = null;
            $nuevaVersion->aprobado_por = null;
            $nuevaVersion->fecha_revision = null;
            $nuevaVersion->fecha_aprobado = null;
            $nuevaVersion->observaciones = null;

            $nuevaVersion->save();

            // Actualizar documento
            $documento->ultima_version_elaboracion_id =
                $nuevaVersion->id;

            $documento->save();

            DB::commit();

            return redirect()
                ->route('documentos.version.show', [
                    'documento' => $documento->id,
                    'version' => $nuevaVersion->id
                ])
                ->with(
                    'success',
                    'Nueva versión de desarrollo creada.'
                );

        } catch (\Exception $e) {

            DB::rollBack();

            return back()->with(
                'error',
                'Error al crear nueva versión: ' .
                $e->getMessage()
            );
        }
    }

    // ============================================
    // ENVIAR A REVISIÓN
    // ============================================

    public function enviarRevision(
        Request $request,
        Documento $documento,
        VersionDocumento $version
    ) {
        $version->creado_por = auth()->id();
        $version->fecha_creacion = now();
        $version->estado_id = $this->getEstadoId('Pendiente');

        $version->save();

        return back()->with(
            'success',
            'Versión enviada a revisión.'
        );
    }

    // ============================================
    // MARCAR COMO REVISADO
    // ============================================

    public function marcarRevisado(
        Request $request,
        Documento $documento,
        VersionDocumento $version
    ) {
        if ($version->revisado1_por == null) {

            $version->revisado1_por = auth()->id();

        } else {

            $version->revisado2_por = auth()->id();
        }

        $version->estado_id =
            $this->getEstadoId('Revisado');

        $version->fecha_revision = now();

        $version->save();

        return back()->with(
            'success',
            'Versión marcada como revisada.'
        );
    }

    // ============================================
    // RECHAZAR
    // ============================================

    public function rechazar(
        Request $request,
        Documento $documento,
        VersionDocumento $version
    ) {
        $request->validate([
            'observaciones' => 'required|string|max:500',
            'archivo_rechazo' => 'nullable|file|mimes:doc,docx,pdf|max:10240',
        ]);

        DB::beginTransaction();

        try {

            $version->observaciones = $request->observaciones;

            $version->estado_id =
                $this->getEstadoId('Rechazado');

            // ============================================
            // SUBIR ARCHIVO DE RECHAZO/CORRECCIONES
            // ============================================

            if ($request->hasFile('archivo_rechazo')) {

                $archivoRechazo =
                    $request->file('archivo_rechazo');

                Log::info('Archivo RECHAZO recibido', [
                    'nombre' =>
                        $archivoRechazo->getClientOriginalName(),
                    'tamaño' =>
                        $archivoRechazo->getSize(),
                    'mime' =>
                        $archivoRechazo->getMimeType()
                ]);

                // Generar nombre original y evitar duplicados
                $rechazoName = $this->generarNombreUnico(
                    $archivoRechazo,
                    'documentos/rechazo'
                );

                // Guardar archivo
                $rechazoPath = $archivoRechazo->storeAs(
                    'documentos/rechazo',
                    $rechazoName,
                    'public'
                );

                Log::info('Rechazo guardado en:', [
                    'path' => $rechazoPath
                ]);

                $version->archivo_rechazo_url =
                    '/storage/' . $rechazoPath;

                Log::info('URL del Rechazo:', [
                    'url' =>
                        $version->archivo_rechazo_url
                ]);
            }

            $version->save();

            DB::commit();

            return back()->with(
                'success',
                'Versión rechazada con observaciones.'
            );

        } catch (\Exception $e) {

            DB::rollBack();

            Log::error(
                'Error al rechazar versión: ' .
                $e->getMessage(),
                [
                    'exception' => $e,
                    'documento_id' => $documento->id,
                    'version_id' => $version->id,
                ]
            );

            return back()->with(
                'error',
                'Error al rechazar la versión: ' .
                $e->getMessage()
            );
        }
    }

    // ============================================
    // APROBAR
    // ============================================

    public function aprobar(
        Request $request,
        Documento $documento,
        VersionDocumento $version
    ) {
        $version->aprobado_por = auth()->id();

        $version->estado_id =
            $this->getEstadoId('Aprobado');

        $version->fecha_aprobado = now();

        $version->save();

        // Publicar como versión vigente
        $documento->version_vigente_id = $version->id;

        // Si es una versión de desarrollo
        if (strpos($version->numero_version, '.') !== false) {

            $partes = explode(
                '.',
                $version->numero_version
            );

            $parteEntera = (int) $partes[0];

            // Si es 0.x pasa a 1.0
            // Si ya es mayor se incrementa la parte entera
            $nuevaVersion =
                ($parteEntera === 0)
                    ? '1.0'
                    : (($parteEntera + 1) . '.0');

            // Crear versión final
            $versionFinal = $version->replicate();

            $versionFinal->numero_version =
                $nuevaVersion;

            $versionFinal->save();

            $documento->version_vigente_id =
                $versionFinal->id;
        }

        $documento->save();

        return back()->with(
            'success',
            'Versión aprobada y publicada como vigente.'
        );
    }

    // ============================================
    // PUBLICAR
    // ============================================

    public function publicar(
        Documento $documento,
        VersionDocumento $version
    ) {
        // Verificar que la versión esté aprobada
        if ($version->estado->nombre !== 'aprobado') {

            return back()->with(
                'error',
                'Solo se pueden publicar versiones aprobadas.'
            );
        }

        // Publicar como versión vigente
        $documento->version_vigente_id = $version->id;

        // Si es una versión de desarrollo
        if (strpos($version->numero_version, '.') !== false) {

            $partes = explode(
                '.',
                $version->numero_version
            );

            $parteEntera = (int) $partes[0];

            $nuevaVersion =
                ($parteEntera === 0)
                    ? '1.0'
                    : (($parteEntera + 1) . '.0');

            // Crear versión final
            $versionFinal = $version->replicate();

            $versionFinal->numero_version =
                $nuevaVersion;

            $versionFinal->save();

            $documento->version_vigente_id =
                $versionFinal->id;
        }

        $documento->save();

        return back()->with(
            'success',
            'Versión publicada como vigente.'
        );
    }

    // ============================================
    // PREVISUALIZAR PDF
    // ============================================

    public function previsualizar(
        Documento $documento,
        VersionDocumento $version
    ) {
        $this->authorize('view', $version);

        if (!$version->archivo_pdf_url) {

            return response()->json([
                'error' =>
                    'No hay archivo PDF para previsualizar'
            ], 404);
        }

        $path = str_replace(
            '/storage/',
            '',
            $version->archivo_pdf_url
        );

        return Storage::disk('public')->response($path);
    }

    // ============================================
    // MÉTODO PARA GENERAR NOMBRE ÚNICO
    // ============================================

    private function generarNombreUnico(
        $archivo,
        string $directorio
    ): string {

        // Obtener nombre original sin extensión
        $nombreOriginal = pathinfo(
            $archivo->getClientOriginalName(),
            PATHINFO_FILENAME
        );

        // Obtener extensión
        $extension = strtolower(
            $archivo->getClientOriginalExtension()
        );

        // Limpiar espacios innecesarios
        $nombreOriginal = trim($nombreOriginal);

        // Primer nombre que intentaremos utilizar
        $nombre = $nombreOriginal . '.' . $extension;

        $contador = 1;

        // Mientras exista un archivo con ese nombre
        while (
            Storage::disk('public')->exists(
                $directorio . '/' . $nombre
            )
        ) {

            $nombre =
                $nombreOriginal .
                ' (' . $contador . ').' .
                $extension;

            $contador++;
        }

        return $nombre;
    }

    // ============================================
    // CALCULAR NUEVA VERSIÓN
    // ============================================

    private function calcularNuevaVersion(Documento $documento): string
    {
        $versiones = $documento->versiones()
            ->with('estado')
            ->get();

        $mayorAprobada = 0;

        foreach ($versiones as $version) {
            $estado = strtolower(trim((string) optional($version->estado)->nombre));

            if (!in_array($estado, ['aprobado', 'vigente'], true)) {
                continue;
            }

            [$mayor] = $this->separarVersion($version->numero_version);
            $mayorAprobada = max($mayorAprobada, $mayor);
        }

        $menorActual = -1;

        foreach ($versiones as $version) {
            [$mayor, $menor] = $this->separarVersion($version->numero_version);

            if ($mayor === $mayorAprobada) {
                $menorActual = max($menorActual, $menor);
            }
        }

        return $mayorAprobada . '.' . ($menorActual + 1);
    }

    private function separarVersion(string $numeroVersion): array
    {
        $partes = explode('.', trim($numeroVersion), 2);

        return [
            (int) ($partes[0] ?? 0),
            (int) ($partes[1] ?? 0),
        ];
    }

    // ============================================
    // OBTENER ID DEL ESTADO
    // ============================================

    private function getEstadoId(string $nombreEstado): int
    {
        return Estado::firstOrCreate(
            ['nombre' => $nombreEstado],
            [
                'descripcion' =>
                    'Generado automáticamente',
                'color' => '#9ca3af'
            ]
        )->id;
    }
}