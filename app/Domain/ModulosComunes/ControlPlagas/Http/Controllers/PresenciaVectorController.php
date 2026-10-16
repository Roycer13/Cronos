<?php

namespace App\Domain\ModulosComunes\ControlPlagas\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Domain\ModulosComunes\ControlPlagas\Models\{
    BarreraPlaga,
    ControlBarrera,
    PresenciaVector,
    Trampa,
    ControlTrampa,
    ArranqueFumigacion,
    Insectocaptor,
    RegistroInsecto
};
use App\Domain\ModulosComunes\ControlPlagas\Services\{
    BarreraPlagaService,
    ControlBarreraService,
    PresenciaVectorService,
    TrampaService,
    ControlTrampaService,
    ArranqueFumigacionService,
    InsectocaptorService,
    RegistroInsectoService
};
use App\Domain\ModulosComunes\ControlPlagas\Http\Requests\{
    BarreraPlagaRequest,
    ControlBarreraRequest,
    PresenciaVectorRequest,
    TrampaRequest,
    ControlTrampaRequest,
    ArranqueFumigacionRequest,
    InsectocaptorRequest,
    RegistroInsectoRequest
};
use App\Domain\Sistema\Configuracion\Models\Sector;


class PresenciaVectorController extends Controller
{
    public function __construct(protected PresenciaVectorService $service) {}

    public function index(Request $request)
    {
        $query = PresenciaVector::with(['sector', 'inspector'])->orderBy('fecha', 'desc');

        if ($request->filled('filtro_sector'))  $query->porSector($request->filtro_sector);
        if ($request->filled('filtro_vector'))  $query->porVector($request->filtro_vector);
        if ($request->filled('filtro_fecha')) {
            $query->porFecha($request->filtro_fecha, $request->filtro_fecha);
        } elseif ($request->filled('filtro_fecha_desde') || $request->filled('filtro_fecha_hasta')) {
            $query->porFecha($request->filtro_fecha_desde, $request->filtro_fecha_hasta);
        }
        if ($request->has('filtro_estado') && $request->filtro_estado !== '') {
            $query->where('estado', $request->filtro_estado);
        }

        return Inertia::render('comunes/plagas/presenciaVectores/index', [
            'registros' => $query->paginate($request->get('per_page', 10)),
            'sectores' => Sector::select('id', 'nombre')->get(),
            'vectores'  => PresenciaVector::VECTORES,
            'filters'   => $request->only(['filtro_sector', 'filtro_vector', 'filtro_fecha', 'filtro_fecha_desde', 'filtro_fecha_hasta', 'filtro_estado', 'per_page']),
            'flash'     => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function pdf(Request $request)
    {
        $query = PresenciaVector::with(['sector', 'inspector'])->orderBy('fecha', 'desc');

        if ($request->filled('filtro_sector'))  $query->porSector($request->filtro_sector);
        if ($request->filled('filtro_vector'))  $query->porVector($request->filtro_vector);
        if ($request->filled('filtro_fecha')) {
            $query->porFecha($request->filtro_fecha, $request->filtro_fecha);
        } elseif ($request->filled('filtro_fecha_desde') || $request->filled('filtro_fecha_hasta')) {
            $query->porFecha($request->filtro_fecha_desde, $request->filtro_fecha_hasta);
        }
        if ($request->has('filtro_estado') && $request->filtro_estado !== '') {
            $query->where('estado', $request->filtro_estado);
        }

        $datos = $query->get();
        $resumen = [
            'atendidos' => $datos->where('estado', true)->count(),
            'pendientes' => $datos->where('estado', false)->count(),
            'vectores' => $datos->groupBy('vector')->map->count()->toArray(),
        ];

        return response()->json([
            'datos' => $datos,
            'resumen' => $resumen,
            'filtros' => $request->only(['filtro_sector', 'filtro_vector', 'filtro_fecha', 'filtro_fecha_desde', 'filtro_fecha_hasta', 'filtro_estado']),
        ]);
    }

    public function store(PresenciaVectorRequest $request)
    {
        $this->service->crear($request->validated(), auth()->user());
        return redirect()->route('plagas.presencia-vectores.index')->with('success', 'Presencia de vector registrada.');
    }

   public function update(PresenciaVectorRequest $request, $id = null)
{
    // Obtener el ID desde la ruta (nombre real: 'presencia_vector')
    $id = $id ?? $request->route('presencia_vector');
    
    // Buscar el modelo manualmente (esto lanza 404 si no existe)
    $presenciaVector = PresenciaVector::findOrFail($id);
    
    // Depuración (opcional, para verificar que ahora sí tiene ID)
    // dd($request->validated(), $presenciaVector->toArray());
    
    try {
        $this->service->actualizar($presenciaVector, $request->validated());
        return redirect()->route('plagas.presencia-vectores.index')
            ->with('success', 'Registro actualizado.');
    } catch (\Exception $e) {
        return redirect()->route('plagas.presencia-vectores.index')
            ->with('error', 'Error al actualizar: ' . $e->getMessage());
    }
}
    public function destroy(PresenciaVector $presenciaVector)
    {
        $presenciaVector->delete();
        return redirect()->route('plagas.presencia-vectores.index')->with('success', 'Registro eliminado.');
    }
}
