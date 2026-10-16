<?php
// Rutas del módulo app/Domain/Sistema/Configuracion

    use App\Domain\Mantenimiento\Http\Controllers\ProveedorController;
    use App\Domain\Sistema\Configuracion\Http\Controllers\UbicacionController;
    use App\Domain\Sistema\Configuracion\Http\Controllers\UserController;
    use App\Domain\Sistema\Configuracion\Http\Controllers\AreaController;
    use App\Domain\Sistema\Configuracion\Http\Controllers\SectorController;
    use App\Domain\Sistema\Configuracion\Http\Controllers\TipoEstadoController;
    use App\Domain\Sistema\Configuracion\Http\Controllers\EstadoController;
    use App\Domain\Sistema\Configuracion\Http\Controllers\MaquinaEquipoController;
    use App\Domain\Mantenimiento\Http\Controllers\TipoMaquinaEquipoController;
    use App\Domain\Sistema\Configuracion\Http\Controllers\AdministracionController;
    use App\Domain\Sistema\Configuracion\Http\Controllers\PrioridadController;
    use App\Domain\Sistema\Configuracion\Http\Controllers\RolePermissionController;
    use App\Domain\Sistema\Configuracion\Http\Controllers\TipoUbicacionController;
    use App\Domain\Sistema\Configuracion\Http\Controllers\UnidadController;
    use App\Domain\Sistema\Configuracion\Models\Http\Controllers\TipoEstado;
    use App\Http\Middleware\AdminOrPermission;
    use Illuminate\Support\Facades\Route;
    use Inertia\Inertia;

    Route::prefix('sistemas')->group(function () {

        Route::get('/roles-permissions', [RolePermissionController::class, 'index']);

        Route::post('/roles', [RolePermissionController::class, 'createRole']);
        Route::post('/permissions', [RolePermissionController::class, 'createPermission']);

        Route::post('/roles/{role}/permissions', [RolePermissionController::class, 'assignPermissionToRole']);
        Route::post('/users/{user}/roles', [RolePermissionController::class, 'assignRoleToUser']);
        Route::delete('/roles/{role}/permissions/{permission}', [RolePermissionController::class, 'removePermissionFromRole']);
        Route::post('/roles/{role}/sync-permissions', [RolePermissionController::class, 'syncPermissions']);

        Route::resource('usuarios', UserController::class)
            ->names([
                'index'   => 'usuarios',
                'create'  => 'usuarios.crear',
                'store'   => 'usuarios.guardar',
                'edit'    => 'usuarios.editar',
                'update'  => 'usuarios.actualizar',
                'destroy' => 'usuarios.eliminar',
            ])
            ->parameters([
                'usuarios' => 'user',
            ])
            ->middleware([
                'index'   => AdminOrPermission::class . ':r_usuario',
                'create'  => AdminOrPermission::class . ':c_usuario',
                'store'   => AdminOrPermission::class . ':c_usuario',
                'edit'    => AdminOrPermission::class . ':u_usuario',
                'update'  => AdminOrPermission::class . ':u_usuario',
                'destroy' => AdminOrPermission::class . ':d_usuario',
            ]);


        Route::prefix('configuracion')->group(function () {
            // Ruta para la vista de configuración
            Route::get('/', function () {
                return Inertia::render('sistema/configuracion/index');
            })->name('configuracion.index');


            // TipoUbicacion
            Route::get('/tipoUbicaciones', [TipoUbicacionController::class, 'index']);
            Route::post('/tipoUbicaciones', [TipoUbicacionController::class, 'store']);
            Route::put('/tipoUbicaciones/{tipoUbicacion}', [TipoUbicacionController::class, 'update']);
            Route::delete('/tipoUbicaciones/{tipoUbicacion}', [TipoUbicacionController::class, 'destroy']);

            // Ubicacion
            Route::get('/ubicaciones', [UbicacionController::class, 'index']);
            Route::post('/ubicaciones', [UbicacionController::class, 'store']);
            Route::put('/ubicaciones/{ubicacion}', [UbicacionController::class, 'update']);
            Route::delete('/ubicaciones/{ubicacion}', [UbicacionController::class, 'destroy']);

            // Area
            Route::get('/areas', [AreaController::class, 'index']);
            Route::post('/areas', [AreaController::class, 'store']);
            Route::put('/areas/{area}', [AreaController::class, 'update']);
            Route::delete('/areas/{area}', [AreaController::class, 'destroy']);

            // Unidad
            Route::get('/unidades', [UnidadController::class, 'index']);
            Route::post('/unidades', [UnidadController::class, 'store']);
            Route::put('/unidades/{unidad}', [UnidadController::class, 'update']);
            Route::delete('/unidades/{unidad}', [UnidadController::class, 'destroy']);

            // Sector
            Route::get('/sectores', [SectorController::class, 'index']);
            Route::post('/sectores', [SectorController::class, 'store']);
            Route::put('/sectores/{sector}', [SectorController::class, 'update']);
            Route::delete('/sectores/{sector}', [SectorController::class, 'destroy']);

            // Estado
            Route::get('/estados', [EstadoController::class, 'index']);
            Route::post('/estados', [EstadoController::class, 'store']);
            Route::put('/estados/{estado}', [EstadoController::class, 'update']);
            Route::delete('/estados/{estado}', [EstadoController::class, 'destroy']);

            // TipoMaquinaEquipo
            Route::get('/tipoMaquinaEquipos', [TipoMaquinaEquipoController::class, 'index']);
            Route::post('/tipoMaquinaEquipos', [TipoMaquinaEquipoController::class, 'store']);
            Route::put('/tipoMaquinaEquipos/{tipoMaquinaEquipo}', [TipoMaquinaEquipoController::class, 'update']);
            Route::delete('/tipoMaquinaEquipos/{tipoMaquinaEquipo}', [TipoMaquinaEquipoController::class, 'destroy']);

            // MaquinaEquipo
            Route::get('/maquinaEquipos', [MaquinaEquipoController::class, 'index']);
            Route::post('/maquinaEquipos', [MaquinaEquipoController::class, 'store']);
            Route::put('/maquinaEquipos/{maquinaEquipo}', [MaquinaEquipoController::class, 'update']);
            Route::delete('/maquinaEquipos/{maquinaEquipo}', [MaquinaEquipoController::class, 'destroy']);

            // Prioridad
            Route::get('/prioridades', [PrioridadController::class, 'index']);
            Route::post('/prioridades', [PrioridadController::class, 'store']);
            Route::put('/prioridades/{prioridad}', [PrioridadController::class, 'update']);
            Route::delete('/prioridades/{prioridad}', [PrioridadController::class, 'destroy']);

            // Proveedor
            Route::get('/proveedores', [ProveedorController::class, 'index']);
            Route::post('/proveedores', [ProveedorController::class, 'store']);
            Route::put('/proveedores/{proveedor}', [ProveedorController::class, 'update']);
            Route::delete('/proveedores/{proveedor}', [ProveedorController::class, 'destroy']);
        });


        //administracion
        Route::get('/administracion', [AdministracionController::class, 'index'])
    ->name('administracion.index');

Route::prefix('admin/sql')->group(function () {

    Route::post('/', [AdministracionController::class, 'executeSql'])
        ->name('admin.sql.execute');

    Route::get('/tablas', [AdministracionController::class, 'tablas'])
        ->name('admin.sql.tablas');

    Route::get('/columnas', [AdministracionController::class, 'columnas'])
        ->name('admin.sql.columnas');

    Route::get('/table-data', [AdministracionController::class, 'registros'])
        ->name('admin.sql.table-data');

    Route::post('/update-cell', [AdministracionController::class, 'updateCell'])
        ->name('admin.sql.update-cell');

    });



    });
