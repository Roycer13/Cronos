<?php
namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Http\Requests\InfraestructuraRequest;
use App\Domain\PlantaLacteos\Models\Infraestructura;
use App\Domain\PlantaLacteos\Services\InfraestructuraService;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InfraestructuraController extends Controller
{
    protected $service;

    public function __construct(InfraestructuraService $service) {
        $this->service = $service;
    }

    public function index(Request $request) {
        /** @var User|null $user */
        $user = Auth::user();
        $filters = $request->only(['nombre', 'activo', 'per_page']);
        $query = Infraestructura::filter($filters);
        // Filtrar por ubicación del usuario si no es admin global ni tiene el permiso global
            $query->where('ubicacion_id', $user->ubicacion_id);
        
        $infraestructuras = $query->orderBy('nombre')->paginate($request->get('per_page', 10))->withQueryString();
        $ubicaciones = Ubicacion::select('id', 'nombre')->orderBy('nombre')->get();

        return Inertia::render('planta_lacteos/infraestructuras/index', [
            'infraestructuras' => $infraestructuras,
            'filters' => $filters,
            'ubicaciones' => $ubicaciones,
            'flash' => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function store(InfraestructuraRequest $request) {
        $validated = $request->validated();
        $this->service->create($validated);
        return redirect()->route('infraestructuras.index')->with('success','Área creada.');
    }

    public function update(InfraestructuraRequest $request, Infraestructura $infraestructura) {
        $validated = $request->validated();
        $this->service->update($infraestructura, $validated);
        return redirect()->route('infraestructuras.index')->with('success','Área actualizada.');
    }

    public function destroy(Infraestructura $infraestructura) {
        $this->service->delete($infraestructura);
        return redirect()->route('infraestructuras.index')->with('success','Área eliminada.');
    }
}