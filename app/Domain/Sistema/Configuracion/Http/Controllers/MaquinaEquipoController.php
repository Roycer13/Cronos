<?php

namespace App\Domain\Sistema\Configuracion\Http\Controllers;



use App\Http\Controllers\Controller;
use App\Domain\Sistema\Configuracion\Http\Requests\MaquinaEquipoRequest;
use App\Domain\Sistema\Configuracion\Models\MaquinaEquipo;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\TipoUbicacion;
use App\Domain\Sistema\Configuracion\Services\UbicacionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Spatie\Permission\Models\Role;

class MaquinaEquipoController extends Controller
{


    // protected PlantaService $ubicacionService;
    // public function __construct(PlantaService $ubicacionService)
    // {
    //     $this->plantaService = $ubicacionService;
    // }
    public function index()
    {
        return MaquinaEquipo::with('tipoMaquinaEquipo')->get(); // JSON puro para Axios
    }

    // Crear nueva planta
    public function store(MaquinaEquipoRequest $request)
    {
        $maquinaEquipo = MaquinaEquipo::create($request->all());
        return response()->json($maquinaEquipo->load('tipoMaquinaEquipo'));
    }

    // Actualizar planta
    public function update(MaquinaEquipoRequest $request, MaquinaEquipo $maquinaEquipo)
    {
        $maquinaEquipo->update($request->all());
        return response()->json($maquinaEquipo->load('tipoMaquinaEquipo'));
    }

    // Eliminar planta
    public function destroy(MaquinaEquipo $maquinaEquipo)
    {
        $maquinaEquipo->delete();
        return response()->json(['success' => true]);
    }
}
