<?php

namespace App\Domain\Sistema\Configuracion\Http\Controllers;



use App\Http\Controllers\Controller;
use App\Domain\Sistema\Configuracion\Http\Requests\UbicacionRequest;

use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\TipoUbicacion;
use App\Domain\Sistema\Configuracion\Services\UbicacionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Spatie\Permission\Models\Role;

class UbicacionController extends Controller
{


    // protected PlantaService $ubicacionService;
    // public function __construct(PlantaService $ubicacionService)
    // {
    //     $this->plantaService = $ubicacionService;
    // }
    public function index()
    {
        return Ubicacion::with('tipoUbicacion')->get(); // JSON puro para Axios
    }

    // Crear nueva planta
    public function store(UbicacionRequest $request)
    {
        $ubicacion = Ubicacion::create($request->all());
        return response()->json($ubicacion->load('tipoUbicacion'));
    }

    // Actualizar planta
    public function update(UbicacionRequest $request, Ubicacion $ubicacion)
    {
        $ubicacion->update($request->all());
        return response()->json($ubicacion->load('tipoUbicacion'));
    }

    // Eliminar planta
    public function destroy(Ubicacion $ubicacion)
    {
        $ubicacion->delete();
        return response()->json(['success' => true]);
    }
}
