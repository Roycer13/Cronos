<?php

namespace App\Domain\Sistema\Configuracion\Http\Controllers;



use App\Http\Controllers\Controller;
use App\Domain\Sistema\Configuracion\Http\Requests\UnidadRequest;
use App\Domain\Sistema\Configuracion\Models\Unidad;

use Illuminate\Http\Request;
use Inertia\Inertia;

use Spatie\Permission\Models\Role;

class UnidadController extends Controller
{


    // protected PlantaService $unidadService;
    // public function __construct(PlantaService $unidadService)
    // {
    //     $this->plantaService = $unidadService;
    // }
    public function index()
    {
        return Unidad::all(); // JSON puro para Axios
    }

    // Crear nueva planta
    public function store(UnidadRequest $request)
    {
        $unidad = Unidad::create($request->all());
        return response()->json($unidad);
    }

    // Actualizar planta
    public function update(UnidadRequest $request, Unidad $unidad)
    {
        $unidad->update($request->all());
        return response()->json($unidad);
    }

    // Eliminar planta
    public function destroy(Unidad $unidad)
    {
        $unidad->delete();
        return response()->json(['success' => true]);
    }
}
