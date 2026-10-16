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

class InsectocaptorController extends Controller
{
    public function __construct(protected InsectocaptorService $service) {}
 
    public function index(Request $request)
    {
        $query = Insectocaptor::with('sector')->orderBy('created_at', 'desc');
 
        if ($request->filled('filtro_sector')) $query->porSector($request->filtro_sector);
        if ($request->filled('filtro_tipo'))   $query->porTipo($request->filtro_tipo);
        if ($request->has('filtro_estado') && $request->filtro_estado !== '') {
            $query->where('estado', $request->filtro_estado);
        }
 
        return Inertia::render('comunes/plagas/insectocaptores/index', [
            'registros' => $query->paginate($request->get('per_page', 15)),
            'sectores' => Sector::select('id', 'nombre')->get(),
            'tipos'     => Insectocaptor::TIPOS,
            'filters'   => $request->only(['filtro_sector', 'filtro_tipo', 'filtro_estado', 'per_page']),
            'flash'     => ['success' => session('success'), 'error' => session('error')],
        ]);
    }
 
    public function store(InsectocaptorRequest $request)
    {
        $this->service->crear($request->validated());
        return redirect()->route('plagas.insectocaptores.index')->with('success', 'Equipo registrado correctamente.');
    }
 
    public function update(InsectocaptorRequest $request, Insectocaptor $insectocaptor)
    {
        $this->service->actualizar($insectocaptor, $request->validated());
        return redirect()->route('plagas.insectocaptores.index')->with('success', 'Equipo actualizado.');
    }
 
    public function destroy(Insectocaptor $insectocaptor)
    {
        $insectocaptor->delete();
        return redirect()->route('plagas.insectocaptores.index')->with('success', 'Equipo eliminado.');
    }
}