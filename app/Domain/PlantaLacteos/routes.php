<?php

use App\Domain\PlantaLacteos\Http\Controllers\AccionInfraestructuraController;
use App\Domain\PlantaLacteos\Http\Controllers\AdminMateriaPrimaController;
use App\Domain\PlantaLacteos\Http\Controllers\RecepcionLecheController;
use App\Domain\PlantaLacteos\Http\Controllers\AnalisisLecheController;
use App\Domain\PlantaLacteos\Http\Controllers\RecepcionMateriaPrimaController;
use App\Domain\PlantaLacteos\Http\Controllers\InformeMateriaPrimaController;
use App\Domain\PlantaLacteos\Http\Controllers\AnalisisLineaController;
use App\Domain\PlantaLacteos\Http\Controllers\ConteoController;
use App\Domain\PlantaLacteos\Http\Controllers\AmbienteFrioController;
use App\Domain\PlantaLacteos\Http\Controllers\AnalisisMateriaPrimaController;
use App\Domain\PlantaLacteos\Http\Controllers\DashboardPlantaController;
use App\Domain\PlantaLacteos\Http\Controllers\EstadoPlantaController;
use App\Domain\PlantaLacteos\Http\Controllers\MovimientoDesinfeccionController;
use App\Domain\PlantaLacteos\Http\Controllers\MovimientoSustanciaController;
use App\Domain\PlantaLacteos\Http\Controllers\AditivoQuimicoServicioController;
use App\Domain\PlantaLacteos\Http\Controllers\AguaHeladaController;
use App\Domain\PlantaLacteos\Http\Controllers\ControlFisicoQuimicoOrganolepticoController;

use App\Domain\PlantaLacteos\Http\Controllers\OrigenController;
use App\Domain\PlantaLacteos\Http\Controllers\RutaAcopioController;
use App\Domain\PlantaLacteos\Http\Controllers\SeguimientoProduccionController;
use App\Domain\PlantaLacteos\Http\Controllers\SubRutaAcopioController;
use App\Domain\PlantaLacteos\Http\Controllers\SolicitudLaboratorioExternoController;
use App\Domain\PlantaLacteos\Http\Controllers\ArranqueLineaController;


use App\Domain\PlantaLacteos\Http\Controllers\DispositivoRefractometroController;
use App\Domain\PlantaLacteos\Http\Controllers\DispositivoPhmetroController;
use App\Domain\PlantaLacteos\Http\Controllers\DispositivoTemperaturaController;
use App\Domain\PlantaLacteos\Http\Controllers\DispositivoCrioscopoController;
use App\Domain\PlantaLacteos\Http\Controllers\DispositivoTermohigrometroController;
use App\Domain\PlantaLacteos\Http\Controllers\DispositivoMedicionController;
use App\Domain\PlantaLacteos\Http\Controllers\Externo\ActividadAguaController;
use App\Domain\PlantaLacteos\Http\Controllers\Externo\AguaFisicoController;
use App\Domain\PlantaLacteos\Http\Controllers\Externo\MicrobiologiaController;
use App\Domain\PlantaLacteos\Http\Controllers\Externo\SolicitudController;
use App\Domain\PlantaLacteos\Http\Controllers\Externo\TipoMuestraController;
use App\Domain\PlantaLacteos\Http\Controllers\HigieneAcopioController;
use App\Domain\PlantaLacteos\Http\Controllers\HisopadoController;
use App\Domain\PlantaLacteos\Http\Controllers\InfraestructuraController;
use App\Domain\PlantaLacteos\Http\Controllers\InspeccionInfraestructuraController;
use App\Domain\PlantaLacteos\Http\Controllers\LimpiezaTanqueAereoController;
use App\Http\Middleware\AdminOrPermission;


use App\Domain\PlantaLacteos\Http\Controllers\PaseTurnoController;
use App\Domain\PlantaLacteos\Http\Controllers\SeguimientoHtstController;
use App\Domain\PlantaLacteos\Http\Controllers\SeguimientoUhtController;
use App\Domain\PlantaLacteos\Http\Controllers\UhtHtstController;
use App\Domain\PlantaLacteos\Models\SeguimientoHtst;
use App\Domain\PlantaLacteos\Http\Controllers\LugarControlTemperaturaController;
use App\Domain\PlantaLacteos\Http\Controllers\ParametroLineaController;
use App\Domain\PlantaLacteos\Http\Controllers\TemperaturaAlmacenCongeladorController;
use App\Domain\PlantaLacteos\Http\Controllers\ServicioFrioController;
use App\Domain\PlantaLacteos\Http\Controllers\TratamientoAguaResidualController;
use App\Domain\PlantaLacteos\Http\Controllers\UtensilioController;
use App\Domain\PlantaLacteos\Http\Controllers\AcrilicoController;
use App\Domain\PlantaLacteos\Http\Controllers\VerificacionDispositivoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('planta-lacteos')->group(
    function () {

        // ===========================
        // Vista principal del módulo
        // ===========================
        Route::get('/', function () {
            return Inertia::render('planta_lacteos/index');
        })->name('planta-lacteos.index');


        // ===========================
        // Rutas para Recepción de Leche

        // ===========================

        // Recepciones de Leche - Rutas individuales
        Route::get('recepciones-leche', [RecepcionLecheController::class, 'index'])
            ->name('recepciones-leche.index')
            ->middleware(AdminOrPermission::class . ':r_recepcionLeche');

        Route::get('recepciones-leche/crear', [RecepcionLecheController::class, 'create'])
            ->name('recepciones-leche.create')
            ->middleware(AdminOrPermission::class . ':c_recepcionLeche');

        Route::post('recepciones-leche', [RecepcionLecheController::class, 'store'])
            ->name('recepciones-leche.store')
            ->middleware(AdminOrPermission::class . ':c_recepcionLeche');

        Route::get('recepciones-leche/{recepcion_leche}', [RecepcionLecheController::class, 'show'])
            ->name('recepciones-leche.show')
            ->middleware(AdminOrPermission::class . ':r_recepcionLeche');

        Route::get('recepciones-leche/{recepcion_leche}/editar', [RecepcionLecheController::class, 'edit'])
            ->name('recepciones-leche.edit')
            ->middleware(AdminOrPermission::class . ':u_recepcionLeche');

        Route::put('recepciones-leche/{recepcion_leche}', [RecepcionLecheController::class, 'update'])
            ->name('recepciones-leche.update')
            ->middleware(AdminOrPermission::class . ':u_recepcionLeche');

        Route::delete('recepciones-leche/{recepcion_leche}', [RecepcionLecheController::class, 'destroy'])
            ->name('recepciones-leche.destroy')
            ->middleware(AdminOrPermission::class . ':d_recepcionLeche');



        // Rutas para Análisis de Leche


        // Análisis de Leche - Rutas individuales (excluyendo create y store)
        Route::get('analisis-leche', [AnalisisLecheController::class, 'index'])
            ->name('analisis-leche.index')
            ->middleware(AdminOrPermission::class . ':r_analisisLeche');


        Route::get('/analisis-leche/pdf', [AnalisisLecheController::class, 'pdf'])
            ->name('analisis-leche.pdf')
            ->middleware(AdminOrPermission::class . ':r_analisisLeche');

        Route::get('analisis-leche/{analisis_leche}', [AnalisisLecheController::class, 'show'])
            ->name('analisis-leche.show')
            ->middleware(AdminOrPermission::class . ':r_analisisLeche');

        Route::get('analisis-leche/{analisis_leche}/editar', [AnalisisLecheController::class, 'edit'])
            ->name('analisis-leche.edit')
            ->middleware(AdminOrPermission::class . ':u_analisisLeche');

        Route::put('analisis-leche/{analisis_leche}', [AnalisisLecheController::class, 'update'])
            ->name('analisis-leche.update')
            ->middleware(AdminOrPermission::class . ':u_analisisLeche');

        Route::delete('analisis-leche/{analisis_leche}', [AnalisisLecheController::class, 'destroy'])
            ->name('analisis-leche.destroy')
            ->middleware(AdminOrPermission::class . ':d_analisisLeche');

        Route::get('analisis-leche/graficas', [AnalisisLecheController::class, 'graficas'])
            ->name('analisis-leche.graficas');

        // Etapas del análisis (actualizaciones parciales)
        Route::put('analisis-leche/{analisis_leche}/fq', [AnalisisLecheController::class, 'updateFQ'])
            ->name('analisis-leche.update-fq')
            ->middleware(AdminOrPermission::class . ':u_analisisLecheFQ');

        Route::put('analisis-leche/{analisis_leche}/siembra', [AnalisisLecheController::class, 'updateSiembra'])
            ->name('analisis-leche.update-siembra')
            ->middleware(AdminOrPermission::class . ':u_analisisLecheMB');

        Route::put('analisis-leche/{analisis_leche}/lectura', [AnalisisLecheController::class, 'updateLectura'])
            ->name('analisis-leche.update-lectura')
            ->middleware(AdminOrPermission::class . ':u_analisisLecheMB');

        // ===========================
        // Rutas para Rutas de Acopio
        // ===========================

        // Index
        Route::get('rutas-acopio', [RutaAcopioController::class, 'index'])
            ->name('rutas-acopio.index')
            ->middleware(AdminOrPermission::class . ':r_rutaAcopio');

        // Store
        Route::post('rutas-acopio', [RutaAcopioController::class, 'store'])
            ->name('rutas-acopio.store')
            ->middleware(AdminOrPermission::class . ':c_rutaAcopio');

        // Update
        Route::put('rutas-acopio/{rutas_acopio}', [RutaAcopioController::class, 'update'])
            ->name('rutas-acopio.update')
            ->middleware(AdminOrPermission::class . ':u_rutaAcopio');

        // Destroy
        Route::delete('rutas-acopio/{rutas_acopio}', [RutaAcopioController::class, 'destroy'])
            ->name('rutas-acopio.destroy')
            ->middleware(AdminOrPermission::class . ':d_rutaAcopio');



        // ===========================
        // Rutas para Subrutas de Acopio
        // ===========================

        // Index
        Route::get('subrutas-acopio', [SubRutaAcopioController::class, 'index'])
            ->name('subrutas-acopio.index')
            ->middleware(AdminOrPermission::class . ':r_subrutaAcopio');

        // Store
        Route::post('subrutas-acopio', [SubRutaAcopioController::class, 'store'])
            ->name('subrutas-acopio.store')
            ->middleware(AdminOrPermission::class . ':c_subrutaAcopio');

        // Update
        Route::put('subrutas-acopio/{subrutas_acopio}', [SubRutaAcopioController::class, 'update'])
            ->name('subrutas-acopio.update')
            ->middleware(AdminOrPermission::class . ':u_subrutaAcopio');

        // Destroy
        Route::delete('subrutas-acopio/{subrutas_acopio}', [SubRutaAcopioController::class, 'destroy'])
            ->name('subrutas-acopio.destroy')
            ->middleware(AdminOrPermission::class . ':d_subrutaAcopio');


        Route::put('subrutas-acopio/{subrutas_acopio}', [SubRutaAcopioController::class, 'update'])->name('subrutas-acopio.update');
        Route::delete('subrutas-acopio/{subrutas_acopio}', [SubRutaAcopioController::class, 'destroy'])->name('subrutas-acopio.destroy');

        Route::get('origen', [OrigenController::class, 'index'])->name('origen.index');
        Route::post('origen', [OrigenController::class, 'store'])->name('origen.store');
        Route::put('origen/{origen}', [OrigenController::class, 'update'])->name('origen.update');
        Route::delete('origen/{origen}', [OrigenController::class, 'destroy'])->name('origen.destroy');

        // Rutas para estado planta
        // Estados Planta - Rutas individuales
        Route::get('estados-planta', [EstadoPlantaController::class, 'index'])
            ->name('estados-planta.index')
            ->middleware(AdminOrPermission::class . ':r_estadosPlanta');

        Route::get('estados-planta/crear', [EstadoPlantaController::class, 'create'])
            ->name('estados-planta.create')
            ->middleware(AdminOrPermission::class . ':c_estadosPlanta');

        Route::post('estados-planta', [EstadoPlantaController::class, 'store'])
            ->name('estados-planta.store')
            ->middleware(AdminOrPermission::class . ':c_estadosPlanta');

        Route::get('estados-planta/{estado_planta}', [EstadoPlantaController::class, 'show'])
            ->name('estados-planta.show')
            ->middleware(AdminOrPermission::class . ':r_estadosPlanta');

        Route::get('estados-planta/{estado_planta}/editar', [EstadoPlantaController::class, 'edit'])
            ->name('estados-planta.edit')
            ->middleware(AdminOrPermission::class . ':u_estadosPlanta');

        Route::put('estados-planta/{estado_planta}', [EstadoPlantaController::class, 'update'])
            ->name('estados-planta.update')
            ->middleware(AdminOrPermission::class . ':u_estadosPlanta');

        Route::delete('estados-planta/{estado_planta}', [EstadoPlantaController::class, 'destroy'])
            ->name('estados-planta.destroy')
            ->middleware(AdminOrPermission::class . ':d_estadosPlanta');

        Route::post('estados-planta/{estados_planta}/solicitar-analisis', [EstadoPlantaController::class, 'solicitarAnalisis'])->name('estados-planta.solicitar-analisis');
        //opcion 1 de dashboard
        Route::get('dashboardPlanta', [DashboardPlantaController::class, 'index'])
            ->name('dashboardPlanta.index');
        //opcion 2 de dashboard version antigua
        Route::get('dashboardPlantaOld', [DashboardPlantaController::class, 'dashboardPlantaOld'])
            ->name('dashboardPlantaOld.index')
            ->middleware(AdminOrPermission::class . ':r_dashboardPlanta');
        Route::post('dashboardPlanta', [DashboardPlantaController::class, 'storeFromDashboard'])
            ->name('dashboardPlanta.store')
            ->middleware(AdminOrPermission::class . ':u_dashboardPlanta');


        Route::post('/estados-planta/{estados_planta}/cambiar-etapa', [EstadoPlantaController::class, 'cambiarEtapa'])->name('estados-planta.cambiar-etapa')
            ->middleware(AdminOrPermission::class . ':u_dashboardPlanta');
        Route::post('/estados-planta/{estados_planta}/actualizar-orps', [EstadoPlantaController::class, 'actualizarOrps'])->name('estados-planta.actualizar-orps')

            ->middleware(AdminOrPermission::class . ':u_dashboardPlanta');
        Route::post('/estados-planta/{estados_planta}/cambiar-etapa-orps', [EstadoPlantaController::class, 'cambiarEtapaYOrps'])->name('estados-planta.cambiar-etapa-orps')

            ->middleware(AdminOrPermission::class . ':u_dashboardPlanta');

        // Análisis de Línea - Rutas individuales
        Route::get('analisis-linea', [AnalisisLineaController::class, 'index'])
            ->name('analisis-linea.index')
            ->middleware(AdminOrPermission::class . ':r_analisisLinea');

        Route::get('analisis-linea/crear', [AnalisisLineaController::class, 'create'])
            ->name('analisis-linea.create')
            ->middleware(AdminOrPermission::class . ':c_analisisLinea');

        Route::post('analisis-linea', [AnalisisLineaController::class, 'store'])
            ->name('analisis-linea.store')
            ->middleware(AdminOrPermission::class . ':c_analisisLinea');

        Route::get('analisis-linea/{analisis_linea}', [AnalisisLineaController::class, 'show'])
            ->name('analisis-linea.show')
            ->middleware(AdminOrPermission::class . ':r_analisisLinea');

        Route::get('analisis-linea/{analisis_linea}/editar', [AnalisisLineaController::class, 'edit'])
            ->name('analisis-linea.edit')
            ->middleware(AdminOrPermission::class . ':u_analisisLinea');

        Route::put('analisis-linea/{analisis_linea}', [AnalisisLineaController::class, 'update'])
            ->name('analisis-linea.update')
            ->middleware(AdminOrPermission::class . ':u_analisisLinea');

        Route::delete('analisis-linea/{analisis_linea}', [AnalisisLineaController::class, 'destroy'])
            ->name('analisis-linea.destroy')
            ->middleware(AdminOrPermission::class . ':d_analisisLinea');

        // Ruta específica para iniciar análisis
        Route::get('analisis-linea/{analisis_linea}/analizar', [AnalisisLineaController::class, 'analizar'])
            ->name('analisis-linea.analizar')


            ->middleware(AdminOrPermission::class . ':solicitar_analisisLinea');





        // ===========================
        // Rutas para Movimientos de Desinfección (NUEVO)
        // ===========================

        // Index
        Route::get('movimientos-desinfeccion', [MovimientoDesinfeccionController::class, 'index'])
            ->name('movimiento-desinfeccion.index')
            ->middleware(AdminOrPermission::class . ':r_desinfeccion');


        Route::post('movimientos-desinfeccion/corregir-stocks', [MovimientoDesinfeccionController::class, 'corregirStocks'])
            ->name('movimiento-desinfeccion.corregir-stocks')
            ->middleware(AdminOrPermission::class . ':corregir_stocks_desinfeccion');
        // Ingresar stock
        Route::post('movimientos-desinfeccion/ingresar-stock', [MovimientoDesinfeccionController::class, 'ingresarStock'])
            ->name('movimiento-desinfeccion.ingresar-stock')
            ->middleware(AdminOrPermission::class . ':ingresar_desinfeccion');

        // Solicitar desinfección
        Route::post('movimientos-desinfeccion/solicitar', [MovimientoDesinfeccionController::class, 'solicitarDesinfeccion'])
            ->name('movimiento-desinfeccion.solicitar')
            // ->middleware(AdminOrPermission::class . ':c_desinfeccion')
        ;

        // Aceptar movimiento
        Route::post('movimientos-desinfeccion/{id}/aceptar', [MovimientoDesinfeccionController::class, 'aceptar'])
            ->name('movimiento-desinfeccion.aceptar')
            ->middleware(AdminOrPermission::class . ':u_desinfeccion');

        // Rechazar movimiento
        Route::post('movimientos-desinfeccion/{id}/rechazar', [MovimientoDesinfeccionController::class, 'rechazar'])
            ->name('movimiento-desinfeccion.rechazar')
            ->middleware(AdminOrPermission::class . ':u_desinfeccion');

        // Entregar movimiento
        Route::post('movimientos-desinfeccion/{id}/entregar', [MovimientoDesinfeccionController::class, 'entregar'])
            ->name('movimiento-desinfeccion.entregar')
            ->middleware(AdminOrPermission::class . ':u_desinfeccion');

        // Calcular concentración
        Route::post('movimientos-desinfeccion/calcular-concentracion', [MovimientoDesinfeccionController::class, 'calcularConcentracion'])
            ->name('movimiento-desinfeccion.calcular-concentracion')
            ->middleware(AdminOrPermission::class . ':r_desinfeccion');

        // Destroy
        Route::delete('movimientos-desinfeccion/{movimiento}', [MovimientoDesinfeccionController::class, 'destroy'])
            ->name('movimiento-desinfeccion.destroy')
            ->middleware(AdminOrPermission::class . ':d_desinfeccion');

        Route::get('/movimiento-desinfeccion/pdf', [MovimientoDesinfeccionController::class, 'pdf'])->name('movimiento-desinfeccion.pdf');



        //seguimiento htst
        // Index
        Route::get('seguimiento-htst', [SeguimientoHtstController::class, 'index'])
            ->name('seguimiento-htst.index')
            ->middleware(AdminOrPermission::class . ':r_seguimientoHtst');
        // Create
        Route::get('seguimiento-htst/crear', [SeguimientoHtstController::class, 'create'])
            ->name('seguimiento-htst.create')
            ->middleware(AdminOrPermission::class . ':c_seguimientoHtst');

        // Store
        Route::post('seguimiento-htst', [SeguimientoHtstController::class, 'store'])
            ->name('seguimiento-htst.store')
            ->middleware(AdminOrPermission::class . ':c_seguimientoHtst');

        Route::put('seguimiento-htst/{seguimiento}', [SeguimientoHtstController::class, 'update'])
            ->name('seguimiento-htst.update')
            ->middleware(AdminOrPermission::class . ':u_seguimientoHtst');


        Route::post(
            'seguimiento-htst/{seguimiento}/sembrar',
            [SeguimientoHtstController::class, 'sembrar']
        )->name('seguimiento-htst.sembrar')

            ->middleware(AdminOrPermission::class . ':u_seguimientoHtst');


        Route::post(
            'seguimiento-htst/{seguimiento}/moho',
            [SeguimientoHtstController::class, 'guardarMoho']
        )->name('seguimiento-htst.moho.guardar')
            ->middleware(AdminOrPermission::class . ':u_seguimientoHtst');

        Route::post(
            'seguimiento-htst/{seguimiento}/moho-cero',
            [SeguimientoHtstController::class, 'mohoCero']
        )->name('seguimiento-htst.moho.cero')
            ->middleware(AdminOrPermission::class . ':u_seguimientoHtst');

        Route::post(
            'seguimiento-htst/{seguimiento}/coliformes',
            [SeguimientoHtstController::class, 'guardarColiformes']
        )->name('seguimiento-htst.coliformes.guardar')
            ->middleware(AdminOrPermission::class . ':u_seguimientoHtst');

        Route::post(
            'seguimiento-htst/{seguimiento}/coliformes-cero',
            [SeguimientoHtstController::class, 'coliformesCero']
        )->name('seguimiento-htst.coliformes.cero')
            ->middleware(AdminOrPermission::class . ':u_seguimientoHtst');

        Route::delete('/seguimientos-htst/{seguimiento}', [SeguimientoHtstController::class, 'destroy'])
            ->name('seguimiento-htst.destroy');

        Route::get('/seguimiento-htst/pdf', [SeguimientoHtstController::class, 'pdf'])->name('seguimiento-htst.pdf');

        Route::post('seguimiento-htst/{seguimiento}/observacion', [SeguimientoHtstController::class, 'updateObservacion'])
            ->name('seguimiento-htst.observacion')
            ->middleware(AdminOrPermission::class . ':u_seguimientoHtst');

        //seguimiento uht
        // Index
        Route::get('seguimiento-uht', [SeguimientoUhtController::class, 'index'])
            ->name('seguimiento-uht.index')
            ->middleware(AdminOrPermission::class . ':r_seguimientoUht');
        // Create
        Route::get('seguimiento-uht/crear', [SeguimientoUhtController::class, 'create'])
            ->name('seguimiento-uht.create')
            ->middleware(AdminOrPermission::class . ':c_seguimientoUht');

        // Store
        Route::post('seguimiento-uht', [SeguimientoUhtController::class, 'store'])
            ->name('seguimiento-uht.store')
            ->middleware(AdminOrPermission::class . ':c_seguimientoUht');


        Route::post(
            'seguimiento-uht/{seguimientoUht}/sembrar',
            [SeguimientoUhtController::class, 'sembrar']
        )->name('seguimiento-uht.sembrar')
            ->middleware(AdminOrPermission::class . ':u_seguimientoUht');


        Route::post(
            'seguimiento-uht/{seguimientoUht}/moho',
            [SeguimientoUhtController::class, 'guardarMoho']
        )->name('seguimiento-uht.moho.guardar')
            ->middleware(AdminOrPermission::class . ':u_seguimientoUht');

        Route::post(
            'seguimiento-uht/{seguimientoUht}/moho-cero',
            [SeguimientoUhtController::class, 'mohoCero']
        )->name('seguimiento-uht.moho.cero')
            ->middleware(AdminOrPermission::class . ':u_seguimientoUht');

        Route::post(
            'seguimiento-uht/{seguimientoUht}/moho-nulo',
            [SeguimientoUhtController::class, 'mohoNulo']
        )->name('seguimiento-uht.moho.nulo')
            ->middleware(AdminOrPermission::class . ':u_seguimientoUht');

        Route::post(
            'seguimiento-uht/{seguimientoUht}/lote',
            [SeguimientoUhtController::class, 'actualizarLote']
        )->name('seguimiento-uht.lote.actualizar')
            ->middleware(AdminOrPermission::class . ':u_seguimientoUht');

        Route::post(
            'seguimiento-uht/{seguimientoUht}/coliformes',
            [SeguimientoUhtController::class, 'guardarColiformes']
        )->name('seguimiento-uht.coliformes.guardar')
            ->middleware(AdminOrPermission::class . ':u_seguimientoUht');

        Route::post(
            'seguimiento-uht/{seguimientoUht}/coliformes-cero',
            [SeguimientoUhtController::class, 'coliformesCero']
        )->name('seguimiento-uht.coliformes.cero')
            ->middleware(AdminOrPermission::class . ':u_seguimientoUht');






        // routes/web.php o el archivo correspondiente
        Route::post('/seguimiento-uht/autocompletar-dia2', [SeguimientoUhtController::class, 'autocompletarDia2'])
            ->name('seguimiento-uht.autocompletar-dia2')
            ->middleware(AdminOrPermission::class . ':u_seguimientoUht');

        Route::get('/seguimiento-uht/contar-pendientes-dia2', [SeguimientoUhtController::class, 'contarPendientesDia2'])
            ->name('seguimiento-uht.contar-pendientes-dia2')
            ->middleware(AdminOrPermission::class . ':u_seguimientoUht');


        Route::post('/seguimiento-uht/autocompletar-dia5', [SeguimientoUhtController::class, 'autocompletarDia5'])
            ->name('seguimiento-uht.autocompletar-dia5')
            ->middleware(AdminOrPermission::class . ':u_seguimientoUht');

        Route::get('/seguimiento-uht/contar-pendientes-dia5', [SeguimientoUhtController::class, 'contarPendientesDia5'])
            ->name('seguimiento-uht.contar-pendientes-dia5');

        Route::delete('/seguimientos-uht/{seguimientoUht}', [SeguimientoUhtController::class, 'destroy'])
            ->name('seguimiento-uht.destroy');


        Route::post('/seguimiento-uht/autocompletar-dia2-feriado', [SeguimientoUhtController::class, 'autocompletarDia2Feriado'])->name('seguimiento-uht.autocompletar-dia2-feriado');
        Route::post('/seguimiento-uht/autocompletar-dia5-feriado', [SeguimientoUhtController::class, 'autocompletarDia5Feriado'])->name('seguimiento-uht.autocompletar-dia5-feriado');


        Route::get('/seguimiento-uht/pdf', [SeguimientoUhtController::class, 'pdf'])->name('seguimiento-uht.pdf');

        //contadores producto terminado

        Route::get('conteos', [ConteoController::class, 'index'])
            ->name('conteos.index')
            ->middleware(AdminOrPermission::class . ':r_conteos');

        Route::get('conteos/crear', [ConteoController::class, 'create'])
            ->name('conteos.create')
            ->middleware(AdminOrPermission::class . ':c_conteos');
        Route::post('conteos', [ConteoController::class, 'store'])
            ->name('conteos.store')
            ->middleware(AdminOrPermission::class . ':c_conteos');
        Route::put('/conteos/{conteo}', [ConteoController::class, 'update'])->name('conteos.update')
            ->middleware(AdminOrPermission::class . ':u_conteos');
        Route::delete('/conteos/{conteo}', [ConteoController::class, 'destroy'])->name('conteos.destroy')
            ->middleware(AdminOrPermission::class . ':d_conteos');

        // hisopados

        Route::get('hisopado', [HisopadoController::class, 'index'])
            ->name('hisopados.index')
            ->middleware(AdminOrPermission::class . ':r_hisopado');

        Route::get('hisopado/crear', [HisopadoController::class, 'create'])
            ->name('hisopados.create')
            ->middleware(AdminOrPermission::class . ':c_hisopado');
        Route::post('hisopado', [HisopadoController::class, 'store'])
            ->name('hisopados.store')
            ->middleware(AdminOrPermission::class . ':c_hisopado');


        Route::post('hisopado/{hisopado}/guardar-lectura', [HisopadoController::class, 'guardarLectura'])->name('hisopados.guardar-lectura')
            ->middleware(AdminOrPermission::class . ':u_hisopado');
        Route::post('hisopado/{hisopado}/guardar-siembra', [HisopadoController::class, 'guardarSiembra'])->name('hisopados.guardar-siembra')
            ->middleware(AdminOrPermission::class . ':u_hisopado');
        Route::post('hisopado/{hisopado}/lectura-cero', [HisopadoController::class, 'lecturaCero'])->name('hisopados.lectura-cero')
            ->middleware(AdminOrPermission::class . ':u_hisopado');

        Route::post('/hisopados/reset-estado', [HisopadoController::class, 'resetEstado'])
            ->name('hisopados.reset-estado')
            ->middleware(AdminOrPermission::class . ':u_hisopado'); // Asegúrate de tener el middleware de permisos


        Route::post('/hisopados/marcar-capacitado', [HisopadoController::class, 'marcarComoCapacitado'])
            ->name('hisopados.marcar-capacitado')

            ->middleware(AdminOrPermission::class . ':capacitar_hisopado');

        Route::post('/hisopados/crear-capacitado', [HisopadoController::class, 'crearHisopadoCapacitado'])
            ->name('hisopados.crear-capacitado')

            ->middleware(AdminOrPermission::class . ':u_hisopado');

        Route::get('/hisopados/pdf', [HisopadoController::class, 'pdf'])->name('hisopados.pdf');

        //externos

        Route::prefix('solicitudes')->name('solicitudes.')->group(function () {
            Route::get('/', [SolicitudLaboratorioExternoController::class, 'index'])->name('laboratorio-externo.solicitudes.index');


            Route::get('/crear', [SolicitudLaboratorioExternoController::class, 'create'])
                ->name('laboratorio-externo.solicitudes.create');
        });

        // Resultados de verificaciones de dispositivos
        Route::get('verificaciones-dispositivos', [VerificacionDispositivoController::class, 'index'])
            ->name('verificaciones-dispositivos.index')
            ->middleware(AdminOrPermission::class . ':r_verificacionesDispositivos');

        // Administración de Dispositivos de Medición (CRUD centralizado)
        Route::get('dispositivos-medicion/admin', [DispositivoMedicionController::class, 'admin'])
            ->name('dispositivos-medicion.admin')
            ->middleware(AdminOrPermission::class . ':r_verificacionesDispositivos');
        Route::get('dispositivos-medicion/reporte', [DispositivoMedicionController::class, 'reporteData'])
            ->name('dispositivos-medicion.reporte');
        Route::post('dispositivos-medicion', [DispositivoMedicionController::class, 'store'])
            ->name('dispositivos-medicion.store')
            ->middleware(AdminOrPermission::class . ':c_verificacionesDispositivos');
        Route::put('dispositivos-medicion/{dispositivo_medicion}', [DispositivoMedicionController::class, 'update'])
            ->name('dispositivos-medicion.update')
            ->middleware(AdminOrPermission::class . ':u_verificacionesDispositivos');
        Route::delete('dispositivos-medicion/{dispositivo_medicion}', [DispositivoMedicionController::class, 'destroy'])
            ->name('dispositivos-medicion.destroy')
            ->middleware(AdminOrPermission::class . ':d_verificacionesDispositivos');

        // Primero las rutas específicas de PDF
        Route::get('/dispositivos-refractometros/pdf', [DispositivoRefractometroController::class, 'pdf'])->name('dispositivos-refractometros.pdf');
        Route::get('/dispositivos-phmetros/pdf', [DispositivoPhmetroController::class, 'pdf'])->name('dispositivos-phmetros.pdf');
        Route::get('/dispositivos-temperaturas/pdf', [DispositivoTemperaturaController::class, 'pdf'])->name('dispositivos-temperaturas.pdf');
        Route::get('/dispositivos-crioscopos/pdf', [DispositivoCrioscopoController::class, 'pdf'])->name('dispositivos-crioscopos.pdf');
        Route::get('/dispositivos-termohigrometros/pdf', [DispositivoTermohigrometroController::class, 'pdf'])->name('dispositivos-termohigrometros.pdf');

        // Rutas CRUD para cada tipo de verificación (mantén las que ya tienes)
        Route::resource('dispositivos-refractometros', DispositivoRefractometroController::class);
        Route::resource('dispositivos-phmetros', DispositivoPhmetroController::class);
        Route::resource('dispositivos-temperaturas', DispositivoTemperaturaController::class);
        Route::resource('dispositivos-crioscopos', DispositivoCrioscopoController::class);
        Route::resource('dispositivos-termohigrometros', DispositivoTermohigrometroController::class);

        Route::get('dispositivos-medicion/cronograma', [VerificacionDispositivoController::class, 'cronogramaPdf'])
            ->name('dispositivos-medicion.cronograma')
            ->middleware(AdminOrPermission::class . ':r_verificacionesDispositivos');

        Route::get('dispositivos-medicion/pdf-2025', [VerificacionDispositivoController::class, 'pdf2025'])
            ->name('dispositivos-medicion.pdf2025')
            ->middleware(AdminOrPermission::class . ':r_verificacionesDispositivos');

        Route::get('dispositivos-medicion/pdf-2026', [VerificacionDispositivoController::class, 'pdf2026'])
            ->name('dispositivos-medicion.pdf2026')
            ->middleware(AdminOrPermission::class . ':r_verificacionesDispositivos');


        // Ambiente frio

        Route::get('ambiente-frio', [AmbienteFrioController::class, 'index'])
            ->name('ambiente-frio.index')
            ->middleware(AdminOrPermission::class . ':r_ambienteFrio');
        Route::post('/ambiente-frio/confirmar', [AmbienteFrioController::class, 'confirmar'])
            ->name('ambiente-frio.confirmar');

        Route::post('/ambiente-frio/buscar-por-orp', [AmbienteFrioController::class, 'buscarPorOrp'])
            ->name('ambiente-frio.buscar-por-orp');




        // UHT
        Route::get('/uht', [UhtHtstController::class, 'index'])->defaults('tipo', 'UHT')->name('uht.index');
        // HTST
        Route::get('/htst', [UhtHtstController::class, 'index'])->defaults('tipo', 'HTST')->name('htst.index');

        // Rutas de actualización (compartidas)
        Route::put('/uht/pesos/{id}', [UhtHtstController::class, 'updatePeso'])->name('uht.updatePeso');
        Route::put('/uht/temperatura/{id}', [UhtHtstController::class, 'updateTemperatura'])->name('uht.updateTemperatura');
        Route::put('/uht/vencimiento/{id}', [UhtHtstController::class, 'updateVencimiento'])->name('uht.updateVencimiento');



        // ===========================
        // Rutas para Higiene de Acopio (completo)
        // ===========================

        Route::get('higiene-acopio', [HigieneAcopioController::class, 'index'])
            ->name('higiene-acopio.index')
            ->middleware(AdminOrPermission::class . ':r_higieneAcopio');

        Route::get('/higiene-acopio/pdf', [HigieneAcopioController::class, 'pdf'])->name('higiene-acopio.pdf');

        Route::get('higiene-acopio/{higieneAcopio}/editar', [HigieneAcopioController::class, 'edit'])
            ->name('higiene-acopio.edit')
            ->middleware(AdminOrPermission::class . ':u_higieneAcopio');

        Route::put('higiene-acopio/{higieneAcopio}', [HigieneAcopioController::class, 'update'])
            ->name('higiene-acopio.update')
            ->middleware(AdminOrPermission::class . ':u_higieneAcopio');

        // NUEVA RUTA PARA COMPLETAR (cambiar estado a Completado)
        Route::patch('higiene-acopio/{higieneAcopio}/completar', [HigieneAcopioController::class, 'completar'])
            ->name('higiene-acopio.completar')
            ->middleware(AdminOrPermission::class . ':u_higieneAcopio'); // o un permiso específico

        // Ruta para eliminar (si no la tienes)
        Route::delete('higiene-acopio/{higieneAcopio}', [HigieneAcopioController::class, 'destroy'])
            ->name('higiene-acopio.destroy')
            ->middleware(AdminOrPermission::class . ':d_higieneAcopio');


        // ===========================
        // Rutas para Limpieza de Tanques Aéreos
        // ===========================

        Route::get('limpieza-tanques-aereos', [LimpiezaTanqueAereoController::class, 'index'])
            ->name('limpieza-tanques-aereos.index')
            ->middleware(AdminOrPermission::class . ':r_limpiezaTanques');

        Route::get('limpieza-tanques-aereos/crear', [LimpiezaTanqueAereoController::class, 'create'])
            ->name('limpieza-tanques-aereos.create')
            ->middleware(AdminOrPermission::class . ':c_limpiezaTanques');

        Route::post('limpieza-tanques-aereos', [LimpiezaTanqueAereoController::class, 'store'])
            ->name('limpieza-tanques-aereos.store')
            ->middleware(AdminOrPermission::class . ':c_limpiezaTanques');

        Route::get('limpieza-tanques-aereos/{limpieza_tanques_aereo}/editar', [LimpiezaTanqueAereoController::class, 'edit'])
            ->name('limpieza-tanques-aereos.edit')
            ->middleware(AdminOrPermission::class . ':u_limpiezaTanques');

        Route::put('limpieza-tanques-aereos/{limpieza_tanques_aereo}', [LimpiezaTanqueAereoController::class, 'update'])
            ->name('limpieza-tanques-aereos.update')
            ->middleware(AdminOrPermission::class . ':u_limpiezaTanques');

        Route::delete('limpieza-tanques-aereos/{limpieza_tanques_aereo}', [LimpiezaTanqueAereoController::class, 'destroy'])
            ->name('limpieza-tanques-aereos.destroy')
            ->middleware(AdminOrPermission::class . ':d_limpiezaTanques');

        // Aditivos químicos para servicios
        Route::get('aditivos-quimicos', [AditivoQuimicoServicioController::class, 'index'])
            ->name('aditivos-quimicos.index')
            ->middleware(AdminOrPermission::class . ':r_aditivosQuimicos');
        Route::get('aditivos-quimicos/pdf', [AditivoQuimicoServicioController::class, 'pdf'])
            ->name('aditivos-quimicos.pdf')
            ->middleware(AdminOrPermission::class . ':r_aditivosQuimicos');
        Route::post('aditivos-quimicos', [AditivoQuimicoServicioController::class, 'store'])
            ->name('aditivos-quimicos.store')
            ->middleware(AdminOrPermission::class . ':c_aditivosQuimicos');
        Route::put('aditivos-quimicos/{aditivoQuimico}', [AditivoQuimicoServicioController::class, 'update'])
            ->name('aditivos-quimicos.update')
            ->middleware(AdminOrPermission::class . ':u_aditivosQuimicos');
        Route::delete('aditivos-quimicos/{aditivoQuimico}', [AditivoQuimicoServicioController::class, 'destroy'])
            ->name('aditivos-quimicos.destroy')
            ->middleware(AdminOrPermission::class . ':d_aditivosQuimicos');

        // Control fisicoquímico organoléptico
        Route::get('control-fisicoquimico-organoleptico', [ControlFisicoQuimicoOrganolepticoController::class, 'index'])
            ->name('control-fisicoquimico-organoleptico.index')
            ->middleware(AdminOrPermission::class . ':r_controlFisicoQuimico');
        Route::get('control-fisicoquimico-organoleptico/pdf', [ControlFisicoQuimicoOrganolepticoController::class, 'pdf'])
            ->name('control-fisicoquimico-organoleptico.pdf')
            ->middleware(AdminOrPermission::class . ':r_controlFisicoQuimico');
        Route::post('control-fisicoquimico-organoleptico', [ControlFisicoQuimicoOrganolepticoController::class, 'store'])
            ->name('control-fisicoquimico-organoleptico.store')
            ->middleware(AdminOrPermission::class . ':c_controlFisicoQuimico');
        Route::put('control-fisicoquimico-organoleptico/{controlFQO}', [ControlFisicoQuimicoOrganolepticoController::class, 'update'])
            ->name('control-fisicoquimico-organoleptico.update')
            ->middleware(AdminOrPermission::class . ':u_controlFisicoQuimico');
        Route::delete('control-fisicoquimico-organoleptico/{controlFQO}', [ControlFisicoQuimicoOrganolepticoController::class, 'destroy'])
            ->name('control-fisicoquimico-organoleptico.destroy')
            ->middleware(AdminOrPermission::class . ':d_controlFisicoQuimico');



        // ===========================
        // Rutas para Tratamiento de Agua Residual
        // ===========================

        Route::get('tratamiento-agua', [TratamientoAguaResidualController::class, 'index'])
            ->name('tratamiento-agua.index')
            ->middleware(AdminOrPermission::class . ':r_tratamientoAgua');

        Route::post('tratamiento-agua/iniciar', [TratamientoAguaResidualController::class, 'iniciarDia'])
            ->name('tratamiento-agua.iniciar')
            ->middleware(AdminOrPermission::class . ':c_tratamientoAgua');

        Route::get('tratamiento-agua/pdf', [TratamientoAguaResidualController::class, 'pdf'])
            ->name('tratamiento-agua.pdf')
            ->middleware(AdminOrPermission::class . ':r_tratamientoAgua');

        Route::put('tratamiento-agua/{registro}', [TratamientoAguaResidualController::class, 'update'])
            ->name('tratamiento-agua.update')
            ->middleware(AdminOrPermission::class . ':u_tratamientoAgua');

        Route::delete('tratamiento-agua/{registro}', [TratamientoAguaResidualController::class, 'destroy'])
            ->name('tratamiento-agua.destroy')
            ->middleware(AdminOrPermission::class . ':d_tratamientoAgua');


        Route::prefix('parametros-linea')->group(function () {
            Route::get('/', [ParametroLineaController::class, 'index'])->name('parametros-linea.index')->middleware(AdminOrPermission::class . ':r_parametrosLinea');
            Route::post('/', [ParametroLineaController::class, 'store'])->name('parametros-linea.store')->middleware(AdminOrPermission::class . ':c_parametrosLinea');
            Route::put('/{parametroLinea}', [ParametroLineaController::class, 'update'])->name('parametros-linea.update')->middleware(AdminOrPermission::class . ':u_parametrosLinea');
            Route::delete('/{parametroLinea}', [ParametroLineaController::class, 'destroy'])->name('parametros-linea.destroy')->middleware(AdminOrPermission::class . ':d_parametrosLinea');
            Route::post('/masivo', [ParametroLineaController::class, 'masivo'])->name('parametros-linea.masivo')->middleware(AdminOrPermission::class . ':u_parametrosLinea');
            Route::delete('/masivo', [ParametroLineaController::class, 'eliminarMasivo'])->name('parametros-linea.eliminar-masivo')->middleware(AdminOrPermission::class . ':d_parametrosLinea');
        });



        // ===========================
        // Rutas para Lugares de Control de Temperatura
        // ===========================
        Route::get('lugares-control-temperatura', [LugarControlTemperaturaController::class, 'index'])
            ->name('lugares-control-temperatura.index')
            ->middleware(AdminOrPermission::class . ':r_lugarControlTemperatura');

        Route::post('lugares-control-temperatura', [LugarControlTemperaturaController::class, 'store'])
            ->name('lugares-control-temperatura.store')
            ->middleware(AdminOrPermission::class . ':c_lugarControlTemperatura');

        Route::get('lugares-control-temperatura/{lugares_control_temperatura}/editar', [LugarControlTemperaturaController::class, 'edit'])
            ->name('lugares-control-temperatura.edit')
            ->middleware(AdminOrPermission::class . ':u_lugarControlTemperatura');

        Route::put('lugares-control-temperatura/{lugares_control_temperatura}', [LugarControlTemperaturaController::class, 'update'])
            ->name('lugares-control-temperatura.update')
            ->middleware(AdminOrPermission::class . ':u_lugarControlTemperatura');

        Route::delete('lugares-control-temperatura/{lugares_control_temperatura}', [LugarControlTemperaturaController::class, 'destroy'])
            ->name('lugares-control-temperatura.destroy')
            ->middleware(AdminOrPermission::class . ':d_lugarControlTemperatura');

        Route::put('lugares-control-temperatura/{lugares_control_temperatura}/toggle-estado', [LugarControlTemperaturaController::class, 'toggleEstado'])
            ->name('lugares-control-temperatura.toggle-estado')
            ->middleware(AdminOrPermission::class . ':u_lugarControlTemperatura');

        // ===========================
        // Rutas para Temperaturas Almacén Congelador
        // ===========================
        Route::get('temperaturas-almacen-congelador', [TemperaturaAlmacenCongeladorController::class, 'index'])
            ->name('temperaturas-almacen-congelador.index')
            ->middleware(AdminOrPermission::class . ':r_temperaturaAlmacenCongelador');

        Route::get('temperaturas-almacen-congelador/crear', [TemperaturaAlmacenCongeladorController::class, 'create'])
            ->name('temperaturas-almacen-congelador.create')
            ->middleware(AdminOrPermission::class . ':c_temperaturaAlmacenCongelador');

        Route::post('temperaturas-almacen-congelador', [TemperaturaAlmacenCongeladorController::class, 'store'])
            ->name('temperaturas-almacen-congelador.store')
            ->middleware(AdminOrPermission::class . ':c_temperaturaAlmacenCongelador');

        Route::get('temperaturas-almacen-congelador/{temperaturas_almacen_congelador}/editar', [TemperaturaAlmacenCongeladorController::class, 'edit'])
            ->name('temperaturas-almacen-congelador.edit')
            ->middleware(AdminOrPermission::class . ':u_temperaturaAlmacenCongelador');

        Route::put('temperaturas-almacen-congelador/{temperaturas_almacen_congelador}', [TemperaturaAlmacenCongeladorController::class, 'update'])
            ->name('temperaturas-almacen-congelador.update')
            ->middleware(AdminOrPermission::class . ':u_temperaturaAlmacenCongelador');

        Route::delete('temperaturas-almacen-congelador/{temperaturas_almacen_congelador}', [TemperaturaAlmacenCongeladorController::class, 'destroy'])
            ->name('temperaturas-almacen-congelador.destroy')
            ->middleware(AdminOrPermission::class . ':d_temperaturaAlmacenCongelador');

        Route::get('temperaturas-almacen-congelador/pdf', [TemperaturaAlmacenCongeladorController::class, 'pdf'])
            ->name('temperaturas-almacen-congelador.pdf')
            ->middleware(AdminOrPermission::class . ':r_temperaturaAlmacenCongelador');
        Route::get('almacen-temperaturas/pdf', [TemperaturaAlmacenCongeladorController::class, 'pdfAlmacenTemperaturas'])
            ->name('almacen-temperaturas.pdf')
            ->middleware(AdminOrPermission::class . ':r_temperaturaAlmacenCongelador');

        // ===========================
        // Rutas para Servicios de Frío
        // ===========================
        Route::get('servicios-frios', [ServicioFrioController::class, 'index'])
            ->name('servicios-frios.index')
            ->middleware(AdminOrPermission::class . ':r_servicioFrio');

        Route::get('servicios-frios/crear', [ServicioFrioController::class, 'create'])
            ->name('servicios-frios.create')
            ->middleware(AdminOrPermission::class . ':c_servicioFrio');

        Route::post('servicios-frios', [ServicioFrioController::class, 'store'])
            ->name('servicios-frios.store')
            ->middleware(AdminOrPermission::class . ':c_servicioFrio');

        Route::get('servicios-frios/{servicios_frio}/editar', [ServicioFrioController::class, 'edit'])
            ->name('servicios-frios.edit')
            ->middleware(AdminOrPermission::class . ':u_servicioFrio');

        Route::put('servicios-frios/{servicios_frio}', [ServicioFrioController::class, 'update'])
            ->name('servicios-frios.update')
            ->middleware(AdminOrPermission::class . ':u_servicioFrio');

        Route::delete('servicios-frios/{servicios_frio}', [ServicioFrioController::class, 'destroy'])
            ->name('servicios-frios.destroy')
            ->middleware(AdminOrPermission::class . ':d_servicioFrio');

        Route::get('servicios-frios/pdf', [ServicioFrioController::class, 'pdf'])
            ->name('servicios-frios.pdf')
            ->middleware(AdminOrPermission::class . ':r_servicioFrio');
        Route::get('control-frio/pdf', [ServicioFrioController::class, 'pdfControlFrio'])
            ->name('control-frio.pdf')
            ->middleware(AdminOrPermission::class . ':r_servicioFrio');

        // Agua Helada
        Route::get('agua-helada', [AguaHeladaController::class, 'index'])
            ->name('agua-helada.index')
            ->middleware(AdminOrPermission::class . ':r_aguaHelada');

        Route::post('agua-helada', [AguaHeladaController::class, 'store'])
            ->name('agua-helada.store')
            ->middleware(AdminOrPermission::class . ':c_aguaHelada');

        Route::put('agua-helada/{agua_helada}', [AguaHeladaController::class, 'update'])
            ->name('agua-helada.update')
            ->middleware(AdminOrPermission::class . ':u_aguaHelada');

        Route::delete('agua-helada/{agua_helada}', [AguaHeladaController::class, 'destroy'])
            ->name('agua-helada.destroy')
            ->middleware(AdminOrPermission::class . ':d_aguaHelada');



        Route::get('infraestructuras', [InfraestructuraController::class, 'index'])->name('infraestructuras.index')->middleware(AdminOrPermission::class . ':r_infraestructura');
        Route::post('infraestructuras', [InfraestructuraController::class, 'store'])->name('infraestructuras.store')->middleware(AdminOrPermission::class . ':c_infraestructura');
        Route::put('infraestructuras/{infraestructura}', [InfraestructuraController::class, 'update'])->name('infraestructuras.update')->middleware(AdminOrPermission::class . ':u_infraestructura');
        Route::delete('infraestructuras/{infraestructura}', [InfraestructuraController::class, 'destroy'])->name('infraestructuras.destroy')->middleware(AdminOrPermission::class . ':d_infraestructura');

        // Inspecciones
        // Inspecciones
        Route::get('inspecciones', [InspeccionInfraestructuraController::class, 'index'])->name('inspecciones.index')->middleware(AdminOrPermission::class . ':r_inspeccionInfra');
        Route::get('inspecciones/crear', [InspeccionInfraestructuraController::class, 'create'])->name('inspecciones.create')->middleware(AdminOrPermission::class . ':c_inspeccionInfra');
        Route::get('inspecciones/masivo', [InspeccionInfraestructuraController::class, 'masivo'])->name('inspecciones.masivo')->middleware(AdminOrPermission::class . ':c_inspeccionInfra');
        Route::post('inspecciones', [InspeccionInfraestructuraController::class, 'store'])->name('inspecciones.store')->middleware(AdminOrPermission::class . ':c_inspeccionInfra');
        Route::post('inspecciones/masivo', [InspeccionInfraestructuraController::class, 'storeMasivo'])->name('inspecciones.storeMasivo')->middleware(AdminOrPermission::class . ':c_inspeccionInfra');

        // IMPORTANTE: La ruta del PDF debe ir ANTES de la ruta con parámetro {inspeccione}
        Route::get('inspecciones/pdf', [InspeccionInfraestructuraController::class, 'pdf'])->name('inspecciones.pdf')->middleware(AdminOrPermission::class . ':r_inspeccionInfra');

        // Estas rutas con parámetros deben ir DESPUÉS de las rutas específicas
        Route::get('inspecciones/{inspeccione}', [InspeccionInfraestructuraController::class, 'show'])->name('inspecciones.show')->middleware(AdminOrPermission::class . ':r_inspeccionInfra');
        Route::delete('inspecciones/{inspeccione}', [InspeccionInfraestructuraController::class, 'destroy'])->name('inspecciones.destroy')->middleware(AdminOrPermission::class . ':d_inspeccionInfra');
        Route::get('inspecciones/{inspeccione}/exportar', [InspeccionInfraestructuraController::class, 'exportar'])->name('inspecciones.exportar')->middleware(AdminOrPermission::class . ':r_inspeccionInfra');

        // Acciones (hallazgos)
        Route::get('acciones-infraestructura', [AccionInfraestructuraController::class, 'index'])->name('acciones-infraestructura.index')->middleware(AdminOrPermission::class . ':r_accionInfra');
        Route::post('acciones-infraestructura', [AccionInfraestructuraController::class, 'store'])->name('acciones-infraestructura.store')->middleware(AdminOrPermission::class . ':c_accionInfra');
        Route::put('acciones-infraestructura/{accione}', [AccionInfraestructuraController::class, 'update'])->name('acciones-infraestructura.update')->middleware(AdminOrPermission::class . ':u_accionInfra');
        Route::delete('acciones-infraestructura/{accione}', [AccionInfraestructuraController::class, 'destroy'])->name('acciones-infraestructura.destroy')->middleware(AdminOrPermission::class . ':d_accionInfra');

        // Seguimiento de utensilios
        Route::get('utensilios', [UtensilioController::class, 'index'])->name('utensilios.index');
        Route::get('utensilios/pdf', [UtensilioController::class, 'pdf'])->name('utensilios.pdf');
        Route::get('utensilios/crear/{frecuencia?}', [UtensilioController::class, 'create'])->name('utensilios.create');
        Route::post('utensilios/{frecuencia?}', [UtensilioController::class, 'store'])->name('utensilios.store');

        // Seguimiento de acrílicos
        Route::get('acrilicos', [AcrilicoController::class, 'index'])->name('acrilicos.index');
        Route::get('acrilicos/pdf', [AcrilicoController::class, 'pdf'])->name('acrilicos.pdf');
        Route::get('acrilicos/crear/{frecuencia?}', [AcrilicoController::class, 'create'])->name('acrilicos.create');
        Route::post('acrilicos/{frecuencia?}', [AcrilicoController::class, 'store'])->name('acrilicos.store');
    }

);



// ===========================
// Arranques de línea
// ===========================
Route::get('arranques-linea', [ArranqueLineaController::class, 'index'])
    ->name('arranques-linea.index')
    ->middleware(AdminOrPermission::class . ':r_arranqueLinea');

Route::get('arranques-linea/crear', [ArranqueLineaController::class, 'create'])
    ->name('arranques-linea.create')
    ->middleware(AdminOrPermission::class . ':c_arranqueLinea');

Route::get('arranques-linea/{arranqueLinea}/detalles/crear', [ArranqueLineaController::class, 'createDetalles'])
    ->name('arranques-linea.detalles.create')
    ->middleware(AdminOrPermission::class . ':c_arranqueLinea');

Route::get('arranques-linea/{arranqueLinea}/detalles/{numero}/editar', [ArranqueLineaController::class, 'editDetalles'])
    ->name('arranques-linea.detalles.edit')
    ->middleware(AdminOrPermission::class . ':u_arranqueLinea');

Route::post('arranques-linea/{arranqueLinea}/detalles', [ArranqueLineaController::class, 'storeDetalles'])
    ->name('arranques-linea.detalles.store')
    ->middleware(AdminOrPermission::class . ':c_arranqueLinea');

Route::put('arranques-linea/{arranqueLinea}/detalles/{numero}', [ArranqueLineaController::class, 'updateDetalles'])
    ->name('arranques-linea.detalles.update')
    ->middleware(AdminOrPermission::class . ':u_arranqueLinea');

Route::delete('arranques-linea/{arranqueLinea}/detalles/{numero}', [ArranqueLineaController::class, 'destroyDetalles'])
    ->name('arranques-linea.detalles.destroy')
    ->middleware(AdminOrPermission::class . ':u_arranqueLinea');

Route::post('arranques-linea/{arranqueLinea}/marcar-final', [ArranqueLineaController::class, 'marcarFinal'])
    ->name('arranques-linea.marcar-final')
    ->middleware(AdminOrPermission::class . ':u_arranqueLinea');

Route::post('arranques-linea/cip', [ArranqueLineaController::class, 'storeCip'])
    ->name('arranques-linea.cip.store')
    ->middleware(AdminOrPermission::class . ':c_arranqueLinea');

Route::post('arranques-linea/{arranqueLinea}/cip/terminar', [ArranqueLineaController::class, 'terminarCip'])
    ->name('arranques-linea.cip.terminar')
    ->middleware(AdminOrPermission::class . ':u_arranqueLinea');

Route::get('arranques-linea/{arranqueLinea}/editar', [ArranqueLineaController::class, 'edit'])
    ->name('arranques-linea.edit')
    ->middleware(AdminOrPermission::class . ':u_arranqueLinea');

Route::put('arranques-linea/{arranqueLinea}', [ArranqueLineaController::class, 'update'])
    ->name('arranques-linea.update')
    ->middleware(AdminOrPermission::class . ':u_arranqueLinea');

Route::post('arranques-linea', [ArranqueLineaController::class, 'store'])
    ->name('arranques-linea.store')
    ->middleware(AdminOrPermission::class . ':c_arranqueLinea');

// ===========================
// Rutas para Sustancias Quimicas
// ===========================

// Index
Route::get('sustancias-quimicas', [MovimientoSustanciaController::class, 'index'])
    ->name('sustancias-quimicas.index')
    ->middleware(AdminOrPermission::class . ':r_sustanciasQuimicas');

// Create
Route::get('sustancias-quimicas/crear', [MovimientoSustanciaController::class, 'create'])
    ->name('sustancias-quimicas.create');

// Store
Route::post('sustancias-quimicas', [MovimientoSustanciaController::class, 'store'])
    ->name('sustancias-quimicas.store')
    ->middleware(AdminOrPermission::class . ':c_sustanciasQuimicas');

// Edit
Route::get('sustancias-quimicas/{movimiento}/editar', [MovimientoSustanciaController::class, 'edit'])
    ->name('sustancias-quimicas.edit')
    ->middleware(AdminOrPermission::class . ':u_sustanciasQuimicas');

// Update
Route::put('sustancias-quimicas/{movimiento}', [MovimientoSustanciaController::class, 'update'])
    ->name('sustancias-quimicas.update')
    ->middleware(AdminOrPermission::class . ':u_sustanciasQuimicas');


Route::get('/sustancias-quimicas/pdf', [MovimientoSustanciaController::class, 'pdf'])
    ->name('sustancias-quimicas.pdf');


// Destroy
Route::delete('sustancias-quimicas/{movimiento}', [MovimientoSustanciaController::class, 'destroy'])
    ->name('sustancias-quimicas.destroy')
    ->middleware(AdminOrPermission::class . ':d_sustanciasQuimicas');

Route::post('sustancias-quimicas/ingresar-stock', [MovimientoSustanciaController::class, 'ingresarStock'])
    ->name('sustancias-quimicas.ingresar-stock')
    ->middleware(AdminOrPermission::class . ':ingresar_sustanciasQuimicas');
Route::post('sustancias-quimicas/solicitar-sustancia', [MovimientoSustanciaController::class, 'solicitarSustancia'])
    ->name('sustancias-quimicas.solicitar-sustancia')
    ->middleware(AdminOrPermission::class . ':c_sustanciasQuimicas');


Route::post('sustancias-quimicas/{id}/aceptar', [MovimientoSustanciaController::class, 'aceptar'])
    ->name('movimientos-sustancias.aceptar')

    ->middleware(AdminOrPermission::class . ':u_sustanciasQuimicas');

Route::post('sustancias-quimicas/{id}/rechazar', [MovimientoSustanciaController::class, 'rechazar'])
    ->name('movimientos-sustancias.rechazar')


    ->middleware(AdminOrPermission::class . ':u_sustanciasQuimicas');

Route::post('sustancias-quimicas/{id}/entregar', [MovimientoSustanciaController::class, 'entregar'])
    ->name('movimientos-sustancias.entregar')

    ->middleware(AdminOrPermission::class . ':u_sustanciasQuimicas');



Route::get('/movimientos-sustancia/pdf', [MovimientoSustanciaController::class, 'pdf'])->name('movimientos-sustancia.pdf');


// ===========================
// Rutas para Recepción de Materia Prima
// ===========================

// Index
Route::get('recepciones-materia-prima', [RecepcionMateriaPrimaController::class, 'index'])
    ->name('recepciones-materia-prima.index')
    ->middleware(AdminOrPermission::class . ':r_recepcionMateriaPrima');

Route::get('recepciones-materia-prima2', [RecepcionMateriaPrimaController::class, 'index2'])
    ->name('recepciones-materia-prima.index2')
    ->middleware(AdminOrPermission::class . ':r_recepcionMateriaPrima2');
// Create
Route::get('recepciones-materia-prima/crear', [RecepcionMateriaPrimaController::class, 'create'])
    ->name('recepciones-materia-prima.create')
    ->middleware(AdminOrPermission::class . ':c_recepcionMateriaPrima');

// Store
Route::post('recepciones-materia-prima', [RecepcionMateriaPrimaController::class, 'store'])
    ->name('recepciones-materia-prima.store')
    ->middleware(AdminOrPermission::class . ':c_recepcionMateriaPrima');

// Editutensi
Route::get('recepciones-materia-prima/{recepcion}/editar', [RecepcionMateriaPrimaController::class, 'edit'])
    ->name('recepciones-materia-prima.edit')
    ->middleware(AdminOrPermission::class . ':u_recepcionMateriaPrima');

// Update
Route::put('recepciones-materia-prima/{recepcion}', [RecepcionMateriaPrimaController::class, 'update'])
    ->name('recepciones-materia-prima.update')
    ->middleware(AdminOrPermission::class . ':u_recepcionMateriaPrima');

Route::get('recepciones-materia-prima/{recepcion}/certificado', [RecepcionMateriaPrimaController::class, 'certificado'])
    ->name('recepciones-materia-prima.certificado')
    ->middleware(AdminOrPermission::class . ':r_recepcionMateriaPrima2');


Route::put(
    '/planta-lacteos/recepciones-materia-prima/{id}/update-estado',
    [RecepcionMateriaPrimaController::class, 'updateEstado']
)->name('recepciones-materia-prima.update-estado')
    ->middleware(AdminOrPermission::class . ':u_recepcionMateriaPrima');

// Marcar recepción como revisada (asigna estado "Revisado" y revisor)
Route::post('recepciones-materia-prima/{id}/marcar-revisado', [RecepcionMateriaPrimaController::class, 'marcarRevisado'])
    ->name('recepciones-materia-prima.marcar-revisado')
    ->middleware(AdminOrPermission::class . ':u_recepcionMateriaPrima');

Route::get('/recepciones-materia-prima/pdf', [RecepcionMateriaPrimaController::class, 'pdf'])
    ->name('recepciones-materia-prima.pdf')
    ->middleware(AdminOrPermission::class . ':r_recepcionMateriaPrima');

// Informe de materias primas ingresadas
Route::get('informes/materia-prima', [InformeMateriaPrimaController::class, 'index'])
    ->name('informes.materia-prima.index')
    ->middleware(AdminOrPermission::class . ':r_recepcionMateriaPrima');

Route::get('informes/materia-prima/datos', [InformeMateriaPrimaController::class, 'datos'])
    ->name('informes.materia-prima.datos')
    ->middleware(AdminOrPermission::class . ':r_recepcionMateriaPrima');

Route::get('informes/materia-prima/reporte', [InformeMateriaPrimaController::class, 'reporte'])
    ->name('informes.materia-prima.reporte')
    ->middleware(AdminOrPermission::class . ':r_recepcionMateriaPrima');

Route::get('informes/materia-prima/excel', [InformeMateriaPrimaController::class, 'excel'])
    ->name('informes.materia-prima.excel')
    ->middleware(AdminOrPermission::class . ':r_recepcionMateriaPrima');

Route::get('recepciones-materia-prima/{recepcion}/analisis/pdf', [AnalisisMateriaPrimaController::class, 'pdf'])
    ->name('analisis-materia-prima.pdf')
    ->middleware(AdminOrPermission::class . ':r_analisisMateriaPrima');

Route::delete('recepciones-materia-prima/{recepcion}/analisis', [AnalisisMateriaPrimaController::class, 'destroyAllPorRecepcion'])
    ->name('recepciones-materia-prima.analisis.destroy-all')
    ->middleware(AdminOrPermission::class . ':d_analisisMateriaPrima');

Route::post('/recepciones-materia-prima/{recepcion}/generar-analisis', [AnalisisMateriaPrimaController::class, 'generarDesdeRecepcion'])
    ->name('recepciones-materia-prima.generar-analisis')
    ->middleware(AdminOrPermission::class . ':u_recepcionMateriaPrima');


// Destroy
Route::delete('recepciones-materia-prima/{recepcion_materia_prima}', [RecepcionMateriaPrimaController::class, 'destroy'])
    ->name('recepciones-materia-prima.destroy')
    ->middleware(AdminOrPermission::class . ':d_recepcionMateriaPrima');


Route::get('recepciones-materia-prima/{recepcion}/analisis', [AnalisisMateriaPrimaController::class, 'indexPorRecepcion'])
    ->name('recepciones-materia-prima.analisis.index')
    ->middleware(AdminOrPermission::class . ':r_analisisMateriaPrima');

Route::put('analisis-materia-prima/{analisis}', [AnalisisMateriaPrimaController::class, 'update'])
    ->name('analisis-materia-prima.update')
    ->middleware(AdminOrPermission::class . ':u_analisisMateriaPrima');


//auxiliares de materia prima
Route::get('recepciones-materia-prima1/crear', [RecepcionMateriaPrimaController::class, 'create1'])
    ->name('recepciones-materia-prima1.create')
    ->middleware(AdminOrPermission::class . ':c_recepcionMateriaPrima');

// Store
Route::post('recepciones-materia-prima1', [RecepcionMateriaPrimaController::class, 'store1'])
    ->name('recepciones-materia-prima1.store')
    ->middleware(AdminOrPermission::class . ':c_recepcionMateriaPrima');

// Edit
Route::get('recepciones-materia-prima1/{recepcion}/editar', [RecepcionMateriaPrimaController::class, 'edit1'])
    ->name('recepciones-materia-prima1.edit')
    ->middleware(AdminOrPermission::class . ':u_recepcionMateriaPrima');

// Update
Route::put('recepciones-materia-prima1/{recepcion}', [RecepcionMateriaPrimaController::class, 'update1'])
    ->name('recepciones-materia-prima1.update')
    ->middleware(AdminOrPermission::class . ':u_recepcionMateriaPrima');



// Vista única
Route::get('/admin/materia-prima', [AdminMateriaPrimaController::class, 'index'])
    ->name('admin.materia-prima.index')
    ->middleware(AdminOrPermission::class . ':r_adminMateriaPrima');

// Categorías
Route::post('/admin/materia-prima/categorias', [AdminMateriaPrimaController::class, 'categoriasStore'])
    ->name('admin.categorias.store')

    ->middleware(AdminOrPermission::class . ':c_adminMateriaPrima');
Route::put('/admin/materia-prima/categorias/{categoria}', [AdminMateriaPrimaController::class, 'categoriasUpdate'])
    ->name('admin.categorias.update')

    ->middleware(AdminOrPermission::class . ':u_adminMateriaPrima');
Route::delete('/admin/materia-prima/categorias/{categoria}', [AdminMateriaPrimaController::class, 'categoriasDestroy'])
    ->name('admin.categorias.destroy')

    ->middleware(AdminOrPermission::class . ':d_adminMateriaPrima');

// Almacenes
Route::post('/admin/materia-prima/almacenes', [AdminMateriaPrimaController::class, 'almacenesStore'])
    ->name('admin.almacenes.store');
Route::put('/admin/materia-prima/almacenes/{almacen}', [AdminMateriaPrimaController::class, 'almacenesUpdate'])
    ->name('admin.almacenes.update');
Route::delete('/admin/materia-prima/almacenes/{almacen}', [AdminMateriaPrimaController::class, 'almacenesDestroy'])
    ->name('admin.almacenes.destroy');

// Items
Route::post('/admin/materia-prima/items', [AdminMateriaPrimaController::class, 'itemsStore'])
    ->name('admin.items.store');
Route::put('/admin/materia-prima/items/{item}', [AdminMateriaPrimaController::class, 'itemsUpdate'])
    ->name('admin.items.update');
Route::delete('/admin/materia-prima/items/{item}', [AdminMateriaPrimaController::class, 'itemsDestroy'])
    ->name('admin.items.destroy');

// Proveedores
Route::post('/admin/materia-prima/proveedores', [AdminMateriaPrimaController::class, 'proveedoresStore'])
    ->name('admin.proveedores.store');
Route::put('/admin/materia-prima/proveedores/{proveedor}', [AdminMateriaPrimaController::class, 'proveedoresUpdate'])
    ->name('admin.proveedores.update');
Route::delete('/admin/materia-prima/proveedores/{proveedor}', [AdminMateriaPrimaController::class, 'proveedoresDestroy'])
    ->name('admin.proveedores.destroy');


//externos

Route::prefix('externo')->name('externo.')->group(function () {
    // Tipo de muestra
    Route::resource('tipos-muestra', TipoMuestraController::class)
        ->names('tipos-muestra');

    // Solicitudes de análisis
    Route::get('solicitudes', [SolicitudController::class, 'index'])->name('solicitudes.index');
    Route::get('solicitudes/crear', [SolicitudController::class, 'create'])->name('solicitudes.create');
    Route::post('solicitudes', [SolicitudController::class, 'store'])->name('solicitudes.store');
    Route::get('solicitudes/{solicitud}', [SolicitudController::class, 'show'])->name('solicitudes.show');
    // Cambiar estado de solicitud y detalles
    Route::put('solicitudes/{solicitud}/estado', [SolicitudController::class, 'cambiarEstadoSolicitud'])->name('solicitudes.cambiar-estado');
    Route::put('detalles/{detalle}/estado', [SolicitudController::class, 'cambiarEstadoDetalle'])->name('detalles.cambiar-estado');

    // Análisis de microbiología
    Route::get('microbiologia', [MicrobiologiaController::class, 'index'])->name('microbiologia.index'); // ← nueva
    Route::get('microbiologia/{microbiologia}/editar', [MicrobiologiaController::class, 'edit'])->name('microbiologia.edit');
    Route::put('microbiologia/{microbiologia}/siembra', [MicrobiologiaController::class, 'updateSiembra'])->name('microbiologia.siembra');
    Route::put('microbiologia/{microbiologia}/dia2', [MicrobiologiaController::class, 'updateDia2'])->name('microbiologia.dia2');
    Route::put('microbiologia/{microbiologia}/dia5', [MicrobiologiaController::class, 'updateDia5'])->name('microbiologia.dia5');

    Route::post('microbiologia/{microbiologia}/completar-dia2', [MicrobiologiaController::class, 'completarDia2'])->name('microbiologia.completar-dia2');
    Route::post('microbiologia/{microbiologia}/completar-dia5', [MicrobiologiaController::class, 'completarDia5'])->name('microbiologia.completar-dia5');

    // Análisis de actividad de agua
    Route::get('actividad-agua', [ActividadAguaController::class, 'index'])->name('actividad-agua.index'); // ← nueva
    Route::get('actividad-agua/{actividad}/editar', [ActividadAguaController::class, 'edit'])->name('actividad-agua.edit');
    Route::put('actividad-agua/{actividad}', [ActividadAguaController::class, 'update'])->name('actividad-agua.update');

    // Análisis de agua físico
    Route::get('agua-fisico', [AguaFisicoController::class, 'index'])->name('agua-fisico.index'); // ← nueva
    Route::get('agua-fisico/{registro}/editar', [AguaFisicoController::class, 'edit'])->name('agua-fisico.edit');
    Route::put('agua-fisico/{registro}', [AguaFisicoController::class, 'update'])->name('agua-fisico.update');

    // Certificados externos
    Route::get('certificados', [\App\Domain\PlantaLacteos\Http\Controllers\Externo\CertificadoController::class, 'index'])->name('certificados.index');
    Route::post('certificados/{detalle}/emitir', [\App\Domain\PlantaLacteos\Http\Controllers\Externo\CertificadoController::class, 'emitir'])->name('certificados.emitir');
});
