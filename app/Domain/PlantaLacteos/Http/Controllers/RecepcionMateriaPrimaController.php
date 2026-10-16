<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\PlantaLacteos\Http\Requests\RecepcionLecheRequest;
use App\Domain\PlantaLacteos\Http\Requests\RecepcionMateriaPrimaRequest;
use App\Domain\PlantaLacteos\Models\AlmacenMateriaPrima;
use App\Domain\PlantaLacteos\Models\CategoriaMateriaPrima;
use App\Domain\PlantaLacteos\Models\ItemMateriaPrima;
use App\Domain\PlantaLacteos\Models\ProveedorMateriaPrima;
use App\Domain\PlantaLacteos\Models\RecepcionEstadoHistorial;
use App\Domain\PlantaLacteos\Models\RecepcionMateriaPrima;
use App\Domain\PlantaLacteos\Services\RecepcionMateriaPrimaService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RecepcionMateriaPrimaController extends Controller
{
    protected RecepcionMateriaPrimaService $recepcionMateriaPrimaService;

    public function __construct(RecepcionMateriaPrimaService $recepcionMateriaPrimaService)
    {
        $this->recepcionMateriaPrimaService = $recepcionMateriaPrimaService;
    }

    private function isAdmin()
    {
        return auth()->user()->hasRole('admin');
    }

    private function getUbicacionId()
    {
        return auth()->user()->ubicacion_id;
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $this->isAdmin();
        $ubicacionId = $this->getUbicacionId();

        $filters = $request->only([
            'search',
            'user_id',
            'item_materia_prima_id',
            'proveedor_materia_prima_id',
            'almacen_materia_prima_id',
            'tiempo',
            'almacenero_id',
            'estado_id',
            'liberacion_id',
            'certificado',
        ]);

        $recepcionesQuery = RecepcionMateriaPrima::with([
            'user',
            'itemMateriaPrima.unidad',
            'proveedorMateriaPrima',
            'almacenero',
            'estado',
            'liberacion',
            'recepcionLotes',
            'almacen',
            'estadoAnalisis',
            'estadoRevision',
            'revisor',
            'certificadoPdf',
        ]);

        // Filtrar por ubicación si no es admin
        if (!$isAdmin && $ubicacionId) {
            $recepcionesQuery->where('ubicacion_id', $ubicacionId);
        }

        $recepciones = $recepcionesQuery
            ->filter($filters)
            ->orderBy($request->get('sort', 'tiempo'), 'desc')
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Obtener datos para los filtros usando whereHas para relacionarlos con la ubicación
        $users = User::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
            return $query->where('ubicacion_id', $ubicacionId);
        })->get();

        $itemMateriaPrimas = ItemMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
            return $query->where('ubicacion_id', $ubicacionId);
        })->get();

        $proveedorMateriaPrimas = ProveedorMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
            return $query->where('ubicacion_id', $ubicacionId);
        })->get();

        $almaceneros = User::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
            return $query->where('ubicacion_id', $ubicacionId);
        })->get();

        // Para almacenes, simplemente usar where
        $almacenesMateriaPrima = AlmacenMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
            return $query->where('ubicacion_id', $ubicacionId);
        })->get();

        return Inertia::render('planta_lacteos/materiaPrima/recepciones/index', [
            'recepciones' => $recepciones,
            'users' => $users,
            'itemMateriaPrimas' => $itemMateriaPrimas,
            'proveedorMateriaPrimas' => $proveedorMateriaPrimas,
            'estados' => Estado::whereIn('nombre', [
                'Pendiente',
                'Aceptado',
                'Rechazado',
            ])->get(),
            'liberaciones' => Estado::whereIn('nombre', [
                'Pendiente',
                'Liberado',
                'No liberado',
                'Observado',
            ])->get(),
            'almaceneros' => $almaceneros,
            'almacenesMateriaPrima' => $almacenesMateriaPrima,
            'isAdmin' => $isAdmin,
            'filters' => $filters,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }


    public function index2(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $this->isAdmin();
        $ubicacionId = $this->getUbicacionId();

        $filters = $request->only([
            'search',
            'user_id',
            'item_materia_prima_id',
            'proveedor_materia_prima_id',
            'tiempo',
            'almacenero_id',
            'estado_id',
            'liberacion_id',
            'certificado',
            'lote',
            'fecha_vencimiento',
        ]);

        $recepcionesQuery = RecepcionMateriaPrima::with([
            'user',
            'itemMateriaPrima.unidad',
            'proveedorMateriaPrima',
            'almacenero',
            'estado',
            'liberacion',
            'recepcionLotes',
            'almacen',
            'estadoAnalisis',
            'estadoRevision',
            'revisor',
            'certificadoPdf',
        ]);

        // Filtrar por ubicación si no es admin
        if (!$isAdmin && $ubicacionId) {
            $recepcionesQuery->where('ubicacion_id', $ubicacionId);
        }

        $recepciones = $recepcionesQuery
            ->filter($filters)
            ->orderBy($request->get('sort', 'tiempo'), 'desc')
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Obtener datos para los filtros usando whereHas para relacionarlos con la ubicación
        $users = User::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
            return $query->where('ubicacion_id', $ubicacionId);
        })->get();

        $itemMateriaPrimas = ItemMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
            return $query->where('ubicacion_id', $ubicacionId);
        })->get();

        $proveedorMateriaPrimas = ProveedorMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
            return $query->where('ubicacion_id', $ubicacionId);
        })->get();

        $almaceneros = User::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
            return $query->where('ubicacion_id', $ubicacionId);
        })->get();

        // Para almacenes, simplemente usar where
        $almacenesMateriaPrima = AlmacenMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
            return $query->where('ubicacion_id', $ubicacionId);
        })->get();

        $estadosAnalisis = Estado::whereIn('nombre', [
        'Pendiente',
        'Analizado',
        'En proceso',
        'Rechazado',
        'No Aplica',
    ])->get();

        return Inertia::render('planta_lacteos/materiaPrima/recepciones/index2', [
            'recepciones' => $recepciones,
            'users' => $users,
            'itemMateriaPrimas' => $itemMateriaPrimas,
            'proveedorMateriaPrimas' => $proveedorMateriaPrimas,
            'estados' => Estado::whereIn('nombre', [
                'Pendiente',
                'Aceptado',
                'Rechazado',
            ])->get(),
            'liberaciones' => Estado::whereIn('nombre', [
                'Pendiente',
                'Liberado',
                'No liberado',
                'Observado',
            ])->get(),
            'estadosAnalisis' => $estadosAnalisis,
            'almaceneros' => $almaceneros,
            'almacenesMateriaPrima' => $almacenesMateriaPrima,
            'isAdmin' => $isAdmin,
            'filters' => $filters,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }


    public function create()
    {
        $isAdmin = $this->isAdmin();
        $ubicacionId = $this->getUbicacionId();

        return Inertia::render('planta_lacteos/materiaPrima/recepciones/crear', [
            'almaceneros' => User::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('ubicacion_id', $ubicacionId);
            })->whereHas('roles', function ($query) {
                $query->where('name', 'almacenMateriaPrima');
            })->get(),

            'proveedorMateriaPrimas' => ProveedorMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('ubicacion_id', $ubicacionId);
            })->get(),

            'itemMateriaPrimas' => ItemMateriaPrima::with('unidad')
                ->when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                    return $query->where('ubicacion_id', $ubicacionId);
                })->get(),

            'categoriaMateriaPrimas' => CategoriaMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('ubicacion_id', $ubicacionId);
            })->get(),
            'almacenesMateriaPrima' => AlmacenMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('ubicacion_id', $ubicacionId);
            })->get(),

            'isAdmin' => $isAdmin,
        ]);
    }

    public function store(RecepcionMateriaPrimaRequest $request)
    {
        try {
            $data = $request->all();

            // Si no es admin, asignar automáticamente la ubicación del usuario
            if (!$this->isAdmin()) {
                $data['ubicacion_id'] = $this->getUbicacionId();
            }
            $this->recepcionMateriaPrimaService->store($data);

            return redirect()
                ->route('recepciones-materia-prima.index')
                ->with('success', 'Recepción registrada correctamente.');
        } catch (\Exception $e) {

            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function edit(RecepcionMateriaPrima $recepcion)
    {
        $isAdmin = $this->isAdmin();
        $ubicacionId = $this->getUbicacionId();

        // $abel =$recepcion->load(['recepcionLotes', 'itemMateriaPrima.unidad', 'almacen']);
        // dd($abel);
        // Verificar que el usuario tenga permiso para ver esta recepción
        if (!$isAdmin && $recepcion->ubicacion_id !== $ubicacionId) {
            abort(403, 'No tienes permiso para acceder a esta recepción.');
        }

        return Inertia::render('planta_lacteos/materiaPrima/recepciones/editar', [
            'recepcion' => $recepcion->load(['recepcionLotes', 'itemMateriaPrima.unidad', 'almacen', 'estadoAnalisis', 'certificadoPdf']),
            'almaceneros' => User::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('ubicacion_id', $ubicacionId);
            })->get(),

            'proveedorMateriaPrimas' => ProveedorMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('ubicacion_id', $ubicacionId);
            })->get(),

            'itemMateriaPrimas' => ItemMateriaPrima::with('unidad')
                ->when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                    return $query->where('ubicacion_id', $ubicacionId);
                })->get(),

            'categoriaMateriaPrimas' => CategoriaMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('ubicacion_id', $ubicacionId);
            })->get(),

            'almacenesMateriaPrima' => AlmacenMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('ubicacion_id', $ubicacionId);
            })->get(),

            'isAdmin' => $isAdmin,
        ]);
    }

    public function update(RecepcionMateriaPrimaRequest $request, RecepcionMateriaPrima $recepcion)
    {
        // Verificar permisos si no es admin
        if (!$this->isAdmin() && $recepcion->ubicacion_id !== $this->getUbicacionId()) {
            abort(403, 'No tienes permiso para actualizar esta recepción.');
        }

        try {
            $this->recepcionMateriaPrimaService->update($recepcion, $request->all());

            return redirect()
                ->route('recepciones-materia-prima.index')
                ->with('success', 'Recepción actualizada correctamente.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(RecepcionMateriaPrima $recepcion_materia_prima)
    {
        // Verificar permisos si no es admin
        if (!$this->isAdmin() && $recepcion_materia_prima->ubicacion_id !== $this->getUbicacionId()) {
            abort(403, 'No tienes permiso para eliminar esta recepción.');
        }

        if ($recepcion_materia_prima->certificadoPdf) {
            Storage::disk('public')->delete($recepcion_materia_prima->certificadoPdf->ruta);
        }

        $recepcion_materia_prima->delete();
    }

    public function certificado(RecepcionMateriaPrima $recepcion)
    {
        if (!$this->isAdmin() && $recepcion->ubicacion_id !== $this->getUbicacionId()) {
            abort(403, 'No tienes permiso para ver este certificado.');
        }

        $certificado = $recepcion->certificadoPdf;
        if (!$certificado || !Storage::disk('public')->exists($certificado->ruta)) {
            abort(404, 'Certificado no encontrado.');
        }

        return response()->file(Storage::disk('public')->path($certificado->ruta), [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . addslashes($certificado->nombre_original) . '"',
        ]);
    }

    public function updateEstado(Request $request, $id)
    {
        $recepcion = RecepcionMateriaPrima::findOrFail($id);

        // Verificar permisos si no es admin
        if (!$this->isAdmin() && $recepcion->ubicacion_id !== $this->getUbicacionId()) {
            abort(403, 'No tienes permiso para actualizar el estado de esta recepción.');
        }

        $request->validate([
            'estado_id' => 'nullable|integer|exists:estados,id',
            'liberacion_id' => 'nullable|integer|exists:estados,id',
            'estado_analisis_id' => 'nullable|integer|exists:estados,id',
            'estado_revision_id' => 'nullable|integer|exists:estados,id',
            'revisor_id' => 'nullable|integer|exists:users,id',
            'observacion' => 'nullable|string|max:2000',
        ]);

        $recepcion->estado_id = $request->estado_id;
        $recepcion->liberacion_id = $request->liberacion_id;

        // Estado de análisis (si viene)
        $recepcion->estado_analisis_id = $request->estado_analisis_id;

        // Estado de revisión y revisor (opcionales)
        if ($request->has('estado_revision_id')) {
            $recepcion->estado_revision_id = $request->estado_revision_id;
        }
        if ($request->has('revisor_id')) {
            $recepcion->revisor_id = $request->revisor_id;
        }

        $recepcion->observacion = $request->observacion;
        $recepcion->save();

        RecepcionEstadoHistorial::create([
            'recepcion_materia_prima_id' => $recepcion->id,
            'user_id' => auth()->id(),
            'estado_id' => $request->estado_id,
            'liberacion_id' => $request->liberacion_id,
            'observacion' => $request->observacion,
        ]);

        return back()->with('success', 'Estado actualizado correctamente.');
    }

    public function marcarRevisado($id)
    {
        $recepcion = RecepcionMateriaPrima::findOrFail($id);

        // Verificar permisos si no es admin
        if (!$this->isAdmin() && $recepcion->ubicacion_id !== $this->getUbicacionId()) {
            abort(403, 'No tienes permiso para actualizar el estado de esta recepción.');
        }

        $estadoRevisado = Estado::firstOrCreate(
            ['nombre' => 'Revisado'],
            ['descripcion' => 'Recepción revisada', 'color' => '#60A5FA']
        );

        $recepcion->estado_revision_id = $estadoRevisado->id;
        $recepcion->revisor_id = auth()->id();
        $recepcion->save();

        return back()->with('success', 'Recepción marcada como revisada.');
    }

    public function pdf(Request $request)
    {
        $isAdmin = $this->isAdmin();
        $ubicacionId = $this->getUbicacionId();

        $query = RecepcionMateriaPrima::with([
            'user',
            'itemMateriaPrima.unidad',
            'proveedorMateriaPrima',
            'almacenero',
            'almacen',
            'estado',
            'liberacion',
            'recepcionLotes',  // <- ya incluye todos los campos nuevos
            'estadoAnalisis',
            'estadoRevision',
            'revisor',
        ]);

        if (!$isAdmin && $ubicacionId) {
            $query->where('ubicacion_id', $ubicacionId);
        }

        $filters = $request->only([
            'search',
            'user_id',
            'item_materia_prima_id',
            'proveedor_materia_prima_id',
            'almacen_materia_prima_id',
            'tiempo',
            'almacenero_id',
            'estado_id',
            'liberacion_id',
            'certificado',
            'registro_senasag',
        ]);

        $query->filter($filters);

        if ($request->has('fecha_desde') && $request->has('fecha_hasta')) {
            $fechaDesde = Carbon::parse($request->fecha_desde)->startOfDay();
            $fechaHasta = Carbon::parse($request->fecha_hasta)->endOfDay();
            $query->whereBetween('tiempo', [$fechaDesde, $fechaHasta]);
        }

        $recepciones = $query->get();

        return response()->json(['recepciones' => $recepciones]);
    }


      public function create1()
    {
        $isAdmin = $this->isAdmin();
        $ubicacionId = $this->getUbicacionId();

        return Inertia::render('planta_lacteos/materiaPrima/recepciones/crear1', [
            'almaceneros' => User::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('ubicacion_id', $ubicacionId);
            })->whereHas('roles', function ($query) {
                $query->where('name', 'almacenMateriaPrima');
            })->get(),

            'proveedorMateriaPrimas' => ProveedorMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('ubicacion_id', $ubicacionId);
            })->get(),

            'itemMateriaPrimas' => ItemMateriaPrima::with('unidad')
                ->when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                    return $query->where('ubicacion_id', $ubicacionId);
                })->get(),

            'categoriaMateriaPrimas' => CategoriaMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('ubicacion_id', $ubicacionId);
            })->get(),
            'almacenesMateriaPrima' => AlmacenMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('ubicacion_id', $ubicacionId);
            })->get(),

            'isAdmin' => $isAdmin,
        ]);
    }

    public function store1(RecepcionMateriaPrimaRequest $request)
    {
        try {
            $data = $request->all();
            $data['certificado_pdf'] = $request->file('certificado_pdf');

            // Si no es admin, asignar automáticamente la ubicación del usuario
            if (!$this->isAdmin()) {

                $data['ubicacion_id'] = $this->getUbicacionId();
            }

            $this->recepcionMateriaPrimaService->store1($data);

            return redirect()
                ->route('recepciones-materia-prima.index2')
                ->with('success', 'Recepción registrada correctamente.');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => $e->getMessage() . ' en ' . $e->getFile() . ':' . $e->getLine(),
            ])->withInput();
        }
    }

     public function edit1(RecepcionMateriaPrima $recepcion)
    {
        $isAdmin = $this->isAdmin();
        $ubicacionId = $this->getUbicacionId();

        // $abel =$recepcion->load(['recepcionLotes', 'itemMateriaPrima.unidad', 'almacen']);
        // dd($abel);
        // Verificar que el usuario tenga permiso para ver esta recepción
        if (!$isAdmin && $recepcion->ubicacion_id !== $ubicacionId) {
            abort(403, 'No tienes permiso para acceder a esta recepción.');
        }

        return Inertia::render('planta_lacteos/materiaPrima/recepciones/editar2', [
            'recepcion' => $recepcion->load(['recepcionLotes', 'itemMateriaPrima.unidad', 'almacen', 'estadoAnalisis', 'certificadoPdf']),
            'almaceneros' => User::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('ubicacion_id', $ubicacionId);
            })->get(),

            'proveedorMateriaPrimas' => ProveedorMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('ubicacion_id', $ubicacionId);
            })->get(),

            'itemMateriaPrimas' => ItemMateriaPrima::with('unidad')
                ->when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                    return $query->where('ubicacion_id', $ubicacionId);
                })->get(),

            'categoriaMateriaPrimas' => CategoriaMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('ubicacion_id', $ubicacionId);
            })->get(),

            'almacenesMateriaPrima' => AlmacenMateriaPrima::when(!$isAdmin && $ubicacionId, function ($query) use ($ubicacionId) {
                return $query->where('ubicacion_id', $ubicacionId);
            })->get(),

            'isAdmin' => $isAdmin,
        ]);
    }

    public function update1(RecepcionMateriaPrimaRequest $request, RecepcionMateriaPrima $recepcion)
    {
        // Verificar permisos si no es admin
        if (!$this->isAdmin() && $recepcion->ubicacion_id !== $this->getUbicacionId()) {
            abort(403, 'No tienes permiso para actualizar esta recepción.');
        }

        try {
            $data = $request->all();
            $data['certificado_pdf'] = $request->file('certificado_pdf');
            $this->recepcionMateriaPrimaService->update1($recepcion, $data);

            return redirect()
                ->route('recepciones-materia-prima.index2')
                ->with('success', 'Recepción actualizada correctamente.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
