<?php
// app/Domain/PlantaLacteos/Http/Controllers/HigieneAcopioController.php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\HigieneAcopio;
use App\Domain\PlantaLacteos\Models\RutaAcopio;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;


class HigieneAcopioController extends Controller
{
    public function index(Request $request)
    {
        $higieneAcopios = HigieneAcopio::with(['usuario', 'estado', 'ruta'])
            ->filter($request->only(['ruta_id', 'estado_id']))
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $rutas = RutaAcopio::all();
        $estados = Estado::whereIn('nombre', ['Pendiente', 'Aceptado', 'Rechazado'])->get();

        return Inertia::render('planta_lacteos/leches/higiene/index', [
            'higieneAcopios' => $higieneAcopios,
            'rutas' => $rutas,
            'estados' => $estados,
            'filters' => $request->only(['ruta_id', 'estado_id']),
        ]);
    }

    public function edit(HigieneAcopio $higieneAcopio)
    {
        $higieneAcopio->load(['ruta', 'usuario', 'estado']);

        return Inertia::render('planta_lacteos/leches/higiene/editar', [
            'higieneAcopio' => $higieneAcopio,
            'estados' => Estado::whereIn('nombre', ['Pendiente', 'Aceptado', 'Rechazado'])->get(),
        ]);
    }

   public function update(Request $request, HigieneAcopio $higieneAcopio)
{
    $validated = $request->validate([
        'superficie_llegada' => 'boolean',
        'observacion_llegada' => 'nullable|string',
        'correccion_llegada' => 'nullable|string',
        'cofia' => 'boolean',
        'Barbijo' => 'boolean',
        'Overol' => 'boolean',
        'superficie_salida' => 'boolean',
        'observacion_salida' => 'nullable|string',
        'correccion_salida' => 'nullable|string',
    ]);

    // Buscar o crear el estado "Completado"
    $estadoCompletado = Estado::firstOrCreate(
        ['nombre' => 'Completado'],
        ['color' => '#10b981'] // Verde, puedes cambiarlo
    );

    // Actualizar incluyendo el estado_id
    $higieneAcopio->update(array_merge($validated, [
        'estado_id' => $estadoCompletado->id,
    ]));

    return redirect()->route('higiene-acopio.index')
        ->with('success', 'Registro de higiene actualizado correctamente.');
}




public function completar(HigieneAcopio $higieneAcopio)
{
    // Buscar o crear el estado "Completado"
    $estadoCompletado = Estado::firstOrCreate(
        ['nombre' => 'Completado'],
        ['color' => '#10b981']
    );

    // Si ya está completado, redirigir con mensaje
    if ($higieneAcopio->estado_id === $estadoCompletado->id) {
        return redirect()->route('higiene-acopio.index')
            ->with('info', 'Este registro ya estaba completado.');
    }

    $higieneAcopio->update(['estado_id' => $estadoCompletado->id]);

    return redirect()->route('higiene-acopio.index')
        ->with('success', 'Registro marcado como Completado correctamente.');
}

// También debemos asegurar que exista el método destroy
public function destroy(HigieneAcopio $higieneAcopio)
{
    $higieneAcopio->delete();
    return redirect()->route('higiene-acopio.index')
        ->with('success', 'Registro eliminado correctamente.');
}







public function pdf(Request $request)
{
    try {
        $fechaDesde = $request->input('fecha_desde');
        $fechaHasta = $request->input('fecha_hasta');
        if (!$fechaDesde || !$fechaHasta) {
            return response()->json(['error' => 'Fechas requeridas'], 400);
        }

        $query = HigieneAcopio::with([
            'usuario',
            'estado',
            'ruta'
        ]);

        // Filtro de fechas
        $desde = Carbon::parse($fechaDesde)->startOfDay();
        $hasta = Carbon::parse($fechaHasta)->endOfDay();
        $query->whereBetween('tiempo', [$desde, $hasta]);

        if ($request->filled('ruta_id')) {
            $query->where('PLL_ruta_acopios_id', $request->ruta_id);
        }
        if ($request->filled('estado_id')) {
            $query->where('estado_id', $request->estado_id);
        }

        $registros = $query->orderBy('tiempo', 'desc')->get();

        // Recolectar usuarios involucrados (solo el usuario que registró)
        $usuariosMap = [];
        foreach ($registros as $reg) {
            if ($reg->usuario && $reg->usuario->codigo) {
                $codigo = $reg->usuario->codigo;
                if (!isset($usuariosMap[$codigo])) {
                    $usuariosMap[$codigo] = [
                        'codigo' => $codigo,
                        'nombre' => trim(($reg->usuario->name ?? '') . ' ' . ($reg->usuario->apellido ?? '')),
                    ];
                }
            }
        }

        $usuariosInvolucrados = array_values($usuariosMap);

        return response()->json([
            'registros' => $registros,
            'usuarios_involucrados' => $usuariosInvolucrados,
            'filtros' => [
                'fecha_desde' => $fechaDesde,
                'fecha_hasta' => $fechaHasta,
            ]
        ]);
    } catch (\Exception $e) {
        Log::error('Error en pdf higiene acopio: ' . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}
