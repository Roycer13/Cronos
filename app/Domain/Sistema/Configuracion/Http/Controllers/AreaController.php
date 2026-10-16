<?php

namespace App\Domain\Sistema\Configuracion\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\Sistema\Configuracion\Models\Area;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use Illuminate\Http\Request;

class AreaController extends Controller
{
    public function index()
    {
        // Traemos todas las áreas con su planta asociada
        return Area::with('ubicacion')->get(); // JSON para Axios
    }

    public function store(Request $request)
    {
        $area = Area::create($request->all());
        return response()->json($area->load('ubicacion')); // devolvemos con la relación
    }

    public function update(Request $request, Area $area)
    {
        $area->update($request->all());
        return response()->json($area->load('ubicacion'));
    }

    public function destroy(Area $area)
    {
        $area->delete();
        return response()->json(['success' => true]);
    }
}
