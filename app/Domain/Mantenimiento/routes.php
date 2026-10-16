<?php

use App\Domain\Mantenimiento\Http\Controllers\AlmacenMovimientoController;
use App\Domain\Mantenimiento\Http\Controllers\OtController;
use App\Domain\Mantenimiento\Http\Controllers\RepuestoController;
use App\Domain\Mantenimiento\Http\Controllers\SolicitudOtController;
use App\Http\Middleware\AdminOrPermission;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
// ===========================
// Rutas para Repuestos
// ===========================

// Index


Route::prefix('mantenimiento')->group(function () {

    Route::get('/', function () {
        return Inertia::render('planta_lacteos/index');
    })->name('plantaLacteos.index');

    Route::get('repuestos', [RepuestoController::class, 'index'])
        ->name('repuestos')
        ->middleware(AdminOrPermission::class . ':r_repuesto');

    // Create
    Route::get('repuestos/crear', [RepuestoController::class, 'create'])
        ->name('repuestos.crear')
        ->middleware(AdminOrPermission::class . ':c_repuesto');

    // Store
    Route::post('repuestos', [RepuestoController::class, 'store'])
        ->name('repuestos.guardar')
        ->middleware(AdminOrPermission::class . ':c_repuesto');

    // Edit
    Route::get('repuestos/{repuesto}/editar', [RepuestoController::class, 'edit'])
        ->name('repuestos.editar')
        ->middleware(AdminOrPermission::class . ':u_repuesto');

    // Update
    Route::put('repuestos/{repuesto}', [RepuestoController::class, 'update'])
        ->name('repuestos.actualizar')
        ->middleware(AdminOrPermission::class . ':u_repuesto');

    // Destroy
    Route::delete('repuestos/{repuesto}', [RepuestoController::class, 'destroy'])
        ->name('repuestos.eliminar')
        ->middleware(AdminOrPermission::class . ':d_repuesto');


    // ===========================
    // Rutas para SolicitudOTs
    // ===========================

    // Index
    Route::get('solicitudOts', [SolicitudOtController::class, 'index'])
        ->name('solicitudOts')
        ->middleware(AdminOrPermission::class . ':r_solicitudOt');

    // Create
    Route::get('solicitudOts/crear', [SolicitudOtController::class, 'create'])
        ->name('solicitudOts.crear')
        ->middleware(AdminOrPermission::class . ':c_solicitudOt');

    // Store
    Route::post('solicitudOts', [SolicitudOtController::class, 'store'])
        ->name('solicitudOts.guardar')
        ->middleware(AdminOrPermission::class . ':c_solicitudOt');

    // Edit
    Route::get('solicitudOts/{solicitudOt}/editar', [SolicitudOtController::class, 'edit'])
        ->name('solicitudOts.editar')
        ->middleware(AdminOrPermission::class . ':u_solicitudOt');

    // Update
    Route::put('solicitudOts/{solicitudOt}', [SolicitudOtController::class, 'update'])
        ->name('solicitudOts.actualizar')
        ->middleware(AdminOrPermission::class . ':u_solicitudOt');

    //Rechazar
    Route::put('/solicitudOts/{solicitud}/rechazar', [SolicitudOtController::class, 'rechazar'])
        ->name('solicitudOts.rechazar')
        ->middleware(AdminOrPermission::class . ':rechazar_solicitudOt');
    // Destroy
    Route::delete('solicitudOts/{solicitudOt}', [SolicitudOtController::class, 'destroy'])
        ->name('solicitudOts.eliminar')
        ->middleware(AdminOrPermission::class . ':d_solicitudOt');

    //Rechazar
    Route::put('/solicitudOts/{solicitudOt}/revisar', [SolicitudOtController::class, 'marcarRevisado'])
        ->name('solicitudOts.revisar')
        ->middleware(AdminOrPermission::class . ':r_solicitudOt');

    Route::put('solicitudOts/{solicitudOt}/cerrar', [SolicitudOtController::class, 'marcarCerrado'])
        ->name('solicitudOts.cerrar')
        ->middleware(AdminOrPermission::class . ':cerrar_solicitudOt');





    // ===========================
    // Rutas para OTs
    // ===========================

    // Index
    Route::get('ots', [OtController::class, 'index'])
        ->name('ots')
        ->middleware(AdminOrPermission::class . ':r_ot');

    // Create
    Route::get('ots/crear', [OtController::class, 'create'])
        ->name('ots.crear')
        ->middleware(AdminOrPermission::class . ':c_ot');

    // Store
    Route::post('ots', [OtController::class, 'store'])
        ->name('ots.guardar')
        ->middleware(AdminOrPermission::class . ':c_ot');

    // Edit
    Route::get('ots/{ot}/editar', [OtController::class, 'edit'])
        ->name('ots.editar')
        ->middleware(AdminOrPermission::class . ':u_ot');

    // Update
    Route::put('ots/{ot}', [OtController::class, 'update'])
        ->name('ots.actualizar')
        ->middleware(AdminOrPermission::class . ':u_ot');

    // Destroy
    Route::delete('ots/{ot}', [OtController::class, 'destroy'])
        ->name('ots.eliminar')
        ->middleware(AdminOrPermission::class . ':d_ot');

    Route::put('ots/{ot}/actualizar-detalles', [OtController::class, 'actualizarDetalles'])
        ->name('ots.actualizarDetalles');

    Route::put('/ots/{ot}/marcar-visto', [OtController::class, 'marcarVisto'])->name('ots.marcarVisto');





    // ===========================
    // RUTAS PARA ALMACÉN DE REPUESTOS
    // ===========================
    Route::prefix('almacen')->group(function () {
        // Índice de movimientos de almacén
        Route::get('movimientos', [AlmacenMovimientoController::class, 'index'])
            ->name('almacen.movimientos')
            ->middleware(AdminOrPermission::class . ':r_almacenMovimiento');





        // Create
        Route::get('movimientos/crear', [AlmacenMovimientoController::class, 'create'])
            ->name('almacen.movimientos.crear')
            ->middleware(AdminOrPermission::class . ':c_almacenMovimiento');

        // Store
        Route::post('movimientos', [AlmacenMovimientoController::class, 'store'])
            ->name('almacen.movimientos.guardar')
            ->middleware(AdminOrPermission::class . ':c_almacenMovimiento');








        Route::get('almacen/stock-disponible', [AlmacenMovimientoController::class, 'stockDisponible'])
            ->name('almacen.stock.disponible');





        Route::post('movimientos/{movimiento}/autorizar', [AlmacenMovimientoController::class, 'autorizar'])
            ->name('almacen.movimientos.autorizar')
            ->middleware(AdminOrPermission::class . ':autorizar_almacenMovimiento');

        Route::post('movimientos/{movimiento}/rechazar', [AlmacenMovimientoController::class, 'rechazar'])
            ->name('almacen.movimientos.rechazar')
            ->middleware(AdminOrPermission::class . ':autorizar_almacenMovimiento');

        Route::post('movimientos/{movimiento}/entregar', [AlmacenMovimientoController::class, 'entregar'])
            ->name('almacen.movimientos.entregar')
            ->middleware(AdminOrPermission::class . ':entregar_almacenMovimiento');
    });

    // En routes/web.php, dentro de Route::prefix('mantenimiento')->group(function () {

    // ... (rutas de OT existentes)

    // Rutas para gestión de tiempos de ayudantes
    Route::post('ots/{ot}/tiempos/iniciar', [OtController::class, 'iniciarTiempo'])->name('ots.tiempos.iniciar');
    Route::put('ots/{ot}/tiempos/{tiempo}/finalizar', [OtController::class, 'finalizarTiempo'])->name('ots.tiempos.finalizar');
    Route::post('ots/{ot}/tiempos/manual', [OtController::class, 'registrarTiempoManual'])->name('ots.tiempos.manual');
    Route::get('ots/{ot}/tiempos', [OtController::class, 'listarTiempos'])->name('ots.tiempos.index');

Route::get('ots/{ot}/ayudantes-disponibles', [OtController::class, 'ayudantesDisponibles'])->name('ots.ayudantes.disponibles');
// Asignar un ayudante a una OT
Route::post('ots/{ot}/ayudantes', [OtController::class, 'asignarAyudante'])->name('ots.ayudantes.asignar');

    });
