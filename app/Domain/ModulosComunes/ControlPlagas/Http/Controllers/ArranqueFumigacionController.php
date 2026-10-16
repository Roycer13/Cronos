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

class ArranqueFumigacionController extends Controller
{
    public function __construct(protected ArranqueFumigacionService $service) {}

    public function index(Request $request)
    {
        $query = ArranqueFumigacion::with(['sector', 'inspector'])->orderBy('fecha', 'desc');

        if ($request->filled('filtro_sector')) $query->porSector($request->filtro_sector);
        if ($request->filled('filtro_fecha_desde') || $request->filled('filtro_fecha_hasta')) {
            $query->porFecha($request->filtro_fecha_desde, $request->filtro_fecha_hasta);
        }
        if ($request->has('filtro_conforme') && $request->filtro_conforme !== '') {
            if ($request->filtro_conforme == '1') $query->conforme();
            else $query->where(fn($q) => $q->where('sin_olor', false)->orWhere('limpio', false));
        }

        return Inertia::render('comunes/plagas/arranqueFumigacion/index', [
            'registros' => $query->paginate($request->get('per_page', 10)),
            'sectores' => Sector::select('id', 'nombre')->get(),
            'filters'   => $request->only(['filtro_sector', 'filtro_fecha_desde', 'filtro_fecha_hasta', 'filtro_conforme', 'per_page']),
            'flash'     => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function store(ArranqueFumigacionRequest $request)
    {
        $this->service->crear($request->validated(), auth()->user());
        return redirect()->route('plagas.arranque-fumigacion.index')->with('success', 'Registro de arranque creado correctamente.');
    }

    public function update(ArranqueFumigacionRequest $request, ArranqueFumigacion $arranqueFumigacion)
    {
        $this->service->actualizar($arranqueFumigacion, $request->validated());
        return redirect()->route('plagas.arranque-fumigacion.index')->with('success', 'Registro actualizado.');
    }

    public function destroy(ArranqueFumigacion $arranqueFumigacion)
    {
        $arranqueFumigacion->delete();
        return redirect()->route('plagas.arranque-fumigacion.index')->with('success', 'Registro eliminado.');
    }
}
