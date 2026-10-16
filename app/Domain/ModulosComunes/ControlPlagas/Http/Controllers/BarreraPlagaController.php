<?php
namespace App\Domain\ModulosComunes\ControlPlagas\Http\Controllers;
 
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
 
use App\Domain\ModulosComunes\ControlPlagas\Models\{
    BarreraPlaga, ControlBarrera, PresenciaVector,
    Trampa, ControlTrampa, ArranqueFumigacion,
    Insectocaptor, RegistroInsecto
};
use App\Domain\ModulosComunes\ControlPlagas\Services\{
    BarreraPlagaService, ControlBarreraService, PresenciaVectorService,
    TrampaService, ControlTrampaService, ArranqueFumigacionService,
    InsectocaptorService, RegistroInsectoService
};
use App\Domain\ModulosComunes\ControlPlagas\Http\Requests\{
    BarreraPlagaRequest, ControlBarreraRequest, PresenciaVectorRequest,
    TrampaRequest, ControlTrampaRequest, ArranqueFumigacionRequest,
    InsectocaptorRequest, RegistroInsectoRequest
};
use App\Domain\Sistema\Configuracion\Models\Sector;

class BarreraPlagaController extends Controller
{
    public function __construct(protected BarreraPlagaService $service) {}
 
    public function index(Request $request)
    {
        $query = BarreraPlaga::with('sector')->orderBy('created_at', 'desc');
 
        if ($request->filled('filtro_sector')) {
            $query->porSector($request->filtro_sector);
        }
        if ($request->filled('filtro_tipo')) {
            $query->porTipo($request->filtro_tipo);
        }
        if ($request->has('filtro_estado') && $request->filtro_estado !== '') {
            $query->where('estado', $request->filtro_estado);
        }
 
        return Inertia::render('comunes/plagas/barreras/index', [
            'registros' => $query->paginate($request->get('per_page', 10)),
            'sectores' => Sector::select('id', 'nombre')->get(),
            'filters'   => $request->only(['filtro_sector', 'filtro_tipo', 'filtro_estado', 'per_page']),
            'flash'     => ['success' => session('success'), 'error' => session('error')],
        ]);
    }
 
    public function store(BarreraPlagaRequest $request)
    {
        $this->service->crear($request->validated());
        return redirect()->route('plagas.barreras.index')->with('success', 'Barrera registrada correctamente.');
    }
 
    public function update(BarreraPlagaRequest $request, BarreraPlaga $barrera)
    {
        $this->service->actualizar($barrera, $request->validated());
        return redirect()->route('plagas.barreras.index')->with('success', 'Barrera actualizada correctamente.');
    }
 
    public function destroy(BarreraPlaga $barrera)
    {
        $barrera->delete();
        return redirect()->route('plagas.barreras.index')->with('success', 'Barrera eliminada.');
    }
}