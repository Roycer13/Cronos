<?php

use Illuminate\Support\Facades\Route;

// Rutas del módulo app/Domain/ModulosComunes/Old
use App\Domain\ModulosComunes\Old\Http\Controllers\OldAreaController;
use App\Domain\ModulosComunes\Old\Http\Controllers\OldEnvasadoraHtstController;
use App\Domain\ModulosComunes\Old\Http\Controllers\OldSubareaController;
use App\Domain\ModulosComunes\Old\Http\Controllers\OldItemController;
use App\Domain\ModulosComunes\Old\Http\Controllers\OldRegistroController;
use App\Domain\ModulosComunes\Old\Http\Controllers\OldDistribucionCarroController;

use App\Http\Middleware\AdminOrPermission;

Route::prefix('old')->group(function () {

    // 🔹 AREAS
    Route::get('areas', [OldAreaController::class, 'index'])
        ->name('old-areas.index')
        ->middleware(AdminOrPermission::class . ':r_oldAreas');

    Route::get('areas/create', [OldAreaController::class, 'create'])
        ->name('old-areas.create')
        ->middleware(AdminOrPermission::class . ':c_oldAreas');

    Route::post('areas', [OldAreaController::class, 'store'])
        ->name('old-areas.store')
        ->middleware(AdminOrPermission::class . ':c_oldAreas');

    Route::get('areas/{oldArea}/edit', [OldAreaController::class, 'edit'])
        ->name('old-areas.edit')
        ->middleware(AdminOrPermission::class . ':u_oldAreas');

    Route::put('areas/{oldArea}', [OldAreaController::class, 'update'])
        ->name('old-areas.update')
        ->middleware(AdminOrPermission::class . ':u_oldAreas');

    Route::delete('areas/{oldArea}', [OldAreaController::class, 'destroy'])
        ->name('old-areas.destroy')
        ->middleware(AdminOrPermission::class . ':d_oldAreas');

    // 🔹 SUBAREAS
    Route::get('subareas', [OldSubareaController::class, 'index'])
        ->name('old-subareas.index')
        ->middleware(AdminOrPermission::class . ':r_oldSubareas');

    Route::get('subareas/create', [OldSubareaController::class, 'create'])
        ->name('old-subareas.create')
        ->middleware(AdminOrPermission::class . ':c_oldSubareas');

    Route::post('subareas', [OldSubareaController::class, 'store'])
        ->name('old-subareas.store')
        ->middleware(AdminOrPermission::class . ':c_oldSubareas');

    Route::get('subareas/{oldSubarea}/edit', [OldSubareaController::class, 'edit'])
        ->name('old-subareas.edit')
        ->middleware(AdminOrPermission::class . ':u_oldSubareas');

    Route::put('subareas/{oldSubarea}', [OldSubareaController::class, 'update'])
        ->name('old-subareas.update')
        ->middleware(AdminOrPermission::class . ':u_oldSubareas');

    Route::delete('subareas/{oldSubarea}', [OldSubareaController::class, 'destroy'])
        ->name('old-subareas.destroy')
        ->middleware(AdminOrPermission::class . ':d_oldSubareas');

    // 🔹 ITEMS
    Route::get('items', [OldItemController::class, 'index'])
        ->name('old-items.index')
        ->middleware(AdminOrPermission::class . ':r_oldItems');

    Route::get('items/create', [OldItemController::class, 'create'])
        ->name('old-items.create')
        ->middleware(AdminOrPermission::class . ':c_oldItems');

    Route::post('items', [OldItemController::class, 'store'])
        ->name('old-items.store')
        ->middleware(AdminOrPermission::class . ':c_oldItems');

    Route::get('items/{oldItem}/edit', [OldItemController::class, 'edit'])
        ->name('old-items.edit')
        ->middleware(AdminOrPermission::class . ':u_oldItems');

    Route::put('items/{oldItem}', [OldItemController::class, 'update'])
        ->name('old-items.update')
        ->middleware(AdminOrPermission::class . ':u_oldItems');

    Route::delete('items/{oldItem}', [OldItemController::class, 'destroy'])
        ->name('old-items.destroy')
        ->middleware(AdminOrPermission::class . ':d_oldItems');

    Route::get('/reporte', [OldItemController::class, 'reporte'])
        ->name('old-items.reporte')
        ->middleware(AdminOrPermission::class . ':r_oldItems');

    // 🔹 REGISTROS
    Route::get('registros', [OldRegistroController::class, 'index'])
        ->name('old-registros.index')
        ->middleware(AdminOrPermission::class . ':r_oldRegistros');

    Route::get('registros/create', [OldRegistroController::class, 'create'])
        ->name('old-registros.create')
        ->middleware(AdminOrPermission::class . ':c_oldRegistros');

    Route::post('registros', [OldRegistroController::class, 'store'])
        ->name('old-registros.store')
        ->middleware(AdminOrPermission::class . ':c_oldRegistros');

    Route::delete('registros/{oldRegistro}', [OldRegistroController::class, 'destroy'])
        ->name('old-registros.destroy')
        ->middleware(AdminOrPermission::class . ':d_oldRegistros');

    Route::get('registros/items-dia', [OldRegistroController::class, 'itemsPorDia'])
        ->name('old-registros.items-dia')
        ->middleware(AdminOrPermission::class . ':r_oldRegistros');

    Route::get('registros/debug', [OldRegistroController::class, 'debug'])
        ->name('old-registros.debug')
        ->middleware(AdminOrPermission::class . ':r_oldRegistros');

    // 📊 REPORTES
    Route::get('registros/reporte', [OldRegistroController::class, 'reporte'])
        ->name('old-registros.reporte')
        ->middleware(AdminOrPermission::class . ':r_oldRegistros');
    Route::get('/old-registros/reporte-resumido', [OldRegistroController::class, 'reporteResumido'])
        ->name('old-registros.reporte-resumido');
    Route::get('/old-registros/reporte-resumido-data', [OldRegistroController::class, 'reporteResumidoData'])
        ->name('old-registros.reporte-resumido-data');
    // 🔹 ENVASADORAS
    Route::get('envasadoras', [OldEnvasadoraHtstController::class, 'index'])
        ->name('old-envasadoras.index')
        ->middleware(AdminOrPermission::class . ':r_oldEnvasadoras');

    Route::get('envasadoras/create', [OldEnvasadoraHtstController::class, 'create'])
        ->name('old-envasadoras.create')
        ->middleware(AdminOrPermission::class . ':c_oldEnvasadoras');

    Route::post('envasadoras', [OldEnvasadoraHtstController::class, 'store'])
        ->name('old-envasadoras.store')
        ->middleware(AdminOrPermission::class . ':c_oldEnvasadoras');

    Route::get('envasadoras/{oldEnvasadoraHtst}/edit', [OldEnvasadoraHtstController::class, 'edit'])
        ->name('old-envasadoras.edit')
        ->middleware(AdminOrPermission::class . ':u_oldEnvasadoras');

    Route::put('envasadoras/{oldEnvasadoraHtst}', [OldEnvasadoraHtstController::class, 'update'])
        ->name('old-envasadoras.update')
        ->middleware(AdminOrPermission::class . ':u_oldEnvasadoras');

    Route::delete('envasadoras/{oldEnvasadoraHtst}', [OldEnvasadoraHtstController::class, 'destroy'])
        ->name('old-envasadoras.destroy')
        ->middleware(AdminOrPermission::class . ':d_oldEnvasadoras');

    // 🔹 DISTRIBUCION CARROS
    Route::get('distribucion-carros', [OldDistribucionCarroController::class, 'index'])
        ->name('old-distribucion-carros.index')
        ->middleware(AdminOrPermission::class . ':r_oldDistribucionCarros');

    Route::get('distribucion-carros/create', [OldDistribucionCarroController::class, 'create'])
        ->name('old-distribucion-carros.create')
        ->middleware(AdminOrPermission::class . ':c_oldDistribucionCarros');

    Route::post('distribucion-carros', [OldDistribucionCarroController::class, 'store'])
        ->name('old-distribucion-carros.store')
        ->middleware(AdminOrPermission::class . ':c_oldDistribucionCarros');

    Route::get('distribucion-carros/{oldDistribucionCarro}/edit', [OldDistribucionCarroController::class, 'edit'])
        ->name('old-distribucion-carros.edit')
        ->middleware(AdminOrPermission::class . ':u_oldDistribucionCarros');

    Route::put('distribucion-carros/{oldDistribucionCarro}', [OldDistribucionCarroController::class, 'update'])
        ->name('old-distribucion-carros.update')
        ->middleware(AdminOrPermission::class . ':u_oldDistribucionCarros');

    Route::delete('distribucion-carros/{oldDistribucionCarro}', [OldDistribucionCarroController::class, 'destroy'])
        ->name('old-distribucion-carros.destroy')
        ->middleware(AdminOrPermission::class . ':d_oldDistribucionCarros');

    Route::get('distribucion-carros/reporte/generar', [OldDistribucionCarroController::class, 'reporte'])
        ->name('old-distribucion-carros.reporte')
        ->middleware(AdminOrPermission::class . ':r_oldDistribucionCarros');
    Route::get('distribucion-carros/pdf', [OldDistribucionCarroController::class, 'pdf'])
        ->name('old-distribucion-carros.pdf')
        ->middleware(AdminOrPermission::class . ':r_oldDistribucionCarros');
});
