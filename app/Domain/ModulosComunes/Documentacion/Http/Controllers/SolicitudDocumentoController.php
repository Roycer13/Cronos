<?php

namespace App\Domain\ModulosComunes\Documentacion\Http\Controllers;

use App\Domain\ModulosComunes\Documentacion\Http\Requests\SolicitudDocumentoRequest;
use App\Http\Controllers\Controller;
use App\Domain\ModulosComunes\Documentacion\Http\Requests\StoreSolicitudRequest;
use App\Domain\ModulosComunes\Documentacion\Models\SolicitudDocumento;
use App\Domain\ModulosComunes\Documentacion\Services\SolicitudDocumentoService;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SolicitudDocumentoController extends Controller
{
    protected SolicitudDocumentoService $service;

    public function __construct(SolicitudDocumentoService $service)
    {
        $this->service = $service;
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

    public function index(Request $request)
    {
        $user = Auth::user();
        $isAdmin = $this->isAdmin();
        $ubicacionId = $this->getUbicacionId();

        // Obtener los filtros del request
        $filters = $request->only(['ubicacion_id', 'tipo', 'area_id', 'estado_id', 'codigo', 'titulo', 'per_page']);

        // Si el usuario NO es admin, forzar el filtro por su ubicación
        if (!$isAdmin) {
            // Filtramos por la ubicación del documento relacionado
            $filters['documento_ubicacion_id'] = $ubicacionId;
        }

        $solicitudes = $this->service->getSolicitudDocumentosFiltrados($filters);

        // Filtrar usuarios también si no es admin
        $usuarios = $isAdmin
            ? User::all()
            : User::where('ubicacion_id', $ubicacionId)->get();

        return Inertia::render('comunes/documentacion/solicitudes/index', [
            'solicitudes' => $solicitudes,
            'filters' => $filters,
            'usuarios' => $usuarios,
            'user_role' => $isAdmin ? 'admin' : 'user',
            'user_ubicacion_id' => $ubicacionId,
        ]);
    }
    public function create()
    {
        $datosFormulario = $this->service->getDatosParaCrearSolicitud();

        return Inertia::render('comunes/documentacion/solicitudes/crear', $datosFormulario);
    }

    public function store(SolicitudDocumentoRequest $request)
    {

        try {
            $documento = $this->service->create($request->all());

            return redirect()
                ->route('solicitudDocumentacion.index')
                ->with('success', 'Documento creado exitosamente');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['error' => 'Error al crear el documento: ' . $e->getMessage()]);
        }
    }

    public function assign(SolicitudDocumento $solicitud, Request $request)
    {
        $solicitud->update($request->only([
            'limite_fecha_elaboracion',
            'limite_fecha_revision_tecnica',
            'limite_fecha_revision_calidad',
            'limite_fecha_revision_aprobacion'
        ]));
        return back()->with('success', 'Solicitud actualizada');
    }

    public function approve(SolicitudDocumento $solicitudDocumentacion, Request $request)
    {
        try {
            $data = $request->validate([
                'creador_asignado' => 'required|exists:users,id',
                'revisor1_asignado' => 'nullable|exists:users,id',
                'revisor2_asignado' => 'nullable|exists:users,id',
                'aprobador_asignado' => 'required|exists:users,id',
                'documento_padre_id' => 'nullable|exists:documentos,id',
                'custodio' => 'nullable|string|max:255',
                'tipo_distribucion' => 'nullable|string|max:50',
                'ubicacion_fisica' => 'nullable|string|max:255',
                // Agregar validación para las fechas límite
                'limite_fecha_elaboracion' => 'nullable|date',
                'limite_fecha_revision_tecnica' => 'nullable|date',
                'limite_fecha_revision_calidad' => 'nullable|date',
                'limite_fecha_revision_aprobacion' => 'nullable|date',
            ]);

            $this->service->approve($solicitudDocumentacion, $data);

            return redirect()
                ->route('solicitudDocumentacion.index')
                ->with('success', 'Solicitud aprobada exitosamente');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Error al aprobar la solicitud: ' . $e->getMessage()]);
        }
    }

    public function reject(SolicitudDocumento $solicitudDocumentacion, Request $request)
    {
        try {
            $request->validate([
                'razon' => 'required|string|max:1000',
            ]);

            $this->service->reject($solicitudDocumentacion, $request->input('razon'));

            return redirect()
                ->route('solicitudDocumentacion.index')
                ->with('success', 'Solicitud rechazada exitosamente');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Error al rechazar la solicitud: ' . $e->getMessage()]);
        }
    }
}
