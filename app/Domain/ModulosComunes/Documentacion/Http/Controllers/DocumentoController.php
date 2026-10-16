<?php

namespace App\Domain\ModulosComunes\Documentacion\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Domain\ModulosComunes\Documentacion\Http\Requests\StoreDocumentoRequest;
use App\Domain\ModulosComunes\Documentacion\Http\Requests\UpdateDocumentoRequest;
use App\Domain\ModulosComunes\Documentacion\Models\Documento;
use App\Domain\ModulosComunes\Documentacion\Services\DocumentoService;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\Area;

use App\Domain\ModulosComunes\Documentacion\Services\VersionDocumentoService;
use App\Domain\ModulosComunes\Documentacion\Http\Requests\StoreVersionDocumentoRequest;
use App\Domain\ModulosComunes\Documentacion\Models\VersionDocumento;

class DocumentoController extends Controller
{
    public function __construct(
        protected DocumentoService $documentoService,
        protected VersionDocumentoService $versionService
    ) {}

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
        $user = auth()->user();
        $isAdmin = $this->isAdmin();
        $ubicacionId = $this->getUbicacionId();

        $filters = $request->only(['ubicacion_id', 'tipo', 'area_id', 'estado_id', 'search']);

        // Filtrar por ubicación si no es admin
        if (!$isAdmin && $ubicacionId) {
            $filters['ubicacion_id'] = $ubicacionId; // Forzar filtro por ubicación del usuario
        }

        $documentos = $this->documentoService->getDocumentosFiltrados($filters);

        // Obtener datos para los filtros con restricción por ubicación si no es admin
        $ubicaciones = Ubicacion::select('id', 'nombre')
            ->when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('id', $ubicacionId);
            })
            ->get();

        $areas = Area::select('id', 'nombre')
            ->when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('ubicacion_id', $ubicacionId);
            })
            ->get();

        $estados = Estado::select('id', 'nombre', 'color')->get();

        return Inertia::render('comunes/documentacion/index', [
            'documentos' => $documentos,
            'filters' => $filters,
            'ubicaciones' => $ubicaciones,
            'areas' => $areas,
            'estados' => $estados,
            'isAdmin' => $isAdmin, // Para usar en la vista si es necesario
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function navegar(Request $request, ?Documento $documento = null)
    {
        $user = auth()->user();
        $isAdmin = $this->isAdmin();
        $ubicacionId = $this->getUbicacionId();
        $filters = $request->only(['tipo', 'estado_id', 'search']);
        $queryFilters = $filters;

        if (!$isAdmin && $ubicacionId) {
            $queryFilters['ubicacion_id'] = $ubicacionId;
        }

        $documentos = $this->documentoService->getDocumentosParaNavegacion($queryFilters);
        $tipos = $this->documentoService->getTiposParaNavegacion($queryFilters);
        $tieneFiltros = !empty($filters['tipo']) || !empty($filters['estado_id']) || !empty($filters['search']);

        $selectedIndex = $documento
            ? $documentos->search(fn (Documento $item) => $item->id === $documento->id)
            : ($tieneFiltros && $documentos->isNotEmpty() ? 0 : false);

        $documentoSeleccionado = $selectedIndex === false ? null : $documentos->get($selectedIndex);

        return Inertia::render('comunes/documentacion/navegador', [
            'documentos' => $documentos->values(),
            'documentoSeleccionado' => $documentoSeleccionado,
            'indiceSeleccionado' => $selectedIndex,
            'filters' => $filters,
            'tipos' => $tipos,
            'estados' => Estado::select('id', 'nombre', 'color')->get(),
        ]);
    }

    public function create()
    {
        $datosFormulario = $this->documentoService->getDatosParaCrear();

        return Inertia::render('comunes/documentacion/crear', $datosFormulario);
    }

    public function store(StoreDocumentoRequest $request)
    {
        try {
            $documento = $this->documentoService->crearDocumento($request->validated());

            return redirect()
                ->route('documentos.index')
                ->with('success', 'Documento creado exitosamente');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['error' => 'Error al crear el documento: ' . $e->getMessage()]);
        }
    }

    public function edit(int $id)
    {
        $documento = $this->documentoService->getDocumentoConRelaciones($id);
        if (!$documento) {
            abort(404, 'Documento no encontrado');
        }

        $datosFormulario = $this->documentoService->getDatosParaCrear();

        return Inertia::render('comunes/documentacion/editar', [
            'documento' => $documento,
            ...$datosFormulario
        ]);
    }

    public function update(StoreDocumentoRequest $request, int $id)
    {
        try {
            $actualizado = $this->documentoService->actualizarDocumento($id, $request->validated());

            if (!$actualizado) {
                return redirect()
                    ->back()
                    ->withInput()
                    ->withErrors(['error' => 'Documento no encontrado']);
            }

            return redirect()
                ->route('documentos.index')
                ->with('success', 'Documento actualizado exitosamente');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['error' => 'Error al actualizar el documento: ' . $e->getMessage()]);
        }
    }

    public function destroy(int $id)
    {
        try {
            $eliminado = $this->documentoService->eliminarDocumento($id);

            if (!$eliminado) {
                return redirect()
                    ->back()
                    ->withErrors(['error' => 'Documento no encontrado']);
            }

            return redirect()
                ->route('documentos.index')
                ->with('success', 'Documento eliminado exitosamente');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Error al eliminar el documento: ' . $e->getMessage()]);
        }
    }

    public function show(int $id)
    {
        $documento = Documento::with([
            'area',
            'ubicacion',
            'estado',
            'versionVigente.estado',
            'versionVigente.creador',
            'versionVigente.revisor1',
            'versionVigente.revisor2',
            'versionVigente.aprobador',
            'ultimaVersionElaboracion',
            'versiones.estado',
            'versiones.creador',
            'versiones.revisor1',
            'versiones.revisor2',
            'versiones.aprobador',
            'creador',
            'revisor1',
            'revisor2',
            'aprobador',
            'custodio',
            'relaciones.relacionado.estado',
            'distribucion.area',
            'distribucion.responsable',
            'distribucion.accesoUsuario', // Cambiado de acceso_usuario a accesoUsuario
        ])->find($id);

        if (!$documento) {
            abort(404, 'Documento no encontrado');
        }

        // Asegurar que las relaciones estén presentes aunque sean vacías
        if (!$documento->versiones) {
            $documento->versiones = collect();
        }

        if (!$documento->relaciones) {
            $documento->relaciones = collect();
        }

        if (!$documento->distribucion) {
            $documento->distribucion = collect();
        }

        // Obtener usuarios para selectores
        $usuarios = User::select('id', 'name', 'email')->get();
        $estados = Estado::select('id', 'nombre', 'color')->get();

        // Obtener versiones paginadas
        $versiones = $documento->versiones()
            ->with(['estado', 'creador', 'revisor1', 'revisor2', 'aprobador'])
            ->orderBy('numero_version', 'desc')
            ->paginate(10);

        return Inertia::render('comunes/documentacion/show', [
            'documento' => $documento,
            'usuarios' => $usuarios,
            'estados' => $estados,
            'versiones' => $versiones,
        ]);
    }

    public function showVersion(Documento $documento, int $version)
    {
        $version = \App\Domain\ModulosComunes\Documentacion\Models\VersionDocumento::with([
            'estado',
            'creador',
            'revisor1',
            'revisor2',
            'aprobador'
        ])->find($version);

        if (!$version) {
            abort(404, 'Versión no encontrada');
        }

        $documento->load([
            'area',
            'ubicacion',
            'estado',
            'creador',
            'revisor1',
            'revisor2',
            'aprobador',
            'custodio'
        ]);

        $usuarios = User::select('id', 'name', 'email')->get();
        $estados = Estado::select('id', 'nombre', 'color')->get();

        return Inertia::render('comunes/documentacion/show', [
            'documento' => $documento,
            'usuarios' => $usuarios,
            'estados' => $estados,
            'versionSeleccionada' => $version,
            'versiones' => $documento->versiones()
                ->with(['estado', 'creador', 'revisor1', 'revisor2', 'aprobador'])
                ->orderBy('numero_version', 'desc')
                ->paginate(10),
        ]);
    }

    public function createVersion(int $id)
    {
        $documento = $this->documentoService->getDocumentoConRelaciones($id);

        if (!$documento) {
            abort(404, 'Documento no encontrado');
        }

        // Obtener última versión para sugerir cambios
        $ultimaVersion = $documento->versiones()->orderBy('numero_version', 'desc')->first();

        return Inertia::render('comunes/documentacion/version-create', [
            'documento' => $documento,
            'ultimaVersion' => $ultimaVersion,
            'usuarios' => User::select('id', 'name', 'email')->get(),
        ]);
    }

    /**
     * Guardar nueva versión
     */
    public function storeVersion(StoreVersionDocumentoRequest $request, int $id)
    {
        $documento = $this->documentoService->getDocumentoConRelaciones($id);

        if (!$documento) {
            abort(404, 'Documento no encontrado');
        }

        try {
            $datos = $request->validated();
            $archivos = $request->allFiles();

            $version = $this->versionService->crearVersion($documento, $datos, $archivos);

            return redirect()
                ->route('documentos.show', $id)
                ->with('success', 'Nueva versión creada exitosamente');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['error' => 'Error al crear la versión: ' . $e->getMessage()]);
        }
    }

    /**
     * Enviar versión a revisión
     */
    public function enviarRevision(Request $request, int $documentoId, int $versionId)
    {
        $version = VersionDocumento::findOrFail($versionId);

        $this->authorize('enviarRevision', $version);

        try {
            $this->versionService->enviarRevision($version, $request->all());

            return redirect()
                ->route('documentos.show', $documentoId)
                ->with('success', 'Versión enviada a revisión');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Error al enviar a revisión: ' . $e->getMessage()]);
        }
    }

    /**
     * Aprobar versión
     */
    public function aprobarVersion(Request $request, int $documentoId, int $versionId)
    {
        $version = VersionDocumento::findOrFail($versionId);

        $this->authorize('aprobar', $version);

        try {
            $this->versionService->aprobarVersion($version, $request->all());

            return redirect()
                ->route('documentos.show', $documentoId)
                ->with('success', 'Versión aprobada exitosamente');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Error al aprobar versión: ' . $e->getMessage()]);
        }
    }

    /**
     * Rechazar versión
     */
    public function rechazarVersion(Request $request, int $documentoId, int $versionId)
    {
        $version = VersionDocumento::findOrFail($versionId);

        $this->authorize('rechazar', $version);

        try {
            $this->versionService->rechazarVersion($version, $request->all());

            return redirect()
                ->route('documentos.show', $documentoId)
                ->with('success', 'Versión rechazada');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Error al rechazar versión: ' . $e->getMessage()]);
        }
    }

    /**
     * Publicar versión como vigente
     */
    public function publicarVersion(Request $request, int $documentoId, int $versionId)
    {
        $version = VersionDocumento::findOrFail($versionId);

        $this->authorize('publicar', $version);

        try {
            $this->versionService->publicarVersion($version);

            return redirect()
                ->route('documentos.show', $documentoId)
                ->with('success', 'Versión publicada como vigente');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Error al publicar versión: ' . $e->getMessage()]);
        }
    }
}
