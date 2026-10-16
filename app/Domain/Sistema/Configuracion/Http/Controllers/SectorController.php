<?php

namespace App\Domain\Sistema\Configuracion\Http\Controllers;



use App\Http\Controllers\Controller;
use App\Domain\Sistema\Configuracion\Http\Requests\SectorRequest;

use App\Domain\Sistema\Configuracion\Models\Sector;
use App\Domain\Sistema\Configuracion\Models\TipoUbicacion;
use App\Domain\Sistema\Configuracion\Services\UbicacionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Spatie\Permission\Models\Role;

class SectorController extends Controller
{


    // protected PlantaService $ubicacionService;
    // public function __construct(PlantaService $ubicacionService)
    // {
    //     $this->plantaService = $ubicacionService;
    // }
    public function index()
    {
        return Sector::with('Ubicacion')->get(); // JSON puro para Axios

    }

    // Crear nueva planta
    public function store(SectorRequest $request)
    {
        $sector = Sector::create($request->all());
        return response()->json($sector->load('Ubicacion'));
    }

    // Actualizar planta
    public function update(SectorRequest $request, Sector $sector)
    {
        $sector->update($request->all());
        return response()->json($sector->load('Ubicacion'));
    }

    // Eliminar planta
    public function destroy(Sector $sector)
    {
        $sector->delete();
        return response()->json(['success' => true]);
    }
}
