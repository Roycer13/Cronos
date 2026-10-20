<?php

use Illuminate\Support\Facades\Route;

// Web service de materia prima (solo lectura, token Sanctum)
Route::middleware([
    'auth:sanctum',
    'throttle:60,1',
    \App\Http\Middleware\AdminOrPermission::class . ':r_recepcionMateriaPrima',
])->prefix('v1/materia-prima')->name('api.v1.materia-prima.')->group(function () {
    Route::get('informe', [\App\Domain\PlantaLacteos\Http\Controllers\Api\RecepcionMateriaPrimaApiController::class, 'informe'])->name('informe');
    Route::get('recepciones', [\App\Domain\PlantaLacteos\Http\Controllers\Api\RecepcionMateriaPrimaApiController::class, 'recepciones'])->name('recepciones');
});