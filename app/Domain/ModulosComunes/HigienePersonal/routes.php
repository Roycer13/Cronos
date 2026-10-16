

<?php

use App\Domain\ModulosComunes\HigienePersonal\Http\Controllers\ControlVisitaController;
use Illuminate\Support\Facades\Route;
use App\Domain\ModulosComunes\HigienePersonal\Http\Controllers\HigienePersonalController;
use App\Domain\ModulosComunes\HigienePersonal\Http\Controllers\inspeccionCasillerosController;
use App\Domain\ModulosComunes\HigienePersonal\Http\Controllers\DotacionGuanteController;

use App\Http\Middleware\AdminOrPermission;

// Grupo de rutas para Higiene Personal
Route::middleware(['auth'])->prefix('higiene')->group(function () {

    // Rutas principales de Higiene Personal
    Route::name('higiene-personal.')->group(function () {
        Route::get('/', [HigienePersonalController::class, 'index'])
            ->name('index')
            ->middleware(AdminOrPermission::class . ':r_higienePersonal');
        Route::get('/pdf', [HigienePersonalController::class, 'pdf'])->name('pdf');

        Route::post('/', [HigienePersonalController::class, 'store'])
            ->name('store')
            ->middleware(AdminOrPermission::class . ':c_higienePersonal');

        Route::put('/{higienePersonal}', [HigienePersonalController::class, 'update'])
            ->name('update')
            ->middleware(AdminOrPermission::class . ':u_higienePersonal');

        Route::delete('/{higienePersonal}', [HigienePersonalController::class, 'destroy'])
            ->name('destroy')
            ->middleware(AdminOrPermission::class . ':d_higienePersonal');

        Route::get('/buscar-empleados', [HigienePersonalController::class, 'buscarEmpleados'])
            ->name('buscar-empleados')
            ->middleware(AdminOrPermission::class . ':r_higienePersonal');

        Route::get('/reporte', [HigienePersonalController::class, 'reporte'])
            ->name('reporte')
            ->middleware(AdminOrPermission::class . ':r_higienePersonal');

        Route::get('/exportar', [HigienePersonalController::class, 'exportar'])
            ->name('exportar')
            ->middleware(AdminOrPermission::class . ':r_higienePersonal');

        Route::get('/registro-rapido', [HigienePersonalController::class, 'registroRapido'])
            ->name('registro-rapido')
            ->middleware(AdminOrPermission::class . ':c_higienePersonal');

        Route::post('/store-rapido', [HigienePersonalController::class, 'storeRapido'])
            ->name('store-rapido')
            ->middleware(AdminOrPermission::class . ':c_higienePersonal');
    });

    // Rutas de Control de Visitas
    Route::prefix('control-visitas')->name('control-visitas.')->group(function () {
        Route::get('/', [ControlVisitaController::class, 'index'])
            ->name('index')
            ->middleware(AdminOrPermission::class . ':r_controlVisitas');

        Route::post('/', [ControlVisitaController::class, 'store'])
            ->name('store')
            ->middleware(AdminOrPermission::class . ':r_controlVisitas');
        Route::get('/pdf', [ControlVisitaController::class, 'pdf'])->name('pdf');

        Route::put('/{controlVisita}', [ControlVisitaController::class, 'update'])
            ->name('update')
            ->middleware(AdminOrPermission::class . ':u_controlVisitas');

        Route::delete('/{controlVisita}', [ControlVisitaController::class, 'destroy'])
            ->name('destroy')
            ->middleware(AdminOrPermission::class . ':d_controlVisitas');

        Route::post('/{controlVisita}/salida', [ControlVisitaController::class, 'registrarSalida'])
            ->name('registrar-salida')
            ->middleware(AdminOrPermission::class . ':u_controlVisitas');
    });

    // Rutas de Inspección de Casilleros
    Route::prefix('inspeccion-casilleros')->name('inspeccion-casilleros.')->group(function () {
        Route::get('/', [inspeccionCasillerosController::class, 'index'])
            ->name('index')
            ->middleware(AdminOrPermission::class . ':r_inspeccionCasilleros');

        Route::post('/', [inspeccionCasillerosController::class, 'store'])
            ->name('store')
            ->middleware(AdminOrPermission::class . ':c_inspeccionCasilleros');



        Route::put('/{inspeccionCasillero}', [inspeccionCasillerosController::class, 'update'])
            ->name('update')
            ->middleware(AdminOrPermission::class . ':u_inspeccionCasilleros');

        Route::delete('/{inspeccionCasillero}', [inspeccionCasillerosController::class, 'destroy'])
            ->name('destroy')
            ->middleware(AdminOrPermission::class . ':d_inspeccionCasilleros');

        Route::get('/registro-rapido', [inspeccionCasillerosController::class, 'registroRapido'])
            ->name('registro-rapido')
            ->middleware(AdminOrPermission::class . ':c_inspeccionCasilleros');
        Route::get('/pdf', [inspeccionCasillerosController::class, 'pdf'])
            ->name('pdf')
            ->middleware(AdminOrPermission::class . ':r_inspeccionCasilleros');
    });

    // Rutas de Dotación de Guantes
    Route::prefix('dotacion-guantes')->name('dotacion-guantes.')->group(function () {
        Route::get('/', [DotacionGuanteController::class, 'index'])
            ->name('index')
            ->middleware(AdminOrPermission::class . ':r_dotacionGuantes');

        Route::get('/pdf', [DotacionGuanteController::class, 'pdf'])->name('pdf');

        Route::post('/', [DotacionGuanteController::class, 'store'])
            ->name('store')
            ->middleware(AdminOrPermission::class . ':c_dotacionGuantes');

        Route::put('/{dotacionGuante}', [DotacionGuanteController::class, 'update'])
            ->name('update')
            ->middleware(AdminOrPermission::class . ':u_dotacionGuantes');

        Route::delete('/{dotacionGuante}', [DotacionGuanteController::class, 'destroy'])
            ->name('destroy')
            ->middleware(AdminOrPermission::class . ':d_dotacionGuantes');

        Route::post('/{dotacionGuante}/devolver', [DotacionGuanteController::class, 'devolver'])->name('devolver');
    });
});
