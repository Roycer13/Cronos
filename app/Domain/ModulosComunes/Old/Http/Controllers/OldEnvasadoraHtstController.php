<?php

namespace App\Domain\ModulosComunes\Old\Http\Controllers;

use App\Domain\ModulosComunes\Old\Models\OldEnvasadoraHtst;
use App\Domain\ModulosComunes\Old\Services\OldEnvasadoraHtstService;
use App\Domain\ModulosComunes\Orp\Models\Orp;
use App\Domain\PlantaLacteos\Models\Origen;
use App\Domain\Sistema\Configuracion\Models\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Routing\Controller;

class OldEnvasadoraHtstController extends Controller
{
    protected $service;

    public function __construct(OldEnvasadoraHtstService $service)
    {
        $this->service = $service;
    }

    /**
     * 📋 LISTADO
     */
    public function index()
    {
        return Inertia::render('comunes/old/envasadoras/index', [
            'registros' => OldEnvasadoraHtst::with(['maquinista', 'verificador', 'orp'])
                ->latest()
                ->paginate(20)
        ]);
    }

    /**
     * ➕ FORM CREAR
     */
    public function create()
    {
        // 🔍 Traer todos los orígenes (envasadoras)
        $origenes = Origen::select('id', 'alias', 'descripcion')
            ->get()
            ->map(function ($o) {
                return [
                    'value' => (string) $o->id,
                    'label' => $o->alias . ' - ' . $o->descripcion,
                    'descripcion'  => $o->descripcion, // Para filtrado en frontend
                    'alias' => $o->alias
                ];
            });

        return Inertia::render('comunes/old/envasadoras/create', [

            'orps' => Orp::select('id', 'codigo', 'lote')
                ->where('revisado', false)
                ->get()
                ->map(fn($o) => [
                    'value' => (string) $o->id,
                    'label' => $o->codigo . ' - Lote: ' . $o->lote
                ]),

            'users' => User::select('id', 'name')
                ->get()
                ->map(fn($u) => [
                    'value' => (string) $u->id,
                    'label' => $u->name
                ]),

            'origenes_list' => $origenes,

            'config' => config('maquinas')
        ]);
    }   
    /**
     * 💾 GUARDAR
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipo_maquina' => 'required|in:cabezal,vasos,botella',
            'fecha' => 'required|date',

            'orp_id' => 'nullable|exists:orps,id',

            'valor_produccion' => 'nullable|numeric',
            'tipo_medicion' => 'nullable|in:peso,volumen',

            'maquinista_id' => 'required|exists:users,id',
            'usuario_verificador' => 'nullable|exists:users,id',

            'tiempo_inicio_limpieza' => 'nullable|date',
            'tiempo_fin_limpieza' => 'nullable|date',
            'tipo_limpieza' => 'nullable|string',

            'calibracion_inicio' => 'nullable|date',
            'calibracion_fin' => 'nullable|date',
            'envasado_inicio' => 'nullable|date',
            'envasado_fin' => 'nullable|date',

            'merma' => 'nullable|numeric',

            'checks' => 'nullable|array',
            'origenes' => 'nullable|array',
            'origenes.*' => 'string|exists:PLL_origenes,id',

            'observaciones' => 'nullable|string',
            'correciones' => 'nullable|string',
        ]);

        $this->service->store($validated);

        return redirect()
            ->route('old-envasadoras.index')
            ->with('success', 'Registro creado correctamente');
    }

    /**
     * ✏️ EDITAR
     */
    public function edit(OldEnvasadoraHtst $oldEnvasadoraHtst)
    {
        // 🔍 Traer todos los orígenes (envasadoras)
        $origenes = Origen::select('id', 'alias', 'descripcion')
            ->get()
            ->map(function ($o) {
                return [
                    'value' => (string) $o->id,
                    'label' => $o->alias . ' - ' . $o->descripcion,
                    'descripcion'  => $o->descripcion, // Para filtrado en frontend
                    'alias' => $o->alias
                ];
            });

        return Inertia::render('comunes/old/envasadoras/edit', [

            'registro' => $oldEnvasadoraHtst,

            'orps' => Orp::select('id', 'codigo', 'lote')
                ->where('revisado', false)
                ->get()
                ->map(fn($o) => [
                    'value' => (string) $o->id,
                    'label' => $o->codigo . ' - Lote: ' . $o->lote
                ]),

            'users' => User::select('id', 'name')
                ->get()
                ->map(fn($u) => [
                    'value' => (string) $u->id,
                    'label' => $u->name
                ]),

            'origenes_list' => $origenes,

            'config' => config('maquinas')
        ]);
    }

    /**
     * 🔄 UPDATE
     */
    public function update(Request $request, OldEnvasadoraHtst $oldEnvasadoraHtst)
    {
        $validated = $request->validate([
            'tipo_maquina' => 'required|in:cabezal,vasos,botella',
            'fecha' => 'required|date',
            'orp_id' => 'nullable|exists:orps,id',

            'valor_produccion' => 'nullable|numeric',
            'tipo_medicion' => 'nullable|in:peso,volumen',

            'maquinista_id' => 'required|exists:users,id',
            'usuario_verificador' => 'nullable|exists:users,id',

            'tiempo_inicio_limpieza' => 'nullable|date',
            'tiempo_fin_limpieza' => 'nullable|date',
            'tipo_limpieza' => 'nullable|string',

            'calibracion_inicio' => 'nullable|date',
            'calibracion_fin' => 'nullable|date',
            'envasado_inicio' => 'nullable|date',
            'envasado_fin' => 'nullable|date',

            'merma' => 'nullable|numeric',
            'checks' => 'nullable|array',
            'origenes' => 'nullable|array',
            'origenes.*' => 'string|exists:PLL_origenes,id',

            'observaciones' => 'nullable|string',
            'correciones' => 'nullable|string',
        ]);

        $oldEnvasadoraHtst->update($validated);

        return redirect()
            ->route('old-envasadoras.index')
            ->with('success', 'Registro actualizado');
    }

    /**
     * ❌ DELETE
     */
    public function destroy(OldEnvasadoraHtst $oldEnvasadoraHtst)
    {
        $oldEnvasadoraHtst->delete();

        return back()->with('success', 'Registro eliminado');
    }
}
