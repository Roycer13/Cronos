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
use Illuminate\Support\Facades\DB;

class ControlBarreraController extends Controller
{
    public function __construct(protected ControlBarreraService $service) {}

    public function index(Request $request)
    {
        $query = ControlBarrera::with(['barrera.sector', 'inspector'])->orderBy('fecha', 'desc');

        if ($request->filled('filtro_barrera'))     $query->porBarrera($request->filtro_barrera);
        if ($request->filled('filtro_fecha_desde') || $request->filled('filtro_fecha_hasta')) {
            $query->porFecha($request->filtro_fecha_desde, $request->filtro_fecha_hasta);
        }
        if ($request->has('filtro_estado') && $request->filtro_estado !== '') {
            $query->where('estado', $request->filtro_estado);
        }

        return Inertia::render('comunes/plagas/controlBarreras/index', [
            'registros' => $query->paginate($request->get('per_page', 10)),
            'barreras'  => BarreraPlaga::activos()->with('sector')->get(),
            'sectores' => Sector::select('id', 'nombre')->get(),
            'filters'   => $request->only(['filtro_barrera', 'filtro_fecha_desde', 'filtro_fecha_hasta', 'filtro_estado', 'per_page']),
            'flash'     => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function store(ControlBarreraRequest $request)
    {
        $this->service->crear($request->validated(), auth()->user());
        return redirect()->route('plagas.control-barreras.index')->with('success', 'Control registrado correctamente.');
    }

    public function update(ControlBarreraRequest $request, ControlBarrera $controlBarrera)
    {
        $this->service->actualizar($controlBarrera, $request->validated());
        return redirect()->route('plagas.control-barreras.index')->with('success', 'Control actualizado correctamente.');
    }

    public function destroy(ControlBarrera $controlBarrera)
    {
        $controlBarrera->delete();
        return redirect()->route('plagas.control-barreras.index')->with('success', 'Registro eliminado.');
    }
    public function registroRapido()
    {
        $user = auth()->user();
        $ubicacionId = $user->ubicacion_id;
        // Assuming BarreraPlaga has ubicacion_id or sector belongs to ubicacion
        $barreras = BarreraPlaga::with('sector')
            ->whereHas('sector', fn($q) => $q->where('ubicacion_id', $ubicacionId))
            ->activos()
            ->get();
        $sectores = Sector::where('ubicacion_id', $ubicacionId)->get(['id', 'nombre']);
        return Inertia::render('comunes/plagas/controlBarreras/registro-rapido', [
            'barreras' => $barreras,
            'sectores' => $sectores,
            'flash' => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function storeRapido(Request $request)
    {
        
        $data = $request->validate([
            'controles' => 'required|array',
            'controles.*.barrera_plaga_id' => 'required|exists:PLAG_barrera_plagas,id',
            'controles.*.estado' => 'required|boolean',
            'controles.*.observacion' => 'nullable|string|max:500',
            'controles.*.correcion' => 'nullable|string|max:500',
        ]);

        $inspector = auth()->user();
        $now = now();

        DB::transaction(function () use ($data, $inspector, $now) {
            foreach ($data['controles'] as $control) {
                ControlBarrera::create([
                    'barrera_plaga_id' => $control['barrera_plaga_id'],
                    'user_id' => $inspector->id,
                    'fecha' => $now,
                    'estado' => $control['estado'],
                    'observacion' => $control['observacion'] ?? null,
                    'correcion' => $control['correcion'] ?? null,
                ]);
            }
        });

        return redirect()->route('plagas.control-barreras.index')
            ->with('success', 'Controles registrados exitosamente.');
    }
}
