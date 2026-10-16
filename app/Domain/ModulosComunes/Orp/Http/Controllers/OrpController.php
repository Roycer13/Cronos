<?php

namespace App\Domain\ModulosComunes\Orp\Http\Controllers;

use App\Domain\ModulosComunes\Orp\Http\Requests\OrpRequest;
use App\Domain\ModulosComunes\Orp\Models\Orp;
use App\Domain\ModulosComunes\Orp\Services\OrpService;
use App\Domain\ModulosComunes\Productos\Models\ProductoTerminado;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\Unidad;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Http\Controllers\Controller;
use App\Domain\ModulosComunes\Orp\Http\Requests\ImportOrpRequest;
use App\Domain\ModulosComunes\Orp\Models\OrpEstado;
use App\Domain\ModulosComunes\Productos\Models\Destino;
use App\Domain\ModulosComunes\Productos\Models\Linea;
use App\Domain\PlantaLacteos\Models\EstadoPlanta;
use App\Domain\PlantaLacteos\Models\Origen;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class OrpController extends Controller
{
    protected $orpService;
    public function __construct(OrpService $orpService)
    {
        $this->orpService = $orpService;
    }

    private function isAdmin()
    {
        $user = auth()->user();
        return $user && $user->hasRole('admin'); // Ajusta según tu sistema de roles
    }

    private function getUbicacionId()
    {
        $user = auth()->user();
        return $user ? $user->ubicacion_id : null;
    }
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $isAdmin = $this->isAdmin();
        $ubicacionId = $this->getUbicacionId();

        $filtros = $request->only([
            'search',
            'codigo',
            'lote',
            'producto_terminado',
            'ubicacion_id',
            'prioridad',
            'estado_id',
            'revisado',
            'destino_id',
            'per_page',
            // NUEVOS CAMPOS
            'fecha_vencimiento_desde',
            'fecha_vencimiento_hasta',
        ]);

        $ubicacionesPermitidas = $isAdmin
            ? null
            : ((int) $ubicacionId === 2 ? [1, 2] : ($ubicacionId ? [(int) $ubicacionId] : []));

        // La ubicación 2 puede consultar sus ORPs y las de la planta lácteos (ubicación 1).
        if (!$isAdmin) {
            $filtros['ubicacion_id'] = null;
        }

        $orps = $this->orpService->listarOrps($filtros, $ubicacionesPermitidas);

        // Obtener datos para los filtros
        $ubicaciones = $isAdmin
            ? Ubicacion::all()
            : Ubicacion::whereIn('id', $ubicacionesPermitidas ?: [])->get();

        $productos_terminados = ProductoTerminado::all();
        $estados = Estado::all();
        $destinos = Destino::all();

        return Inertia::render('comunes/orp/index', [
            'orps' => $orps,
            'filtros' => $filtros,
            'ubicaciones' => $ubicaciones,
            'productos_terminados' => $productos_terminados,
            'estados' => $estados,
            'destinos' => $destinos,
            'user_role' => $isAdmin ? 'admin' : 'user',
            'can_view_all' => $isAdmin,
            'user_ubicacion_id' => $ubicacionId,
        ]);
    }
    public function create(): Response
    {
        $datosFormulario = $this->obtenerDatosParaFormulario();

        return Inertia::render('comunes/orp/crear', $datosFormulario);
    }

    public function store(OrpRequest $request): RedirectResponse
    {
        $orp = $this->orpService->crearOrp($request);

        return redirect()->route('orps.index')
            ->with('success', 'ORP creada exitosamente.');
    }

    public function show(Orp $orp): Response
    {
        $orp->load([
            'productoTerminado',
            'ubicacion',
            'usuarioCreador',
            'usuarioModificador',
            'revisor',
            'unidad',
            'historialEstados.estado',
            'historialEstados.usuario'
        ]);

        // El frontend actual usa rutas de páginas bajo `resources/js/pages/comunes/orp`.
        // Renderizar la página existente `comunes/orp/reporte` en lugar de la ruta
        // inexistente `ModulosComunes/Productos/Orps/Show` para evitar "Page not found".
        return Inertia::render('comunes/orp/reporte', [
            'orp' => $orp,
        ]);
    }

    public function edit(Orp $orp): Response
    {
        $datosFormulario = $this->obtenerDatosParaFormulario();

        $orp->load([
            'productoTerminado',
            'ubicacion',
            'usuarioCreador',
            'unidad',


        ]);

        return Inertia::render('comunes/orp/editar', array_merge($datosFormulario, [
            'orp' => $orp,
        ]));
    }

    public function update(OrpRequest $request, Orp $orp): RedirectResponse
    {
        $this->orpService->actualizarOrp($request, $orp);

        return redirect()->route('orps.index')
            ->with('success', 'ORP actualizada exitosamente.');
    }

    public function destroy(Orp $orp): RedirectResponse
    {
        $this->orpService->eliminarOrp($orp);

        return redirect()->route('orps.index')
            ->with('success', 'ORP eliminada exitosamente.');
    }

    public function cambiarEstado(Orp $orp, Request $request): RedirectResponse
    {
        $request->validate([
            'estado_id' => 'required|exists:estados,id',
            'usuario_id' => 'required|exists:users,id',
            'observaciones' => 'nullable|string'
        ]);

        $this->orpService->cambiarEstado(
            $orp,
            $request->estado_id,
            $request->usuario_id,
            $request->observaciones
        );

        return redirect()->back()->with('success', 'Estado cambiado exitosamente.');
    }

    public function historialEstados(Orp $orp): Response
    {
        $historial = $this->orpService->obtenerHistorialEstados($orp);

        return Inertia::render('ModulosComunes/Productos/Orps/HistorialEstados', [
            'orp' => $orp,
            'historial' => $historial,
        ]);
    }

    public function actualizarCantidadProducida(Orp $orp, Request $request): RedirectResponse
    {
        $request->validate([
            'cantidad_producida' => 'required|numeric|min:0'
        ]);

        $this->orpService->actualizarCantidadProducida($orp, $request->cantidad_producida);

        return redirect()->back()->with('success', 'Cantidad producida actualizada.');
    }

    // En el método importar, reemplaza el return con:
    public function importar(ImportOrpRequest $request): RedirectResponse
    {
        try {
            $resultado = $this->orpService->importarOrps(
                $request->file('archivo'),
                auth()->id()
            );

            // Construir mensaje detallado para el toast
            $mensajeDetallado = $this->construirMensajeDetalladoImportacion($resultado);

            // IMPORTANTE: Usar session()->flash() o with() en el redirect
            return redirect()->route('orps.index')
                ->with('info', $mensajeDetallado)
                ->with('import_result', $resultado);
        } catch (\Exception $e) {
            Log::error('Error crítico en importación', [
                'usuario' => auth()->id(),
                'archivo' => $request->file('archivo')->getClientOriginalName(),
                'error_completo' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('orps.index')
                ->with('error', 'Error crítico: ' . $e->getMessage());
        }
    }
    /**
     * Obtener datos necesarios para formularios de crear y editar
     */
    private function obtenerDatosParaFormulario(): array
    {
        return [
            'productos_terminados' => ProductoTerminado::all(),
            'ubicaciones' => Ubicacion::all(),
            'unidades' => Unidad::all(),
            'estados' => Estado::all(),
            'usuarios' => User::all(),
        ];
    }
    public function kanban(): Response
    {
        // IDs de estados finales (asumimos que existen con esos nombres)
        $estadosFinales = Estado::whereIn('nombre', ['Cancelado', 'Completado', 'Liberado', 'Cerrado'])
            ->pluck('id')
            ->toArray();

        // Fecha límite: una semana atrás
        $semanaAtras = Carbon::now()->subWeek();

        $orps = Orp::with([
            'productoTerminado.linea',
            'historialEstados' => function ($query) {
                $query->latest('fecha_hora')->take(1)->with('estado');
            }
        ])
            // Subconsulta para obtener el último estado de cada ORP
            ->whereHas('historialEstados', function ($query) {
                $query->whereRaw('fecha_hora = (SELECT MAX(fecha_hora) FROM orp_estados WHERE orp_id = orps.id)');
            })
            // Excluir ORPs cuyo último estado es final y tiene fecha anterior a una semana
            ->whereDoesntHave('historialEstados', function ($query) use ($estadosFinales, $semanaAtras) {
                $query->whereIn('estado_id', $estadosFinales)
                    ->whereRaw('fecha_hora = (SELECT MAX(fecha_hora) FROM orp_estados WHERE orp_id = orps.id)')
                    ->where('fecha_hora', '<', $semanaAtras);
            })
            ->whereNotIn('codigo', ['1', '2', '3'])
            ->orderBy('updated_at', 'desc')
            ->get();

        // Líneas para el filtro del frontend (solo las que tienen productos)
        $lineas = Linea::whereHas('productos')->get(['id', 'nombre']);

        $estados = Estado::all();

        return Inertia::render('comunes/orp/kanban', [
            'orps' => $orps,
            'estados' => $estados,
            'lineas' => $lineas,
        ]);
    }
    private function construirMensajeDetalladoImportacion(array $resultado): string
    {
        $total = $resultado['total_registros'] ?? 0;
        $creados = $resultado['creados'] ?? 0;
        $repetidos = count($resultado['repetidos'] ?? []);
        $errores = count($resultado['errores'] ?? []);
        $creadosDetalleCount = count($resultado['creados_detalle'] ?? []);

        $mensaje = "📊 **Resumen de Importación**\n\n";
        $mensaje .= "• Total procesado: {$total} registros\n";
        $mensaje .= "• ✅ Creadas exitosamente:** {$creados}\n";

        if ($repetidos > 0) {
            $mensaje .= "• ⚠️ Repetidas (omitidas):** {$repetidos}\n";
        }

        if ($errores > 0) {
            $mensaje .= "• ❌ Errores:** {$errores}\n";
        }

        $porcentajeExito = $total > 0 ? round(($creados / $total) * 100, 1) : 0;
        $mensaje .= "\n• 📈 Tasa de éxito:** {$porcentajeExito}%\n\n";

        // Listar errores específicos
        if ($errores > 0) {
            $mensaje .= "❌ ORPs con errores:**\n";
            $contador = 1;
            foreach ($resultado['errores'] ?? [] as $error) {
                if ($contador <= 10) { // Mostrar máximo 10 errores
                    $mensaje .= "   {$contador}. {$error['codigo']} - {$error['error']}\n";
                    $contador++;
                } else {
                    $erroresRestantes = $errores - 10;
                    $mensaje .= "   ... y {$erroresRestantes} errores más.\n";
                    break;
                }
            }
            $mensaje .= "\n";
        }

        // Listar repetidas
        if ($repetidos > 0) {
            $mensaje .= "**⚠️ ORPs repetidas:**\n";
            $contador = 1;
            foreach ($resultado['repetidos'] ?? [] as $repetido) {
                if ($contador <= 10) { // Mostrar máximo 10 repetidas
                    $mensaje .= "   {$contador}. {$repetido['codigo']}\n";
                    $contador++;
                } else {
                    $repetidosRestantes = $repetidos - 10;
                    $mensaje .= "   ... y {$repetidosRestantes} repetidas más.\n";
                    break;
                }
            }
            $mensaje .= "\n";
        }

        // Listar creadas exitosamente
        if ($creados > 0) {
            $mensaje .= "**✅ ORPs creadas exitosamente:**\n";
            $contador = 1;
            foreach ($resultado['creados_detalle'] ?? [] as $creado) {
                if ($contador <= 10) { // Mostrar máximo 10 exitosas
                    $mensaje .= "   {$contador}. {$creado['codigo']} - Lote: {$creado['lote']}\n";
                    $contador++;
                } else {
                    $creadosRestantes = $creadosDetalleCount - 10;
                    $mensaje .= "   ... y {$creadosRestantes} ORPs más.\n";
                    break;
                }
            }
        }

        if ($errores > 0) {
            $mensaje .= "\n**💡 Recomendación:** Revisa los errores y corrige el archivo antes de reimportar.";
        }

        return $mensaje;
    }
    public function completar(Orp $orp)
    {
        // Obtener IDs de envasadoras (igual que en pausar)
        $envasadorasIds = Origen::where('descripcion', 'LIKE', '%ENVASADORA%')->pluck('id')->toArray();

        // Obtener el ID del estado "Completado" (ajusta el nombre según tu base de datos)
        $estadoCompletado = Estado::where('nombre', 'Completado')->first();

        if (!$estadoCompletado) {
            return redirect()->back()->with('error', 'El estado "Completado" no está configurado.');
        }

        DB::transaction(function () use ($orp, $envasadorasIds, $estadoCompletado) {
            // Registrar nuevo estado en el historial de la ORP
            OrpEstado::create([
                'orp_id'       => $orp->id,
                'estado_id'    => $estadoCompletado->id,
                'usuario_id'   => auth()->id(),
                'fecha_hora'   => now(),
                'observaciones' => 'ORP completada',
            ]);

            // Obtener últimos estados de envasadoras
            $ultimosEstados = EstadoPlanta::whereIn('origen_id', $envasadorasIds)
                ->whereIn('id', function ($query) {
                    $query->selectRaw('MAX(id)')
                        ->from('PLL_estado_plantas')
                        ->groupBy('origen_id');
                })
                ->with('detalles')
                ->get();

            // Crear estado "Vacio Sucio" en las envasadoras que tenían la ORP
            foreach ($ultimosEstados as $estado) {
                if ($estado->detalles->contains('orp_id', $orp->id)) {
                    EstadoPlanta::create([
                        'origen_id'    => $estado->origen_id,
                        'proceso_id'   => 25, // Considera obtenerlo dinámicamente
                        'etapa_id'     => null,
                        'user_id'      => auth()->id(),
                        'tiempo'       => now(),
                        'observaciones' => "ORP {$orp->codigo} completada",
                    ]);
                }
            }
        });

        // Opcional: devolver datos actualizados para que React refresque la vista
        return redirect()->back()->with('success', 'ORP completada correctamente.');
    }
    public function pausar(Orp $orp)
    {
        // Obtener IDs de envasadoras
        $envasadorasIds = Origen::where('descripcion', 'LIKE', '%ENVASADORA%')->pluck('id')->toArray();

        // Obtener el ID del estado "En Pausa" (debe existir en la tabla 'estados')
        $estadoPausa = Estado::where('nombre', 'En Pausa')->first();

        if (!$estadoPausa) {
            return redirect()->back()->with('error', 'El estado "En Pausa" no está configurado.');
        }

        DB::transaction(function () use ($orp, $envasadorasIds, $estadoPausa) {
            // Registrar nuevo estado en el historial de la ORP
            OrpEstado::create([
                'orp_id'       => $orp->id,
                'estado_id'    => $estadoPausa->id,
                'usuario_id'   => auth()->id(),
                'fecha_hora'   => now(),
                'observaciones' => 'ORP pausada',
            ]);

            // Obtener últimos estados de envasadoras
            $ultimosEstados = EstadoPlanta::whereIn('origen_id', $envasadorasIds)
                ->whereIn('id', function ($query) {
                    $query->selectRaw('MAX(id)')
                        ->from('PLL_estado_plantas')
                        ->groupBy('origen_id');
                })
                ->with('detalles')
                ->get();

            // Crear estado "Vacio Sucio" en las envasadoras que tenían la ORP
            foreach ($ultimosEstados as $estado) {
                if ($estado->detalles->contains('orp_id', $orp->id)) {
                    EstadoPlanta::create([
                        'origen_id'    => $estado->origen_id,
                        'proceso_id'   => 25, // Idealmente obtener dinámicamente (ej. Proceso::where('nombre','Vacio Sucio')->first()->id)
                        'etapa_id'     => null,
                        'user_id'      => auth()->id(),
                        'tiempo'       => now(),
                        'observaciones' => "ORP {$orp->codigo} pausada",
                    ]);
                }
            }
        });

        return redirect()->back()->with('success', 'ORP pausada correctamente');
    }
}
