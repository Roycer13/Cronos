<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Domain\PlantaLacteos\Http\Requests\InformeMateriaPrimaRequest;
use App\Domain\PlantaLacteos\Models\AlmacenMateriaPrima;
use App\Domain\PlantaLacteos\Models\ItemMateriaPrima;
use App\Domain\PlantaLacteos\Models\ProveedorMateriaPrima;
use App\Domain\PlantaLacteos\Services\InformeMateriaPrimaService;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Exports\RecepcionesMateriaPrimaExport;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class InformeMateriaPrimaController extends Controller
{
    public function __construct(private InformeMateriaPrimaService $servicio)
    {
    }

    // Mismas reglas que RecepcionMateriaPrimaController: admin ve todo, el resto su ubicación.
    private function ubicacionId(): ?int
    {
        $user = auth()->user();

        return $user->hasRole('admin') ? null : $user->ubicacion_id;
    }

    public function index()
    {
        return Inertia::render('planta_lacteos/materiaPrima/informe/index', [
            'items' => ItemMateriaPrima::orderBy('nombre')->get(['id', 'nombre']),
            'proveedores' => ProveedorMateriaPrima::orderBy('nombre')->get(['id', 'nombre']),
            'almacenes' => AlmacenMateriaPrima::orderBy('nombre')->get(['id', 'nombre']),
            'estados' => Estado::orderBy('nombre')->get(['id', 'nombre']),
        ]);
    }

    public function datos(InformeMateriaPrimaRequest $request)
    {
        $filtros = $request->validated();
        $ubicacionId = $this->ubicacionId();

        return response()->json([
            'resumen' => $this->servicio->resumen($filtros, $ubicacionId),
            'detalle' => $this->servicio->detalle($filtros, $ubicacionId, (int) ($filtros['per_page'] ?? 10)),
        ]);
    }

    // Datos completos (sin paginar) para generar el reporte impreso en el navegador.
    public function reporte(InformeMateriaPrimaRequest $request)
    {
        $filtros = $request->validated();
        $ubicacionId = $this->ubicacionId();

        return response()->json([
            'resumen' => $this->servicio->resumen($filtros, $ubicacionId),
            'detalle' => $this->servicio->detalleCompleto($filtros, $ubicacionId),
            'emitido_por' => auth()->user()->name,
        ]);
    }

    public function excel(InformeMateriaPrimaRequest $request)
    {
        return Excel::download(
            new RecepcionesMateriaPrimaExport($this->servicio->base($request->validated(), $this->ubicacionId())),
            'materia-prima-ingresada-' . now()->format('Ymd-His') . '.xlsx'
        );
    }
}
