<?php

namespace App\Domain\PlantaLacteos\Http\Controllers\Externo;

use App\Domain\ModulosComunes\Productos\Models\ProductoTerminado;
use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Http\Requests\Externo\SolicitudRequest;
use App\Domain\PlantaLacteos\Http\Requests\Externo\CambiarEstadoSolicitudRequest;
use App\Domain\PlantaLacteos\Http\Requests\Externo\CambiarEstadoDetalleRequest;
use App\Domain\PlantaLacteos\Models\ExtSolicitudAnalisis;
use App\Domain\PlantaLacteos\Models\ExtDetalleSolicitudAnalisis;
use App\Domain\PlantaLacteos\Models\ExtTipoMuestra;
use App\Domain\PlantaLacteos\Services\Externo\SolicitudService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SolicitudController extends Controller
{
    protected $solicitudService;

    public function __construct(SolicitudService $solicitudService)
    {
        $this->solicitudService = $solicitudService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        // Si el usuario tiene rol de laboratorista, ver todas de su ubicación; si es solicitante, solo las suyas.
        $filters = $request->only(['estado', 'codigo', 'per_page']);
        $filters['ubicacion_id'] = $user->ubicacion_id; // Limitado a planta
        // Si no es personal de laboratorio, filtrar por user_id
        if ($user->hasRole('admin')) {
            $filters['ubicacion_id'] = null; // Ver todas las ubicaciones
        }
        $solicitudes = $this->solicitudService->listarSolicitudes($filters);

        return Inertia::render('planta_lacteos/externo/solicitudes/index', [
            'solicitudes' => $solicitudes,
            'filters' => $filters,
            'flash' => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        $productos = \App\Domain\ModulosComunes\Productos\Models\ProductoTerminado::where('ubicacion_id', $user->ubicacion_id)->get();
        $tiposMuestra = ExtTipoMuestra::where('ubicacion_id', $user->ubicacion_id)->get();

        return Inertia::render('planta_lacteos/externo/solicitudes/crear', [
            'productos' => $productos,
            'tiposMuestra' => $tiposMuestra,
        ]);
    }

    public function store(SolicitudRequest $request)
    {
         
        $user = auth()->user();
        
        $this->solicitudService->crearSolicitud($request->validated(), $user);
        return redirect()->route('externo.solicitudes.index')->with('success', 'Solicitud creada correctamente.');
    }

    // Cambiar estado de la solicitud (Aceptar, Rechazar, Observar)
    public function cambiarEstadoSolicitud(CambiarEstadoSolicitudRequest $request, ExtSolicitudAnalisis $solicitud)
    {
        $this->solicitudService->cambiarEstadoSolicitud($solicitud, $request->estado, $request->observaciones);
        return redirect()->route('externo.solicitudes.index')->with('success', 'Estado actualizado.');
    }

    // Cambiar estado de un detalle individual
    public function cambiarEstadoDetalle(CambiarEstadoDetalleRequest $request, ExtDetalleSolicitudAnalisis $detalle)
    {
        $this->solicitudService->cambiarEstadoDetalle($detalle, $request->estado, $request->observaciones);
        return back()->with('success', 'Estado del detalle actualizado.');
    }

    // Mostrar detalles de una solicitud (puede usarse para ver los análisis)
    public function show(ExtSolicitudAnalisis $solicitud)
    {
        $solicitud->load([
            'detalles.microbiologias', // si existe relación
            'detalles.actividadAgua',
            'detalles.aguaFisico'
        ]);
        return Inertia::render('externo/solicitudes/show', [
            'solicitud' => $solicitud,
        ]);
    }
}
