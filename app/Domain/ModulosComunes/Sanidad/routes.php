<?php

use App\Domain\ModulosComunes\Sanidad\Http\Controllers\AtencionMedicaController;
use App\Domain\ModulosComunes\Sanidad\Http\Controllers\CajaController;
use App\Domain\ModulosComunes\Sanidad\Http\Controllers\ExamenOcupacionalController;
use App\Domain\ModulosComunes\Sanidad\Http\Controllers\PoliclinicoController;
use App\Domain\ModulosComunes\Sanidad\Http\Controllers\ReconsultaAtencionMedicaController;
use App\Domain\ModulosComunes\Sanidad\Http\Controllers\UsuarioSanidadController;
use Illuminate\Support\Facades\Route;

// Rutas del módulo app/Domain/ModulosComunes/Sanidad
use App\Http\Middleware\AdminOrPermission;

// Rutas del módulo app/Domain/ModulosComunes/Sanidad
Route::prefix('sanidad')->middleware(['auth'])->group(function () {

    // Categorías de Productos - Rutas básicas (sin resource)
    Route::get('cajas', [CajaController::class, 'index'])
        ->name('cajas.index')
        ->middleware(AdminOrPermission::class . ':r_sanidadAtencionMedica');
    Route::post('cajas', [CajaController::class, 'store'])
        ->name('cajas.store')
        ->middleware(AdminOrPermission::class . ':c_sanidadAtencionMedica');
    Route::put('cajas/{id}', [CajaController::class, 'update'])
        ->name('cajas.update')
        ->middleware(AdminOrPermission::class . ':u_sanidadAtencionMedica');
    Route::delete('cajas/{id}', [CajaController::class, 'destroy'])
        ->name('cajas.destroy')
        ->middleware(AdminOrPermission::class . ':d_sanidadAtencionMedica');

    Route::get('policlinicos', [PoliclinicoController::class, 'index'])
        ->name('policlinicos.index')
        ->middleware(AdminOrPermission::class . ':r_sanidadAtencionMedica');
    Route::post('policlinicos', [PoliclinicoController::class, 'store'])
        ->name('policlinicos.store')
        ->middleware(AdminOrPermission::class . ':c_sanidadAtencionMedica');
    Route::put('policlinicos/{id}', [PoliclinicoController::class, 'update'])
        ->name('policlinicos.update')
        ->middleware(AdminOrPermission::class . ':u_sanidadAtencionMedica');
    Route::delete('policlinicos/{id}', [PoliclinicoController::class, 'destroy'])
        ->name('policlinicos.destroy')
        ->middleware(AdminOrPermission::class . ':d_sanidadAtencionMedica');

    Route::get('atenciones-medicas', [AtencionMedicaController::class, 'index'])
        ->name('atenciones-medicas.index')
        ->middleware(AdminOrPermission::class . ':r_sanidadAtencionMedica');
    Route::post('atenciones-medicas', [AtencionMedicaController::class, 'store'])
        ->name('atenciones-medicas.store')
        ->middleware(AdminOrPermission::class . ':c_sanidadAtencionMedica');
    Route::get('atenciones-medicas/create', [AtencionMedicaController::class, 'create'])
        ->name('atenciones-medicas.create')
        ->middleware(AdminOrPermission::class . ':c_sanidadAtencionMedica');
    Route::get('atenciones-medicas/{id}', [AtencionMedicaController::class, 'show'])
        ->name('atenciones-medicas.show')
        ->middleware(AdminOrPermission::class . ':r_sanidadAtencionMedica');
    Route::get('atenciones-medicas/{id}/edit', [AtencionMedicaController::class, 'edit'])
        ->name('atenciones-medicas.edit')
        ->middleware(AdminOrPermission::class . ':u_sanidadAtencionMedica');
    Route::put('atenciones-medicas/{id}', [AtencionMedicaController::class, 'update'])
        ->name('atenciones-medicas.update')
        ->middleware(AdminOrPermission::class . ':u_sanidadAtencionMedica');
    Route::delete('atenciones-medicas/{id}', [AtencionMedicaController::class, 'destroy'])
        ->name('atenciones-medicas.destroy')
        ->middleware(AdminOrPermission::class . ':d_sanidadAtencionMedica');

    Route::post('reconsultas', [ReconsultaAtencionMedicaController::class, 'store'])
        ->name('reconsultas.store')
        ->middleware(AdminOrPermission::class . ':c_sanidadAtencionMedica');
    Route::put('reconsultas/{id}', [ReconsultaAtencionMedicaController::class, 'update'])
        ->name('reconsultas.update')
        ->middleware(AdminOrPermission::class . ':u_sanidadAtencionMedica');
    Route::delete('reconsultas/{id}', [ReconsultaAtencionMedicaController::class, 'destroy'])
        ->name('reconsultas.destroy')
        ->middleware(AdminOrPermission::class . ':d_sanidadAtencionMedica');

    Route::get('examenes-ocupacionales', [ExamenOcupacionalController::class, 'index'])
        ->name('examenes-ocupacionales.index')
        ->middleware(AdminOrPermission::class . ':r_sanidadExamenMedico');
    Route::post('examenes-ocupacionales', [ExamenOcupacionalController::class, 'store'])
        ->name('examenes-ocupacionales.store')
        ->middleware(AdminOrPermission::class . ':c_sanidadExamenMedico');
    Route::get('examenes-ocupacionales/create', [ExamenOcupacionalController::class, 'create'])
        ->name('examenes-ocupacionales.create')
        ->middleware(AdminOrPermission::class . ':c_sanidadExamenMedico');
    Route::get('examenes-ocupacionales/{id}', [ExamenOcupacionalController::class, 'show'])
        ->name('examenes-ocupacionales.show')
        ->middleware(AdminOrPermission::class . ':r_sanidadExamenMedico');
    Route::get('examenes-ocupacionales/{id}/edit', [ExamenOcupacionalController::class, 'edit'])
        ->name('examenes-ocupacionales.edit')
        ->middleware(AdminOrPermission::class . ':u_sanidadExamenMedico');
    Route::put('examenes-ocupacionales/{id}', [ExamenOcupacionalController::class, 'update'])
        ->name('examenes-ocupacionales.update')
        ->middleware(AdminOrPermission::class . ':u_sanidadExamenMedico');
    Route::delete('examenes-ocupacionales/{id}', [ExamenOcupacionalController::class, 'destroy'])
        ->name('examenes-ocupacionales.destroy')
        ->middleware(AdminOrPermission::class . ':d_sanidadExamenMedico');

    Route::get('usuarios', [UsuarioSanidadController::class, 'index'])
        ->name('sanidad.usuarios.index')
        ->middleware(AdminOrPermission::class . ':r_sanidadUsuario');
    Route::get('usuarios/create', [UsuarioSanidadController::class, 'create'])
        ->name('sanidad.usuarios.create')
        ->middleware(AdminOrPermission::class . ':c_sanidadUsuario');
    Route::post('usuarios', [UsuarioSanidadController::class, 'store'])
        ->name('sanidad.usuarios.store')
        ->middleware(AdminOrPermission::class . ':c_sanidadUsuario');
    Route::get('usuarios/{usuario}', [UsuarioSanidadController::class, 'show'])
        ->name('sanidad.usuarios.show')
        ->middleware(AdminOrPermission::class . ':r_sanidadUsuario');
    Route::get('usuarios/{usuario}/edit', [UsuarioSanidadController::class, 'edit'])
        ->name('sanidad.usuarios.edit')
        ->middleware(AdminOrPermission::class . ':u_sanidadUsuario');
    Route::put('usuarios/{usuario}', [UsuarioSanidadController::class, 'update'])
        ->name('sanidad.usuarios.update')
        ->middleware(AdminOrPermission::class . ':u_sanidadUsuario');
});
