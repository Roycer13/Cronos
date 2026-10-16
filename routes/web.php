<?php

use App\Domain\ModulosComunes\Orp\Http\Controllers\OrpReporteController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {

    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');

});
Route::middleware(['auth', 'verified'])->group(function () {


    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');


    // Cargar todas las rutas dentro de app/Domain/**/routes.php
    $domainPath = base_path('app/Domain');

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($domainPath)
    );

    foreach ($iterator as $file) {
        if ($file->isFile() && $file->getFilename() === 'routes.php') {
            require $file->getPathname();
        }
    }



});
// routes/web.php
Route::get('/diagnostico/orp/{id}', [OrpReporteController::class, 'diagnostico']);
// routes/web.php
Route::get('/debug-detalles/orp/{id}', [OrpReporteController::class, 'debugDetalles']);

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
