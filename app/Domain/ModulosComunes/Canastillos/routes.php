<?php

use App\Domain\ModulosComunes\Canastillos\Http\Controllers\AlmacenController;
use App\Domain\ModulosComunes\Canastillos\Http\Controllers\CanastilloController;
use App\Domain\ModulosComunes\Canastillos\Http\Controllers\VendedorController;
use App\Domain\ModulosComunes\Canastillos\Http\Controllers\MovimientoController;
use App\Domain\ModulosComunes\Canastillos\Http\Controllers\TipoAlmacenController;
use App\Domain\ModulosComunes\Canastillos\Http\Controllers\InventarioController;
use App\Domain\ModulosComunes\Canastillos\Http\Controllers\DeudaController;
use App\Http\Middleware\AdminOrPermission;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('canastillos')->name('canastillos.')->group(function () {

    // ===========================
    // Vista principal del módulo
    // ===========================
    Route::get('/', function () {
        return Inertia::render('canastillos/index');
    })->name('index');

    // ===========================
    // Recursos principales (CRUD)
    // ===========================

    // Almacenes
    Route::get('almacenes', [AlmacenController::class, 'index'])
        ->name('almacenes.index')
        ->middleware(AdminOrPermission::class . ':r_almacen');

    Route::get('almacenes/crear', [AlmacenController::class, 'create'])
        ->name('almacenes.create')
        ->middleware(AdminOrPermission::class . ':c_almacen');

    Route::post('almacenes', [AlmacenController::class, 'store'])
        ->name('almacenes.store')
        ->middleware(AdminOrPermission::class . ':c_almacen');

    Route::get('almacenes/{almacen}', [AlmacenController::class, 'show'])
        ->name('almacenes.show')
        ->middleware(AdminOrPermission::class . ':r_almacen');

    Route::get('almacenes/{almacen}/editar', [AlmacenController::class, 'edit'])
        ->name('almacenes.edit')
        ->middleware(AdminOrPermission::class . ':u_almacen');

    Route::put('almacenes/{almacen}', [AlmacenController::class, 'update'])
        ->name('almacenes.update')
        ->middleware(AdminOrPermission::class . ':u_almacen');

    Route::delete('almacenes/{almacen}', [AlmacenController::class, 'destroy'])
        ->name('almacenes.destroy')
        ->middleware(AdminOrPermission::class . ':d_almacen');

    // Canastillos
    Route::get('canastillos', [CanastilloController::class, 'index'])
        ->name('canastillos.index')
        ->middleware(AdminOrPermission::class . ':r_canastillo');

    Route::get('canastillos/crear', [CanastilloController::class, 'create'])
        ->name('canastillos.create')
        ->middleware(AdminOrPermission::class . ':c_canastillo');

    Route::post('canastillos', [CanastilloController::class, 'store'])
        ->name('canastillos.store')
        ->middleware(AdminOrPermission::class . ':c_canastillo');

    Route::get('canastillos/{canastillo}', [CanastilloController::class, 'show'])
        ->name('canastillos.show')
        ->middleware(AdminOrPermission::class . ':r_canastillo');

    Route::get('canastillos/{canastillo}/editar', [CanastilloController::class, 'edit'])
        ->name('canastillos.edit')
        ->middleware(AdminOrPermission::class . ':u_canastillo');

    Route::put('canastillos/{canastillo}', [CanastilloController::class, 'update'])
        ->name('canastillos.update')
        ->middleware(AdminOrPermission::class . ':u_canastillo');

    Route::delete('canastillos/{canastillo}', [CanastilloController::class, 'destroy'])
        ->name('canastillos.destroy')
        ->middleware(AdminOrPermission::class . ':d_canastillo');

    // Vendedores
    Route::get('vendedores', [VendedorController::class, 'index'])
        ->name('vendedores.index')
        ->middleware(AdminOrPermission::class . ':r_vendedor');

    Route::get('vendedores/crear', [VendedorController::class, 'create'])
        ->name('vendedores.create')
        ->middleware(AdminOrPermission::class . ':c_vendedor');

    Route::post('vendedores', [VendedorController::class, 'store'])
        ->name('vendedores.store')
        ->middleware(AdminOrPermission::class . ':c_vendedor');

    Route::get('vendedores/{vendedor}', [VendedorController::class, 'show'])
        ->name('vendedores.show')
        ->middleware(AdminOrPermission::class . ':r_vendedor');

    Route::get('vendedores/{vendedor}/editar', [VendedorController::class, 'edit'])
        ->name('vendedores.edit')
        ->middleware(AdminOrPermission::class . ':u_vendedor');

    Route::put('vendedores/{vendedor}', [VendedorController::class, 'update'])
        ->name('vendedores.update')
        ->middleware(AdminOrPermission::class . ':u_vendedor');

    Route::delete('vendedores/{vendedor}', [VendedorController::class, 'destroy'])
        ->name('vendedores.destroy')
        ->middleware(AdminOrPermission::class . ':d_vendedor');

    // Tipos de Almacén (catálogo)
    Route::get('tipos-almacen', [TipoAlmacenController::class, 'index'])
        ->name('tipos-almacen.index')
        ->middleware(AdminOrPermission::class . ':r_tipo_almacen');

    Route::post('tipos-almacen', [TipoAlmacenController::class, 'store'])
        ->name('tipos-almacen.store')
        ->middleware(AdminOrPermission::class . ':c_tipo_almacen');

    Route::put('tipos-almacen/{tipo_almacen}', [TipoAlmacenController::class, 'update'])
        ->name('tipos-almacen.update')
        ->middleware(AdminOrPermission::class . ':u_tipo_almacen');

    Route::delete('tipos-almacen/{tipo_almacen}', [TipoAlmacenController::class, 'destroy'])
        ->name('tipos-almacen.destroy')
        ->middleware(AdminOrPermission::class . ':d_tipo_almacen');

    // ===========================
    // Movimientos (operaciones)
    // ===========================

    // Listado general de movimientos
    Route::get('movimientos', [MovimientoController::class, 'index'])
        ->name('movimientos.index')
        ->middleware(AdminOrPermission::class . ':r_movimiento');

    // --- RUTAS ESPECÍFICAS (sin parámetros) ---
    // Ajuste de inventario
    Route::get('movimientos/ajuste', [MovimientoController::class, 'createAjuste'])
        ->name('movimientos.ajuste.create')
        ->middleware(AdminOrPermission::class . ':c_ajuste');

    Route::post('movimientos/ajuste', [MovimientoController::class, 'storeAjuste'])
        ->name('movimientos.ajuste.store')
        ->middleware(AdminOrPermission::class . ':c_ajuste');

    // Préstamo a vendedor
    Route::get('movimientos/prestar', [MovimientoController::class, 'createPrestamo'])
        ->name('movimientos.prestamo.create')
        ->middleware(AdminOrPermission::class . ':c_prestamo');

    Route::post('movimientos/prestar', [MovimientoController::class, 'storePrestamo'])
        ->name('movimientos.prestamo.store')
        ->middleware(AdminOrPermission::class . ':c_prestamo');

    // Devolución de vendedor
    Route::get('movimientos/devolver', [MovimientoController::class, 'createDevolucion'])
        ->name('movimientos.devolucion.create')
        ->middleware(AdminOrPermission::class . ':c_devolucion');

    Route::post('movimientos/devolver', [MovimientoController::class, 'storeDevolucion'])
        ->name('movimientos.devolucion.store')
        ->middleware(AdminOrPermission::class . ':c_devolucion');

    // Transferencia entre almacenes
    Route::get('movimientos/transferir', [MovimientoController::class, 'createTransferencia'])
        ->name('movimientos.transferencia.create')
        ->middleware(AdminOrPermission::class . ':c_transferencia');

    Route::post('movimientos/transferir', [MovimientoController::class, 'storeTransferencia'])
        ->name('movimientos.transferencia.store')
        ->middleware(AdminOrPermission::class . ':c_transferencia');

    // --- RUTAS CON PARÁMETRO (deben ir al final) ---
    // Ver detalle de un movimiento
    Route::get('movimientos/{movimiento}', [MovimientoController::class, 'show'])
        ->name('movimientos.show')
        ->middleware(AdminOrPermission::class . ':r_movimiento');

    // Anular un movimiento
    Route::delete('movimientos/{movimiento}', [MovimientoController::class, 'destroy'])
        ->name('movimientos.destroy')
        ->middleware(AdminOrPermission::class . ':d_movimiento');

    // ===========================
    // Inventario y deudas
    // ===========================

    // Inventario actual
    Route::get('inventario', [InventarioController::class, 'index'])
        ->name('inventario.index')
        ->middleware(AdminOrPermission::class . ':r_inventario');

    Route::get('inventario/almacen/{almacen}', [InventarioController::class, 'porAlmacen'])
        ->name('inventario.por-almacen')
        ->middleware(AdminOrPermission::class . ':r_inventario');

    // Deudas
    Route::get('deudas', [DeudaController::class, 'index'])
        ->name('deudas.index')
        ->middleware(AdminOrPermission::class . ':r_deuda');

    Route::get('deudas/vendedor/{vendedor}', [DeudaController::class, 'porVendedor'])
        ->name('deudas.por-vendedor')
        ->middleware(AdminOrPermission::class . ':r_deuda');

    Route::get('deudas/almacen/{almacen}', [DeudaController::class, 'porAlmacen'])
        ->name('deudas.por-almacen')
        ->middleware(AdminOrPermission::class . ':r_deuda');

    // ===========================
    // Utilidades (selects)
    // ===========================
    Route::get('util/almacenes-para-select', [AlmacenController::class, 'paraSelect'])
        ->name('util.almacenes-para-select')
        ->middleware(AdminOrPermission::class . ':r_almacen');

    Route::get('util/canastillos-para-select', [CanastilloController::class, 'paraSelect'])
        ->name('util.canastillos-para-select')
        ->middleware(AdminOrPermission::class . ':r_canastillo');

    Route::get('util/vendedores-para-select', [VendedorController::class, 'paraSelect'])
        ->name('util.vendedores-para-select')
        ->middleware(AdminOrPermission::class . ':r_vendedor');


        // Transferencias pendientes
Route::get('movimientos/transferencias-pendientes', [MovimientoController::class, 'transferenciasPendientes'])
    ->name('movimientos.transferencias-pendientes')
    ->middleware(AdminOrPermission::class . ':r_movimiento');

// Aceptar / rechazar transferencia
Route::post('movimientos/{movimiento}/aceptar', [MovimientoController::class, 'aceptarTransferencia'])
    ->name('movimientos.aceptar')
    ->middleware(AdminOrPermission::class . ':u_movimiento');

Route::post('movimientos/{movimiento}/rechazar', [MovimientoController::class, 'rechazarTransferencia'])
    ->name('movimientos.rechazar')
    ->middleware(AdminOrPermission::class . ':u_movimiento');

});
