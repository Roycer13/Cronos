<?php

namespace App\Domain\Mantenimiento\Http\Controllers;



use App\Http\Controllers\Controller;
use App\Domain\Mantenimiento\Http\Requests\RepuestoRequest;
use App\Domain\Mantenimiento\Models\Proveedor;
use App\Domain\Mantenimiento\Models\Repuesto;
use App\Domain\Mantenimiento\Services\RepuestoService;
use App\Domain\Sistema\Configuracion\Models\Unidad;
use App\Domain\Sistema\Configuracion\Services\TipoUbicacionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Spatie\Permission\Models\Role;

class RepuestoController extends Controller
{
    protected RepuestoService $repuestoService;

    public function __construct(RepuestoService $repuestoService)
    {
        $this->repuestoService = $repuestoService;
    }

    public function index(Request $request)
    {

        $filters = $request->only(['search', 'nombre', 'codigo', 'unidad_id']);


        //llamamos los datos de usuarios
        $repuestos = Repuesto::with(['unidad'])
            ->filter($filters) // Aplicamos el scope de filtros
            ->orderBy($request->get('sort', 'created_at'))
            ->paginate($request->get('per_page', 10))
            ->withQueryString();


        //usamos inertia para llamar a la vista
        return Inertia::render('mantenimiento/repuestos/index', [
            'repuestos' => $repuestos,
            'filters' => $filters,
            'unidades' => Unidad::all(),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],

        ]);
    }


    public function create()
    {

        return Inertia::render('mantenimiento/repuestos/crear', [
            'unidades' => Unidad::all(), // ahora esto usa Spatie
        ]);
    }




       public function store(RepuestoRequest $request)
    {
        //usamos el servicio de crear
        $this->repuestoService->createRepuesto($request->all());
        return redirect()->route('repuestos')->with('success', 'Repuestos creado exitosamente.');
    }


    public function edit(Repuesto $repuesto)
    {


        return Inertia::render('mantenimiento/repuestos/editar', [
            'repuesto' => $repuesto,
            'unidades' => Unidad::all(),

        ]);
    }
    // Actualizar planta
    public function update(RepuestoRequest $request, Repuesto $repuesto)
    {

        try {
            //usamos el servicio de editar
            $this->repuestoService->updateRepuesto($repuesto,$request->all());



            return redirect()->route('repuestos')
                ->with('success', 'Repuesto actualizado correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    // Eliminar planta
    public function destroy(Repuesto $repuesto)
    {




        try {
            //usamos el servicio de eliminar
            $this->repuestoService->deleteRepuesto($repuesto);
            return redirect()->route('repuestos')
                ->with('success', 'repuestos eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('repuestos')
                ->with('error', $e->getMessage());
        }
    }
}
