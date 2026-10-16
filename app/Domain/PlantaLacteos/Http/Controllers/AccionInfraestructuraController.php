<?php
namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\AccionInfraestructura;
use App\Domain\PlantaLacteos\Models\InspeccionInfraestructura;
use App\Domain\PlantaLacteos\Services\AccionInfraestructuraService;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AccionInfraestructuraController extends Controller
{
    protected $service;

    public function __construct(AccionInfraestructuraService $service) {
        $this->service = $service;
    }

    public function index(Request $request) {
        /** @var User|null $user */
        $user = Auth::user();
        $filters = $request->only(['inspeccion_infraestructura_id','estado','criterio','responsable','per_page']);

        $query = AccionInfraestructura::with(['inspeccion.infraestructura'])
            ->filter($filters)
            ->orderBy('created_at','desc');
            $query->where('ubicacion_id', $user->ubicacion_id);
        

        $acciones = $query->paginate($request->get('per_page', 10))->withQueryString();

        $estados = ['Pendiente','En Proceso','Cerrada'];
        $criterios = ['pisos','paredes','techos','puertas','ventanas','drenajes','iluminacion','ventilacion','lavamanos','servicios_sanitarios','almacenamiento','senalizacion'];

        return Inertia::render('planta_lacteos/acciones/index', [
            'acciones' => $acciones,
            'filters' => $filters,
            'estados' => $estados,
            'criterios' => $criterios,
            'flash' => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'inspeccion_infraestructura_id' => 'required|exists:inspeccion_infraestructuras,id',
            'criterio' => 'required|string',
            'descripcion' => 'required|string',
            'tipo_accion' => 'nullable|string',
            'responsable' => 'nullable|string',
            'fecha_ejecucion' => 'nullable|date',
            'estado' => 'required|string',
            'referencia' => 'nullable|string',
            'observaciones' => 'nullable|string',
        ]);

        // Heredar ubicacion_id de la inspección
        $inspeccion = InspeccionInfraestructura::findOrFail($validated['inspeccion_infraestructura_id']);
        $validated['ubicacion_id'] = $inspeccion->ubicacion_id;

        $this->service->create($validated);
        return back()->with('success','Acción creada.');
    }

    public function update(Request $request, AccionInfraestructura $accione) {
        $validated = $request->validate([
            'inspeccion_infraestructura_id' => 'required|exists:inspeccion_infraestructuras,id',
            'criterio' => 'required|string',
            'descripcion' => 'required|string',
            'tipo_accion' => 'nullable|string',
            'responsable' => 'nullable|string',
            'fecha_ejecucion' => 'nullable|date',
            'estado' => 'required|string',
            'referencia' => 'nullable|string',
            'observaciones' => 'nullable|string',
        ]);
        // Si cambia la inspección, actualizar ubicacion_id
        $inspeccion = InspeccionInfraestructura::findOrFail($validated['inspeccion_infraestructura_id']);
        $validated['ubicacion_id'] = $inspeccion->ubicacion_id;

        $this->service->update($accione, $validated);
        return back()->with('success','Acción actualizada.');
    }

    public function destroy(AccionInfraestructura $accione) {
        $this->service->delete($accione);
        return back()->with('success','Acción eliminada.');
    }
}