<?php

namespace App\Domain\ModulosComunes\Canastillos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\ModulosComunes\Canastillos\Models\TipoAlmacen;
use App\Domain\ModulosComunes\Canastillos\Services\TipoAlmacenService;
use App\Domain\ModulosComunes\Canastillos\Http\Requests\TipoAlmacenRequest;
use Inertia\Inertia;

class TipoAlmacenController extends Controller
{
    protected TipoAlmacenService $tipoAlmacenService;

    public function __construct(TipoAlmacenService $tipoAlmacenService)
    {
        $this->tipoAlmacenService = $tipoAlmacenService;
    }

    public function index()
    {
        $tipos = TipoAlmacen::all();
        return Inertia::render('canastillos/tipos-almacen/index', [
            'tipos' => $tipos,
        ]);
    }

    public function store(TipoAlmacenRequest $request)
    {
        $this->tipoAlmacenService->store($request->validated());
        return redirect()->back()->with('success', 'Tipo de almacén creado.');
    }

    public function update(TipoAlmacenRequest $request, TipoAlmacen $tipo_almacen)
    {
        $this->tipoAlmacenService->update($tipo_almacen, $request->validated());
        return redirect()->back()->with('success', 'Tipo de almacén actualizado.');
    }

    public function destroy(TipoAlmacen $tipo_almacen)
    {
        $this->tipoAlmacenService->delete($tipo_almacen);
        return redirect()->back()->with('success', 'Tipo de almacén eliminado.');
    }
}
