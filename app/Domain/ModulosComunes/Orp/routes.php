<?php

use App\Domain\ModulosComunes\Orp\Http\Controllers\OrpController;
use App\Http\Middleware\AdminOrPermission;
use Illuminate\Support\Facades\Route;

// Rutas adicionales para ORPs (DEBEN IR ANTES del resource)
Route::prefix('orps')->name('orps.')->group(function () {
    Route::get('kanban', [OrpController::class, 'kanban'])->name('kanban');
    Route::post('importar', [OrpController::class, 'importar'])->name('importar')
        ->middleware(AdminOrPermission::class . ':c_orp');
    Route::get('{orp}/historial-estados', [OrpController::class, 'historialEstados'])->name('historial-estados');
    Route::post('{orp}/cambiar-estado', [OrpController::class, 'cambiarEstado'])->name('cambiar-estado')
        ->middleware(AdminOrPermission::class . ':u_orp');
    Route::patch('{orp}/actualizar-cantidad-producida', [OrpController::class, 'actualizarCantidadProducida'])->name('actualizar-cantidad-producida');
});

// ORPs - CON RESOURCE (DEBE IR DESPUÉS)
// ORPs - Rutas individuales
Route::get('orps', [OrpController::class, 'index'])
    ->name('orps.index')
    ->middleware(AdminOrPermission::class . ':r_orp');

Route::get('orps/crear', [OrpController::class, 'create'])
    ->name('orps.create')
    ->middleware(AdminOrPermission::class . ':c_orp');

Route::post('orps', [OrpController::class, 'store'])
    ->name('orps.store')
    ->middleware(AdminOrPermission::class . ':c_orp');

Route::get('orps/{orp}', [OrpController::class, 'show'])
    ->name('orps.show')
    ->middleware(AdminOrPermission::class . ':r_orp');

Route::get('orps/{orp}/editar', [OrpController::class, 'edit'])
    ->name('orps.edit')
    ->middleware(AdminOrPermission::class . ':u_orp');

Route::put('orps/{orp}', [OrpController::class, 'update'])
    ->name('orps.update')
    ->middleware(AdminOrPermission::class . ':u_orp');

Route::delete('orps/{orp}', [OrpController::class, 'destroy'])
    ->name('orps.destroy')
    ->middleware(AdminOrPermission::class . ':d_orp');
Route::post('/orps/{orp}/completar', [OrpController::class, 'completar'])->name('orps.completar');
Route::post('/orps/{orp}/pausar', [OrpController::class, 'pausar'])->name('orps.pausar');
