<?php

namespace App\Domain\Mantenimiento\Http\Controllers;



use App\Http\Controllers\Controller;
use App\Domain\Mantenimiento\Http\Requests\TipoMaquinaEquipoRequest;
use App\Domain\Mantenimiento\Models\TipoMaquinaEquipo;

use App\Domain\Sistema\Configuracion\Services\TipoUbicacionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Spatie\Permission\Models\Role;

class TipoMaquinaEquipoController extends Controller
{


    // protected PlantaService $ubicacionService;
    // public function __construct(PlantaService $ubicacionService)
    // {
    //     $this->plantaService = $ubicacionService;
    // }
    public function index()
    {
        return TipoMaquinaEquipo::all(); // JSON puro para Axios
    }

    // Crear nueva planta
    public function store(TipoMaquinaEquipoRequest $request)
    {

        $tipoMaquinaEquipo = TipoMaquinaEquipo::create($request->all());
        return response()->json($tipoMaquinaEquipo);
    }

    // Actualizar planta
    public function update(TipoMaquinaEquipoRequest $request, TipoMaquinaEquipo $tipoMaquinaEquipo)
    {


         $tipoMaquinaEquipo->update($request->all());
        return response()->json($tipoMaquinaEquipo);
    }

    // Eliminar planta
    public function destroy(TipoMaquinaEquipo $tipoMaquinaEquipo)
    {

         $tipoMaquinaEquipo->delete();
        return response()->json(['success' => true]);
    }
}
