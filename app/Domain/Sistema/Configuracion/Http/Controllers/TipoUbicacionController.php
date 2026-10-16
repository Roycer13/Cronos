<?php

namespace App\Domain\Sistema\Configuracion\Http\Controllers;



use App\Http\Controllers\Controller;
use App\Domain\Sistema\Configuracion\Http\Requests\TipoUbicacionRequest;
use App\Domain\Sistema\Configuracion\Models\TipoUbicacion;

use App\Domain\Sistema\Configuracion\Services\TipoUbicacionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Spatie\Permission\Models\Role;

class TipoUbicacionController extends Controller
{


    // protected PlantaService $ubicacionService;
    // public function __construct(PlantaService $ubicacionService)
    // {
    //     $this->plantaService = $ubicacionService;
    // }
    public function index()
    {
        return TipoUbicacion::all(); // JSON puro para Axios
    }

    // Crear nueva planta
    public function store(TipoUbicacionRequest $request)
    {

        $tipoUbicacion = TipoUbicacion::create($request->all());
        return response()->json($tipoUbicacion);
    }

    // Actualizar planta
    public function update(TipoUbicacionRequest $request, TipoUbicacion $tipoUbicacion)
    {


         $tipoUbicacion->update($request->all());
        return response()->json($tipoUbicacion);
    }

    // Eliminar planta
    public function destroy(TipoUbicacion $tipoUbicacion)
    {

         $tipoUbicacion->delete();
        return response()->json(['success' => true]);
    }
}
