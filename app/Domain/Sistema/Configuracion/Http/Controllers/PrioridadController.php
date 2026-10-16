<?php

namespace App\Domain\Sistema\Configuracion\Http\Controllers;



use App\Http\Controllers\Controller;
use App\Domain\Sistema\Configuracion\Http\Requests\PrioridadRequest;
use App\Domain\Sistema\Configuracion\Models\Prioridad;

use Illuminate\Http\Request;
use Inertia\Inertia;

use Spatie\Permission\Models\Role;

class PrioridadController extends Controller
{


    // protected PlantaService $unidadService;
    // public function __construct(PlantaService $unidadService)
    // {
    //     $this->plantaService = $unidadService;
    // }
    public function index()
    {
        return Prioridad::all(); // JSON puro para Axios
    }

    // Crear nueva planta
    public function store(PrioridadRequest $request)
    {
        $prioridad = Prioridad::create($request->all());
        return response()->json($prioridad);
    }

    // Actualizar planta
    public function update(PrioridadRequest $request, Prioridad $prioridad)
    {
        $prioridad->update($request->all());
        return response()->json($prioridad);
    }

    // Eliminar planta
    public function destroy(Prioridad $prioridad)
    {
        $prioridad->delete();
        return response()->json(['success' => true]);
    }
}
