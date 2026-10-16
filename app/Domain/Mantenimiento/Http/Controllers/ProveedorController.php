<?php

namespace App\Domain\Mantenimiento\Http\Controllers;



use App\Http\Controllers\Controller;
use App\Domain\Mantenimiento\Http\Requests\ProveedorRequest;
use App\Domain\Mantenimiento\Models\Proveedor;

use App\Domain\Sistema\Configuracion\Services\TipoUbicacionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Spatie\Permission\Models\Role;

class ProveedorController extends Controller
{


    // protected PlantaService $ubicacionService;
    // public function __construct(PlantaService $ubicacionService)
    // {
    //     $this->plantaService = $ubicacionService;
    // }
    public function index()
    {
        return Proveedor::with('estado')->get();// JSON puro para Axios
    }

    // Crear nueva planta
    public function store(ProveedorRequest $request)
    {

        $proveedor = Proveedor::create($request->all());
        return response()->json($proveedor->load('estado'));




    }

    // Actualizar planta
    public function update(ProveedorRequest $request, Proveedor $proveedor)
    {


         $proveedor->update($request->all());
        return response()->json($proveedor->load('estado'));
    }

    // Eliminar planta
    public function destroy(Proveedor $proveedor)
    {

         $proveedor->delete();
        return response()->json(['success' => true]);
    }
}












