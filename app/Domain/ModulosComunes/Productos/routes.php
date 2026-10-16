<?php

use App\Domain\ModulosComunes\Orp\Http\Controllers\OrpReporteController;
use App\Domain\ModulosComunes\Productos\Http\Controllers\CategoriaProductoController;
use App\Domain\ModulosComunes\Productos\Http\Controllers\DestinoController;
use App\Domain\ModulosComunes\Productos\Http\Controllers\FichaTecnicaController;
use App\Domain\ModulosComunes\Productos\Http\Controllers\FichaTecnicaNutricionController;
use App\Domain\ModulosComunes\Productos\Http\Controllers\LineaController;
use App\Domain\ModulosComunes\Productos\Http\Controllers\ProductoTerminadoController;
use App\Domain\ModulosComunes\Productos\Http\Controllers\SubcategoriaProductoController;
use App\Http\Middleware\AdminOrPermission;
use Illuminate\Support\Facades\Route;

Route::prefix('productos')->group(function () {

    // Categorías de Productos - Rutas básicas (sin resource)
    Route::get('categorias-productos', [CategoriaProductoController::class, 'index'])->name('categorias-productos.index');
    Route::post('categorias-productos', [CategoriaProductoController::class, 'store'])->name('categorias-productos.store');
    Route::put('categorias-productos/{id}', [CategoriaProductoController::class, 'update'])->name('categorias-productos.update');
    Route::delete('categorias-productos/{id}', [CategoriaProductoController::class, 'destroy'])->name('categorias-productos.destroy');

    // Subcategorías de Productos - Rutas básicas (sin resource)
    Route::get('subcategorias-productos', [SubcategoriaProductoController::class, 'index'])->name('subcategorias-productos.index');
    Route::post('subcategorias-productos', [SubcategoriaProductoController::class, 'store'])->name('subcategorias-productos.store');
    Route::put('subcategorias-productos/{id}', [SubcategoriaProductoController::class, 'update'])->name('subcategorias-productos.update');
    Route::delete('subcategorias-productos/{id}', [SubcategoriaProductoController::class, 'destroy'])->name('subcategorias-productos.destroy');

    // Líneas - Rutas básicas (sin resource)
    Route::get('lineas', [LineaController::class, 'index'])->name('lineas.index');
    Route::post('lineas', [LineaController::class, 'store'])->name('lineas.store');
    Route::put('lineas/{id}', [LineaController::class, 'update'])->name('lineas.update');
    Route::delete('lineas/{id}', [LineaController::class, 'destroy'])->name('lineas.destroy');

    // Destinos - Rutas básicas (sin resource)
    Route::get('destinos', [DestinoController::class, 'index'])->name('destinos.index');
    Route::post('destinos', [DestinoController::class, 'store'])->name('destinos.store');
    Route::put('destinos/{id}', [DestinoController::class, 'update'])->name('destinos.update');
    Route::delete('destinos/{id}', [DestinoController::class, 'destroy'])->name('destinos.destroy');

    // Productos Terminados - CON RESOURCE (tiene scopes)
    // Productos Terminados - Rutas individuales
    Route::get('productos-terminados', [ProductoTerminadoController::class, 'index'])
        ->name('productos-terminados.index')
        ->middleware(AdminOrPermission::class . ':r_productoTerminados');

    Route::get('productos-terminados/crear', [ProductoTerminadoController::class, 'create'])
        ->name('productos-terminados.create')
        ->middleware(AdminOrPermission::class . ':c_productoTerminados');

    Route::post('productos-terminados', [ProductoTerminadoController::class, 'store'])
        ->name('productos-terminados.store')
        ->middleware(AdminOrPermission::class . ':c_productoTerminados');

    Route::get('productos-terminados/{productoTerminado}', [ProductoTerminadoController::class, 'show'])
        ->name('productos-terminados.show')
        ->middleware(AdminOrPermission::class . ':r_productoTerminados');

    Route::get('productos-terminados/{productoTerminado}/editar', [ProductoTerminadoController::class, 'edit'])
        ->name('productos-terminados.edit')
        ->middleware(AdminOrPermission::class . ':u_productoTerminados');

    Route::put('productos-terminados/{productoTerminado}', [ProductoTerminadoController::class, 'update'])
        ->name('productos-terminados.update')
        ->middleware(AdminOrPermission::class . ':u_productoTerminados');

    Route::delete('productos-terminados/{productoTerminado}', [ProductoTerminadoController::class, 'destroy'])
        ->name('productos-terminados.destroy')
        ->middleware(AdminOrPermission::class . ':d_productoTerminados');

    // Fichas Técnicas - CON RESOURCE (tiene scopes)
    Route::resource('fichas-tecnicas', FichaTecnicaController::class)
        ->names([
            'index' => 'fichas-tecnicas.index',
            'create' => 'fichas-tecnicas.create',
            'store' => 'fichas-tecnicas.store',
            'show' => 'fichas-tecnicas.show',
            'edit' => 'fichas-tecnicas.edit',
            'update' => 'fichas-tecnicas.update',
            'destroy' => 'fichas-tecnicas.destroy',
        ]);

    // Fichas Técnicas Nutrición - CON RESOURCE (tiene scopes)
    Route::resource('fichas-tecnicas-nutricion', FichaTecnicaNutricionController::class)
        ->names([
            'index' => 'fichas-tecnicas-nutricion.index',
            'create' => 'fichas-tecnicas-nutricion.create',
            'store' => 'fichas-tecnicas-nutricion.store',
            'show' => 'fichas-tecnicas-nutricion.show',
            'edit' => 'fichas-tecnicas-nutricion.edit',
            'update' => 'fichas-tecnicas-nutricion.update',
            'destroy' => 'fichas-tecnicas-nutricion.destroy',
        ])
        ->except(['index', 'create']); // Normalmente se accede desde ficha técnica

    // Rutas adicionales para funcionalidades específicas
    Route::prefix('fichas-tecnicas')->group(function () {
        Route::post('/{fichaTecnica}/aprobar', [FichaTecnicaController::class, 'aprobar'])->name('fichas-tecnicas.aprobar');
        Route::post('/{fichaTecnica}/clonar', [FichaTecnicaController::class, 'clonar'])->name('fichas-tecnicas.clonar');
        Route::get('/{fichaTecnica}/nutricion', [FichaTecnicaController::class, 'nutricion'])->name('fichas-tecnicas.nutricion');
    });

    // Rutas adicionales para Productos Terminados
    Route::prefix('productos-terminados')->group(function () {
        Route::get('/{productoTerminado}/ficha-tecnica', [ProductoTerminadoController::class, 'fichaTecnica'])->name('productos-terminados.ficha-tecnica');
        Route::get('/{productoTerminado}/historial', [ProductoTerminadoController::class, 'historial'])->name('productos-terminados.historial');
    });
    Route::get('/orps/{orp}/reporte', [OrpReporteController::class, 'show'])->name('orps.reporte.show');
    Route::get('/orps/{orp}/reporte/pdf/{tipo?}', [OrpReporteController::class, 'generatePDF'])->name('orps.reporte.pdf');
    Route::get('/orps/{orp}/reporte/htst-json', [OrpReporteController::class, 'reporteHtst'])->name('orps.reporte.htst-json');
    Route::get('/orps/{orp}/reporte/uht-json', [OrpReporteController::class, 'reporteUht'])->name('orps.reporte.uht-json');

    
});
