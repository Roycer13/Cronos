<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Domain\ModulosComunes\Orp\Models\Orp;
use App\Domain\PlantaLacteos\Models\EstadoDetalle;
 // 👈 Importante
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class AmbienteFrioController extends Controller
{
    public function index(Request $request)
    {
        $estadosDetalle = EstadoDetalle::with([
                'orp.productoTerminado.destino',
                'estadoPlanta.etapa'
            ])
            ->whereHas('estadoPlanta', function ($query) {
                $query->whereHas('etapa', function ($subQuery) {
                    $subQuery->where('nombre', 'Envasando');
                });
            })
            ->whereHas('orp.productoTerminado.linea', function ($query) {
                $query->where('nombre', 'HTST');
            })
            ->whereDoesntHave('orp.productoTerminado', function ($query) {
                $query->whereRaw('LOWER(nombre_sap) LIKE ?', ['%premezcla%']);
            })
            ->whereDoesntHave('orp', function ($query) {
                $query->where('ambiente_frio', 'Completado');
            })
            ->selectRaw('DISTINCT orp_id, preparacion, MAX(id) as id, MAX(estado_planta_id) as estado_planta_id, MAX(cantidad) as cantidad, MAX(user_id) as user_id')
            ->groupBy('orp_id', 'preparacion')
            ->orderBy('orp_id')
            ->orderBy('preparacion')
            ->get();

        return Inertia::render('planta_lacteos/seguimientos/ambiente_frio/index', [
            'estadosDetalle' => $estadosDetalle,
        ]);
    }

    public function confirmar(Request $request)
    {
        $datos = $request->input('selectedDetalles', []);

        Log::info('=== CONFIRMACIÓN AMBIENTE FRÍO ===');
        Log::info('Cantidad de registros: ' . count($datos));

        $orpIds = collect($datos)->pluck('orp_id')->unique()->filter()->values();

        foreach ($datos as $index => $detalle) {
            Log::info('Registro #' . ($index + 1), [
                'orp_codigo' => $detalle['orp_codigo'] ?? 'N/A',
                'preparacion' => $detalle['preparacion'] ?? 'N/A',
                'producto' => $detalle['producto_nombre'] ?? 'N/A',
                'codigo_sap' => $detalle['producto_codigo'] ?? 'N/A',
                'cantidad' => $detalle['cantidad'] ?? 'N/A',
                'estado_detalle_id' => $detalle['id'] ?? 'N/A',
                'orp_id' => $detalle['orp_id'] ?? 'N/A',
            ]);
        }


        if ($orpIds->isNotEmpty()) {


            Orp::whereIn('id', $orpIds)->update(['ambiente_frio' => 'Completado']);
            Log::info('ORPs actualizadas a Completado: ' . $orpIds->implode(', '));
        }

        Log::info('=== FIN CONFIRMACIÓN ===');

        return response()->json([
            'success' => true,
            'message' => 'Orden de envío confirmada y ORPs actualizadas',
            'received_count' => count($datos)
        ]);
    }



    public function buscarPorOrp(Request $request)
{
    $request->validate([
        'codigo' => 'required|string'
    ]);

    $codigo = $request->input('codigo');

    $estadosDetalle = EstadoDetalle::with([
            'orp.productoTerminado.destino',
            'estadoPlanta.etapa'
        ])
        ->whereHas('orp', function ($query) use ($codigo) {
            $query->where('codigo', $codigo);
        })
        ->selectRaw('DISTINCT orp_id, preparacion, MAX(id) as id, MAX(estado_planta_id) as estado_planta_id, MAX(cantidad) as cantidad, MAX(user_id) as user_id')
        ->groupBy('orp_id', 'preparacion')
        ->orderBy('orp_id')
        ->orderBy('preparacion')
        ->get();

    return response()->json($estadosDetalle);
}
}
