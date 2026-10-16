<?php

namespace App\Domain\PlantaLacteos\Http\Controllers\Externo;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Http\Requests\Externo\TipoMuestraRequest;
use App\Domain\PlantaLacteos\Models\ExtTipoMuestra;
use App\Domain\PlantaLacteos\Services\Externo\TipoMuestraService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TipoMuestraController extends Controller
{
    protected $tipoMuestraService;

    public function __construct(TipoMuestraService $tipoMuestraService)
    {
        $this->tipoMuestraService = $tipoMuestraService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $ubicacionId = $user->ubicacion_id; // Filtro por ubicación del usuario

        $tipos = $this->tipoMuestraService->listarPorUbicacion($ubicacionId, $request->only('nombre'));

        return Inertia::render('planta_lacteos/externo/tipos_muestra/index', [
            'tipos' => $tipos,
            'ubicacionId' => $ubicacionId,
            'flash' => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        return Inertia::render('planta_lacteos/externo/tipos_muestra/crear', [
            'ubicacion_id' => $user->ubicacion_id,
        ]);
    }

    public function store(TipoMuestraRequest $request)
    {
        $data = $request->validated();

        $data['ubicacion_id'] = auth()->user()->ubicacion_id; // Forzar ubicación del usuario
        $this->tipoMuestraService->crear($data);
        return redirect()->route('externo.tipos-muestra.index')->with('success', 'Tipo de muestra creado.');
    }

    public function edit($tipo_muestra) // <-- ahora recibe el ID (el parámetro de la ruta {tipo_muestra})
    {
        $tipoMuestra = ExtTipoMuestra::findOrFail($tipo_muestra);

        return Inertia::render('planta_lacteos/externo/tipos_muestra/editar', [
            'tipoMuestra' => $tipoMuestra->toArray(),
        ]);
    }

    public function update(TipoMuestraRequest $request, $tipo_muestra)
    {
        $tipoMuestra = ExtTipoMuestra::findOrFail($tipo_muestra);
        $this->tipoMuestraService->actualizar($tipoMuestra, $request->validated());
        return redirect()->route('externo.tipos-muestra.index')->with('success', 'Tipo de muestra actualizado.');
    }

    public function destroy($tipo_muestra) // parámetro de ruta {tipo_muestra}
    {
        $tipoMuestra = ExtTipoMuestra::findOrFail($tipo_muestra);
        try {
            $this->tipoMuestraService->eliminar($tipoMuestra);
            return redirect()->route('externo.tipos-muestra.index')->with('success', 'Eliminado.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
