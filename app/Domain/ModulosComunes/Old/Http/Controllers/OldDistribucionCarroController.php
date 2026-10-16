<?php

namespace App\Domain\ModulosComunes\Old\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Domain\Sistema\Configuracion\Models\User;

use App\Domain\ModulosComunes\Old\Models\OldDistribucionCarro;
use App\Domain\ModulosComunes\Old\Services\OldDistribucionCarroService;
use App\Domain\ModulosComunes\Old\Http\Requests\OldDistribucionCarroRequest;

class OldDistribucionCarroController extends Controller
{
    public function __construct(protected OldDistribucionCarroService $service) {}

    public function index(Request $request)
    {
        $query = OldDistribucionCarro::with('usuario')->orderBy('fecha', 'desc');

        if ($request->filled('filtro_destino')) {
            $query->where('destino', 'like', '%' . $request->filtro_destino . '%');
        }
        if ($request->filled('filtro_placa')) {
            $query->where('placa', 'like', '%' . $request->filtro_placa . '%');
        }

        return Inertia::render('comunes/old/distribucionCarros/index', [
            'registros' => $query->paginate($request->get('per_page', 10)),
            'usuarios' => User::select('id', 'name')->get(),
            'filters'   => $request->only(['filtro_destino', 'filtro_placa', 'per_page']),
            'flash'     => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function create()
    {
        return Inertia::render('comunes/old/distribucionCarros/create', [
            'placas' => OldDistribucionCarro::distinct()
                ->pluck('placa')
                ->filter()
                ->sort()
                ->values(),
        ]);
    }

    public function store(OldDistribucionCarroRequest $request)
    {
        $this->service->crear($request->validated());
        return redirect()->route('old-distribucion-carros.index')->with('success', 'Registro creado correctamente.');
    }

    public function edit(OldDistribucionCarro $oldDistribucionCarro)
    {
        return Inertia::render('comunes/old/distribucionCarros/edit', [
            'registro' => $oldDistribucionCarro,
            'placas' => OldDistribucionCarro::distinct()
                ->pluck('placa')
                ->filter()
                ->sort()
                ->values(),
        ]);
    }

    public function update(OldDistribucionCarroRequest $request, OldDistribucionCarro $oldDistribucionCarro)
    {
        $this->service->actualizar($oldDistribucionCarro, $request->validated());
        return redirect()->route('old-distribucion-carros.index')->with('success', 'Registro actualizado correctamente.');
    }

    public function destroy(OldDistribucionCarro $oldDistribucionCarro)
    {
        $oldDistribucionCarro->delete();
        return redirect()->route('old-distribucion-carros.index')->with('success', 'Registro eliminado.');
    }

    public function reporte(Request $request)
    {
        $query = OldDistribucionCarro::with('usuario')->orderBy('fecha', 'desc');

        if ($request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
            $query->whereBetween('fecha', [$request->fecha_inicio, $request->fecha_fin]);
        }

        return Inertia::render('comunes/old/distribucionCarros/reporte', [
            'registros' => $query->get(),
            'filters'   => $request->only(['fecha_inicio', 'fecha_fin']),
        ]);
    }
    public function pdf(Request $request)
    {
        try {
            $query = OldDistribucionCarro::with('usuario')->orderBy('fecha', 'asc');

            if ($request->filled('fecha_desde')) {
                $query->whereDate('fecha', '>=', $request->fecha_desde);
            }
            if ($request->filled('fecha_hasta')) {
                $query->whereDate('fecha', '<=', $request->fecha_hasta);
            }

            $registros = $query->get();

            // Recolectar usuarios involucrados (inspectores/responsables)
            $usuariosMap = [];
            foreach ($registros as $reg) {
                if ($reg->usuario) {
                    $codigo = $reg->usuario->codigo ?? 'S/C';
                    $clave = $codigo !== 'S/C' ? $codigo : 'user_' . $reg->usuario->id;
                    if (!isset($usuariosMap[$clave])) {
                        $usuariosMap[$clave] = [
                            'codigo' => $codigo,
                            'nombre' => trim(($reg->usuario->name ?? '') . ' ' . ($reg->usuario->apellido ?? '')),
                        ];
                    }
                }
            }

            // Preparar datos para el PDF
            $datosPdf = $registros->map(function ($reg) {
                return [
                    'id' => $reg->id,
                    'fecha' => $reg->fecha,
                    'destino' => $reg->destino ?? '-',
                    'placa' => $reg->placa ?? '-',
                    'set_temperatura' => $reg->set_temperatura,
                    'paredes_externas' => (bool) $reg->paredes_externas,
                    'limpieza_interno' => (bool) $reg->limpieza_interno,
                    'ausencia_objetos_olores' => (bool) $reg->ausencia_objetos_olores,
                    'bph_chofer' => (bool) $reg->bph_chofer,
                    'bph_ayudante' => (bool) $reg->bph_ayudante,
                    'observaciones' => $reg->observaciones ?? '-',
                    'correciones' => $reg->correciones ?? '-',
                    'usuario' => trim(($reg->usuario?->name ?? '') . ' ' . ($reg->usuario?->apellido ?? '')),
                    'codigo_usuario' => $reg->usuario?->codigo ?? '',
                ];
            });

            return response()->json([
                'registros' => $datosPdf,
                'usuarios_involucrados' => array_values($usuariosMap),
                'filtros' => [
                    'fecha_desde' => $request->fecha_desde,
                    'fecha_hasta' => $request->fecha_hasta,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error en PDF distribución carros: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
