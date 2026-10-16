<?php

use Illuminate\Support\Facades\Route;

use App\Domain\ModulosComunes\Documentacion\Http\Controllers\DocumentoController;
use App\Domain\ModulosComunes\Documentacion\Http\Controllers\SolicitudDocumentoController;
use App\Domain\ModulosComunes\Documentacion\Http\Controllers\VersionDocumentoController;
use App\Http\Middleware\AdminOrPermission;

Route::prefix('documentacion')->group(function () {
   // Administración de Documentos - Rutas individuales
Route::get('administracion', [DocumentoController::class, 'index'])
    ->name('documentos.index')
    ->middleware(AdminOrPermission::class . ':r_documentacionAdministracion');

Route::get('administracion/navegar/{documento?}', [DocumentoController::class, 'navegar'])
    ->name('documentos.navegar')
    ->middleware(AdminOrPermission::class . ':r_documentacionAdministracion');

Route::get('administracion/crear', [DocumentoController::class, 'create'])
    ->name('documentos.create')
    ->middleware(AdminOrPermission::class . ':c_documentacionAdministracion');

Route::post('administracion', [DocumentoController::class, 'store'])
    ->name('documentos.store')
    ->middleware(AdminOrPermission::class . ':c_documentacionAdministracion');

Route::get('administracion/{documento}', [DocumentoController::class, 'show'])
    ->name('documentos.show')
    ->middleware(AdminOrPermission::class . ':r_documentacionAdministracion');

Route::get('administracion/{documento}/editar', [DocumentoController::class, 'edit'])
    ->name('documentos.edit')
    ->middleware(AdminOrPermission::class . ':u_documentacionAdministracion');

Route::put('administracion/{documento}', [DocumentoController::class, 'update'])
    ->name('documentos.update')
    ->middleware(AdminOrPermission::class . ':u_documentacionAdministracion');

Route::delete('administracion/{documento}', [DocumentoController::class, 'destroy'])
    ->name('documentos.destroy')
    ->middleware(AdminOrPermission::class . ':d_documentacionAdministracion');
    // Rutas para versionamiento (anidadas en documentos)
    Route::prefix('administracion/{documento}')->group(function () {
        Route::resource('versiones', VersionDocumentoController::class)
            ->only(['create', 'show', 'store', 'destroy'])
            ->names([
                'index' => 'documentos.versiones.index',
                'store' => 'documentos.versiones.store',
                'edit' => 'documentos.versiones.edit',
                'update' => 'documentos.versiones.update',
                'destroy' => 'documentos.versiones.destroy',
            ])
            ->parameters(['versiones' => 'version']);

        // Rutas para el flujo de versiones
        Route::post('versiones/{version}/crear-nueva', [VersionDocumentoController::class, 'crearNuevaVersion'])
            ->name('documentos.versiones.crear-nueva');

        Route::post('versiones/{version}/enviar-revision', [VersionDocumentoController::class, 'enviarRevision'])
            ->name('documentos.versiones.enviar-revision');

        Route::post('versiones/{version}/marcar-revisado', [VersionDocumentoController::class, 'marcarRevisado'])
            ->name('documentos.versiones.marcar-revisado');

        Route::post('versiones/{version}/rechazar', [VersionDocumentoController::class, 'rechazar'])
            ->name('documentos.versiones.rechazar');

        Route::post('versiones/{version}/aprobar', [VersionDocumentoController::class, 'aprobar'])
            ->name('documentos.versiones.aprobar');

        Route::post('versiones/{version}/publicar', [VersionDocumentoController::class, 'publicar'])
            ->name('documentos.versiones.publicar');

        Route::get('versiones/{version}/previsualizar', [VersionDocumentoController::class, 'previsualizar'])
            ->name('documentos.versiones.previsualizar');

        // Vista para ver versiones específica
        Route::get('version/{version}', [DocumentoController::class, 'showVersion'])
            ->name('documentos.version.show');
    });

    Route::get('solicitudes', [SolicitudDocumentoController::class, 'index'])
    ->name('solicitudDocumentacion.index')
    ->middleware(AdminOrPermission::class . ':r_documentacionSolicitud');

Route::get('solicitudes/crear', [SolicitudDocumentoController::class, 'create'])
    ->name('solicitudDocumentacion.create')
    ->middleware(AdminOrPermission::class . ':c_documentacionSolicitud');

Route::post('solicitudes', [SolicitudDocumentoController::class, 'store'])
    ->name('solicitudDocumentacion.store')
    ->middleware(AdminOrPermission::class . ':c_documentacionSolicitud');

Route::get('solicitudes/{solicitudDocumentacion}', [SolicitudDocumentoController::class, 'show'])
    ->name('solicitudDocumentacion.show')
    ->middleware(AdminOrPermission::class . ':r_documentacionSolicitud');

Route::get('solicitudes/{solicitudDocumentacion}/editar', [SolicitudDocumentoController::class, 'edit'])
    ->name('solicitudDocumentacion.edit')
    ->middleware(AdminOrPermission::class . ':u_documentacionSolicitud');

Route::put('solicitudes/{solicitudDocumentacion}', [SolicitudDocumentoController::class, 'update'])
    ->name('solicitudDocumentacion.update')
    ->middleware(AdminOrPermission::class . ':u_documentacionSolicitud');

Route::delete('solicitudes/{solicitudDocumentacion}', [SolicitudDocumentoController::class, 'destroy'])
    ->name('solicitudDocumentacion.destroy')
    ->middleware(AdminOrPermission::class . ':d_documentacionSolicitud');

    // Rutas adicionales para aprobar y rechazar
    Route::post(
        'solicitudes/{solicitudDocumentacion}/aprobar',
        [SolicitudDocumentoController::class, 'approve']
    )
        ->name('solicitudDocumentacion.aprobar');

    Route::post(
        'solicitudes/{solicitudDocumentacion}/rechazar',
        [SolicitudDocumentoController::class, 'reject']
    )
        ->name('solicitudDocumentacion.rechazar');
});
