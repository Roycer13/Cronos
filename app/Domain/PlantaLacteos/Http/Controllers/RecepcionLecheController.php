<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\RecepcionLeche;
use App\Domain\PlantaLacteos\Models\SubRutaAcopio;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\PlantaLacteos\Http\Requests\RecepcionLecheRequest;
use App\Domain\PlantaLacteos\Services\RecepcionLecheService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecepcionLecheController extends Controller
{
    protected RecepcionLecheService $recepcionLecheService;

    public function __construct(RecepcionLecheService $recepcionLecheService)
    {
        $this->recepcionLecheService = $recepcionLecheService;
    }

    public function index(Request $request)
    {
        $filters = $request->only([
            'search',
            'PLL_subruta_acopios_id',
            'estado_id',
            'user_id',
            'tipo_recepcion',
            'ruta_id',
            'per_page'
        ]);

        $recepciones = RecepcionLeche::with(['subruta.ruta', 'usuario', 'estado'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('observaciones', 'like', "%{$search}%");
            })
            ->filter($filters)
            ->orderBy($request->get('sort', 'tiempo'), $request->get('direction', 'desc'))
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        $subrutas = SubRutaAcopio::with('ruta')->get();
        $rutas = \App\Domain\PlantaLacteos\Models\RutaAcopio::all();
        $estados = Estado::all();
        $usuarios = User::all();

        return Inertia::render('planta_lacteos/leches/recepciones/index', [
            'recepciones' => $recepciones,
            'subrutas' => $subrutas,
            'rutas' => $rutas,
            'estados' => $estados,
            'usuarios' => $usuarios,
            'filters' => $filters,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create()
    {
        $subrutas = SubRutaAcopio::with('ruta:id,nombre')
            ->get(['id', 'nombre', 'grupo', 'PLL_ruta_acopios_id', 'estado'])
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'nombre' => $s->nombre,
                    'grupo' => $s->grupo,
                    'ruta_id' => $s->PLL_ruta_acopios_id, // <-- normalizo aquí
                    'ruta' => $s->ruta ? ['id' => $s->ruta->id, 'nombre' => $s->ruta->nombre] : null,
                    'estado' => $s->estado,
                ];
            });

        return Inertia::render('planta_lacteos/leches/recepciones/crear', [
            'subrutas' => $subrutas,
        ]);
    }
    public function store(RecepcionLecheRequest $request)
    {
        try {
            $recepciones = $this->recepcionLecheService->createRecepcionLeche($request->validated());
            $count = count($recepciones);
            return redirect()
                ->route('recepciones-leche.index')
                ->with('success', "$count recepción(es) de leche creada(s) exitosamente.");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al crear la recepción de leche: ' . $e->getMessage());
        }
    }

    public function edit(RecepcionLeche $recepciones_leche)
    {
        $recepciones_leche->load(['subruta.ruta', 'usuario', 'estado']);

        $subrutas = SubRutaAcopio::with('ruta')->where('estado', true)->get();

        return Inertia::render('planta_lacteos/leches/recepciones/editar', [
            'recepcion' => $recepciones_leche,
            'subrutas' => $subrutas,
        ]);
    }

    public function update(RecepcionLecheRequest $request, RecepcionLeche $recepciones_leche)
    {
        try {
            $this->recepcionLecheService->updateRecepcionLeche($recepciones_leche, $request->validated());
            return redirect()->route('recepciones-leche.index')->with('success', 'Recepción de leche actualizada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al actualizar la recepción de leche: ' . $e->getMessage());
        }
    }

    public function destroy($id)
{
    try {
        $recepcion = RecepcionLeche::findOrFail($id);
        $this->recepcionLecheService->deleteRecepcionLeche($recepcion);
        return redirect()->route('recepciones-leche.index')
            ->with('success', 'Recepción de leche eliminada exitosamente.');
    } catch (\Exception $e) {
        return redirect()->route('recepciones-leche.index')
            ->with('error', 'Error al eliminar la recepción de leche: ' . $e->getMessage());
    }
}
}
