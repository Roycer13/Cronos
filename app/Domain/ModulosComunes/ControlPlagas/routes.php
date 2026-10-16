<?php

use Illuminate\Support\Facades\Route;
use App\Domain\ModulosComunes\ControlPlagas\Http\Controllers\BarreraPlagaController;
use App\Domain\ModulosComunes\ControlPlagas\Http\Controllers\ControlBarreraController;
use App\Domain\ModulosComunes\ControlPlagas\Http\Controllers\PresenciaVectorController;
use App\Domain\ModulosComunes\ControlPlagas\Http\Controllers\TrampaController;
use App\Domain\ModulosComunes\ControlPlagas\Http\Controllers\ControlTrampaController;
use App\Domain\ModulosComunes\ControlPlagas\Http\Controllers\ArranqueFumigacionController;
use App\Domain\ModulosComunes\ControlPlagas\Http\Controllers\InsectocaptorController;
use App\Domain\ModulosComunes\ControlPlagas\Http\Controllers\RegistroInsectoController;

// ─── Módulo Plagas ────────────────────────────────────────────────────────────
use App\Http\Middleware\AdminOrPermission;

// ─── Módulo Plagas ────────────────────────────────────────────────────────────
Route::prefix('plagas')->name('plagas.')->middleware(['auth'])->group(function () {

    // Barreras de plagas (catálogo)
    Route::get('barreras', [BarreraPlagaController::class, 'index'])
        ->name('barreras.index')
        ->middleware(AdminOrPermission::class . ':r_plagas_barreras');
    Route::post('barreras', [BarreraPlagaController::class, 'store'])
        ->name('barreras.store')
        ->middleware(AdminOrPermission::class . ':c_plagas_barreras');
    Route::put('barreras/{barrera}', [BarreraPlagaController::class, 'update'])
        ->name('barreras.update')
        ->middleware(AdminOrPermission::class . ':u_plagas_barreras');
    Route::delete('barreras/{barrera}', [BarreraPlagaController::class, 'destroy'])
        ->name('barreras.destroy')
        ->middleware(AdminOrPermission::class . ':d_plagas_barreras');

    // Control de barreras (registros)
    Route::get('control-barreras', [ControlBarreraController::class, 'index'])
        ->name('control-barreras.index')
        ->middleware(AdminOrPermission::class . ':r_plagas_control_barreras');
    Route::post('control-barreras', [ControlBarreraController::class, 'store'])
        ->name('control-barreras.store')
        ->middleware(AdminOrPermission::class . ':c_plagas_control_barreras');
    Route::put('control-barreras/{control_barrera}', [ControlBarreraController::class, 'update'])
        ->name('control-barreras.update')
        ->middleware(AdminOrPermission::class . ':u_plagas_control_barreras');
    Route::delete('control-barreras/{control_barrera}', [ControlBarreraController::class, 'destroy'])
        ->name('control-barreras.destroy')
        ->middleware(AdminOrPermission::class . ':d_plagas_control_barreras');

    Route::get('control-barreras/registro-rapido', [ControlBarreraController::class, 'registroRapido'])
        ->name('control-barreras.registro-rapido')
        ->middleware(AdminOrPermission::class . ':c_plagas_control_barreras');
    Route::post('control-barreras/store-rapido', [ControlBarreraController::class, 'storeRapido'])
        ->name('control-barreras.store-rapido')
        ->middleware(AdminOrPermission::class . ':c_plagas_control_barreras');

    // Presencia de vectores
    Route::get('presencia-vectores', [PresenciaVectorController::class, 'index'])
        ->name('presencia-vectores.index')
        ->middleware(AdminOrPermission::class . ':r_plagas_presencia_vectores');
    Route::post('presencia-vectores', [PresenciaVectorController::class, 'store'])
        ->name('presencia-vectores.store')
        ->middleware(AdminOrPermission::class . ':c_plagas_presencia_vectores');
    Route::put('presencia-vectores/{presencia_vector}', [PresenciaVectorController::class, 'update'])
        ->name('presencia-vectores.update')
        ->middleware(AdminOrPermission::class . ':u_plagas_presencia_vectores');
    Route::delete('presencia-vectores/{presencia_vector}', [PresenciaVectorController::class, 'destroy'])
        ->name('presencia-vectores.destroy')
        ->middleware(AdminOrPermission::class . ':d_plagas_presencia_vectores');
    Route::get('presencia-vectores/pdf', [PresenciaVectorController::class, 'pdf'])
        ->name('presencia-vectores.pdf')
        ->middleware(AdminOrPermission::class . ':r_plagas_presencia_vectores');

    // Trampas (catálogo)
    Route::get('trampas', [TrampaController::class, 'index'])
        ->name('trampas.index')
        ->middleware(AdminOrPermission::class . ':r_plagas_trampas');
    Route::post('trampas', [TrampaController::class, 'store'])
        ->name('trampas.store')
        ->middleware(AdminOrPermission::class . ':c_plagas_trampas');
    Route::put('trampas/{trampa}', [TrampaController::class, 'update'])
        ->name('trampas.update')
        ->middleware(AdminOrPermission::class . ':u_plagas_trampas');
    Route::delete('trampas/{trampa}', [TrampaController::class, 'destroy'])
        ->name('trampas.destroy')
        ->middleware(AdminOrPermission::class . ':d_plagas_trampas');

    // Control de trampas (inspecciones)
    Route::get('control-trampas', [ControlTrampaController::class, 'index'])
        ->name('control-trampas.index')
        ->middleware(AdminOrPermission::class . ':r_plagas_control_trampas');
    Route::post('control-trampas', [ControlTrampaController::class, 'store'])
        ->name('control-trampas.store')
        ->middleware(AdminOrPermission::class . ':c_plagas_control_trampas');
    Route::put('control-trampas/{control_trampa}', [ControlTrampaController::class, 'update'])
        ->name('control-trampas.update')
        ->middleware(AdminOrPermission::class . ':u_plagas_control_trampas');
    Route::delete('control-trampas/{control_trampa}', [ControlTrampaController::class, 'destroy'])
        ->name('control-trampas.destroy')
        ->middleware(AdminOrPermission::class . ':d_plagas_control_trampas');

    Route::get('control-trampas/registro-rapido', [ControlTrampaController::class, 'registroRapido'])
        ->name('control-trampas.registro-rapido')
        ->middleware(AdminOrPermission::class . ':c_plagas_control_trampas');
    Route::post('control-trampas/store-rapido', [ControlTrampaController::class, 'storeRapido'])
        ->name('control-trampas.store-rapido')
        ->middleware(AdminOrPermission::class . ':c_plagas_control_trampas');
    Route::get('control-trampas/pdf', [ControlTrampaController::class, 'pdf'])
        ->name('control-trampas.pdf')
        ->middleware(AdminOrPermission::class . ':r_plagas_control_trampas');


    // Arranque después de fumigación
    Route::get('arranque-fumigacion', [ArranqueFumigacionController::class, 'index'])
        ->name('arranque-fumigacion.index')
        ->middleware(AdminOrPermission::class . ':r_plagas_arranque_fumigacion');
    Route::post('arranque-fumigacion', [ArranqueFumigacionController::class, 'store'])
        ->name('arranque-fumigacion.store')
        ->middleware(AdminOrPermission::class . ':c_plagas_arranque_fumigacion');
    Route::put('arranque-fumigacion/{arranque_fumigacion}', [ArranqueFumigacionController::class, 'update'])
        ->name('arranque-fumigacion.update')
        ->middleware(AdminOrPermission::class . ':u_plagas_arranque_fumigacion');
    Route::delete('arranque-fumigacion/{arranque_fumigacion}', [ArranqueFumigacionController::class, 'destroy'])
        ->name('arranque-fumigacion.destroy')
        ->middleware(AdminOrPermission::class . ':d_plagas_arranque_fumigacion');

    // Insectocaptores / insectocutores (catálogo)
    Route::get('insectocaptores', [InsectocaptorController::class, 'index'])
        ->name('insectocaptores.index')
        ->middleware(AdminOrPermission::class . ':r_plagas_insectocaptores');
    Route::post('insectocaptores', [InsectocaptorController::class, 'store'])
        ->name('insectocaptores.store')
        ->middleware(AdminOrPermission::class . ':c_plagas_insectocaptores');
    Route::put('insectocaptores/{insectocaptor}', [InsectocaptorController::class, 'update'])
        ->name('insectocaptores.update')
        ->middleware(AdminOrPermission::class . ':u_plagas_insectocaptores');
    Route::delete('insectocaptores/{insectocaptor}', [InsectocaptorController::class, 'destroy'])
        ->name('insectocaptores.destroy')
        ->middleware(AdminOrPermission::class . ':d_plagas_insectocaptores');

    // Registro de insectos capturados
    
    Route::get('registro-insectos/pdf', [RegistroInsectoController::class, 'pdf'])
        ->name('registro-insectos.pdf')
        ->middleware(AdminOrPermission::class . ':r_plagas_registro_insectos');

    Route::get('registro-insectos', [RegistroInsectoController::class, 'index'])
        ->name('registro-insectos.index')
        ->middleware(AdminOrPermission::class . ':r_plagas_registro_insectos');

    Route::post('registro-insectos', [RegistroInsectoController::class, 'store'])
        ->name('registro-insectos.store')
        ->middleware(AdminOrPermission::class . ':c_plagas_registro_insectos');

    Route::put('registro-insectos/{registro_insecto}', [RegistroInsectoController::class, 'update'])
        ->name('registro-insectos.update')
        ->middleware(AdminOrPermission::class . ':u_plagas_registro_insectos');

    Route::delete('registro-insectos/{registro_insecto}', [RegistroInsectoController::class, 'destroy'])
        ->name('registro-insectos.destroy')
        ->middleware(AdminOrPermission::class . ':d_plagas_registro_insectos');
});
