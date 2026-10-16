<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use Carbon\Carbon;
use App\Domain\PlantaLacteos\Models\DetalleAcrilico;
use App\Domain\PlantaLacteos\Models\SeguimientoAcrilico;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcrilicoController extends Controller
{
    public function index(Request $request)
    {
        $seguimientos = SeguimientoAcrilico::with(['detalleAcrilico', 'user'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where(function ($query) use ($search) {
                    $query->where('codigo', 'like', "%{$search}%")
                        ->orWhere('area', 'like', "%{$search}%")
                        ->orWhere('observaciones', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($query) => $query->where('name', 'like', "%{$search}%")->orWhere('apellido', 'like', "%{$search}%"))
                        ->orWhereHas('detalleAcrilico', fn ($query) => $query->where('frecuencia', 'like', "%{$search}%"));
                });
            })
            ->when($request->filled('codigo'), fn ($query) => $query->where('codigo', 'like', '%' . $request->codigo . '%'))
            ->when($request->filled('area'), fn ($query) => $query->where('area', 'like', '%' . $request->area . '%'))
            ->when($request->filled('frecuencia'), fn ($query) => $query->whereHas('detalleAcrilico', fn ($query) => $query->where('frecuencia', $request->frecuencia)))
            ->when($request->filled('usuario'), function ($query) use ($request) {
                $usuario = $request->string('usuario')->toString();
                $query->whereHas('user', fn ($query) => $query->where('name', 'like', "%{$usuario}%")->orWhere('apellido', 'like', "%{$usuario}%"));
            })
            ->when($request->filled('fecha_desde'), fn ($query) => $query->whereDate('tiempo', '>=', $request->fecha_desde))
            ->when($request->filled('fecha_hasta'), fn ($query) => $query->whereDate('tiempo', '<=', $request->fecha_hasta))
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('planta_lacteos/acrilicos/index', [
            'seguimientos' => $seguimientos,
            'filters' => $request->only(['search', 'codigo', 'area', 'frecuencia', 'usuario', 'fecha_desde', 'fecha_hasta', 'per_page']),
            'flash' => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function pdf(Request $request)
    {
        $validated = $request->validate([
            'mes' => ['required', 'date_format:Y-m'],
        ]);

        $inicio = Carbon::createFromFormat('Y-m', $validated['mes'])->startOfMonth();
        $fin = $inicio->copy()->endOfMonth();

        $seguimientos = SeguimientoAcrilico::with(['detalleAcrilico', 'user'])
            ->whereBetween('tiempo', [$inicio, $fin])
            ->whereHas('detalleAcrilico', function ($query) {
                $query->whereIn('frecuencia', ['quincenal', 'mensual']);
            })
            ->orderBy('tiempo')
            ->get();

        $usuariosInvolucrados = $seguimientos
            ->filter(fn ($seguimiento) => $seguimiento->user)
            ->mapWithKeys(fn ($seguimiento) => [
                $seguimiento->user->id => [
                    'codigo' => $seguimiento->user->codigo,
                    'nombre' => trim(($seguimiento->user->name ?? '') . ' ' . ($seguimiento->user->apellido ?? '')),
                ],
            ])
            ->values()
            ->all();

        $filas = $seguimientos
            ->groupBy('detalle_acrilico_id')
            ->map(function ($revisiones) {
                $detalle = $revisiones->first()->detalleAcrilico;
                $usuario = $revisiones->first()->user;

                return [
                    'detalle_acrilico_id' => $detalle?->id,
                    'codigo' => $detalle?->codigo ?? $revisiones->first()->codigo,
                    'area' => $detalle?->area ?? $revisiones->first()->area,
                    'cantidad_vidrios' => $detalle?->cantidad_vidrios ?? $revisiones->first()->cantidad_vidrios,
                    'cantidad_luminarias' => $detalle?->cantidad_luminarias ?? $revisiones->first()->cantidad_luminarias,
                    'usuario' => $usuario ? trim(($usuario->name ?? '') . ' ' . ($usuario->apellido ?? '')) : null,
                    'frecuencia' => strtolower(trim((string) ($detalle?->frecuencia ?? ''))),
                    'revisiones' => $revisiones->sortBy('tiempo')->take(2)->values()->map(fn ($revision) => [
                        'fecha' => $revision->tiempo,
                        'integridad_vidrios' => $revision->integridad_vidrios,
                        'integridad_luminarias' => $revision->integridad_luminarias,
                        'informado' => $revision->informado,
                        'observaciones' => $revision->observaciones,
                    ])->all(),
                ];
            })
            ->values();

        return response()->json([
            'mes' => $inicio->translatedFormat('F Y'),
            'quincenal' => $filas->where('frecuencia', 'quincenal')->values()->all(),
            'mensual' => $filas->where('frecuencia', 'mensual')->map(function ($fila) {
                $fila['revisiones'] = array_slice($fila['revisiones'], 0, 1);

                return $fila;
            })->values()->all(),
            'usuarios_involucrados' => $usuariosInvolucrados,
        ]);
    }

    public function create(string $frecuencia = 'quincenal')
    {
        $frecuenciaNormalizada = $this->normalizarFrecuencia($frecuencia);
        $acrilicos = DetalleAcrilico::query()
            ->where('vigencia', 'Vigente')
            ->whereRaw('LOWER(frecuencia) = ?', [$frecuenciaNormalizada])
            ->orderBy('area')
            ->orderBy('codigo')
            ->get()
            ->map(function ($acrilico) {
                return [
                    'id' => $acrilico->id,
                    'codigo' => $acrilico->codigo,
                    'area' => $acrilico->area,
                    'cantidad_vidrios' => $acrilico->cantidad_vidrios,
                    'cantidad_luminarias' => $acrilico->cantidad_luminarias,
                    'frecuencia' => $acrilico->frecuencia,
                    'integridad_vidrios' => true,
                    'integridad_luminarias' => true,
                    'informado' => false,
                    'observaciones' => '',
                ];
            });

        return Inertia::render('planta_lacteos/acrilicos/crear', [
            'frecuencia' => $frecuenciaNormalizada,
            'acrilicos' => $acrilicos,
        ]);
    }

    public function store(Request $request, string $frecuencia = 'quincenal')
    {
        $frecuenciaNormalizada = $this->normalizarFrecuencia($frecuencia);
        $validated = $request->validate([
            'tiempo' => ['required', 'date_format:Y-m-d\\TH:i'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.detalle_acrilico_id' => ['required', 'integer', 'exists:PLL_detalle_acrilicos,id'],
            'items.*.integridad_vidrios' => ['nullable', 'boolean'],
            'items.*.integridad_luminarias' => ['nullable', 'boolean'],
            'items.*.informado' => ['nullable', 'boolean'],
            'items.*.observaciones' => ['nullable', 'string', 'max:1000'],
        ]);

        $creados = 0;
        foreach ($validated['items'] as $item) {
            $detalle = DetalleAcrilico::find($item['detalle_acrilico_id']);
            if (!$detalle || strtolower((string) $detalle->vigencia) !== 'vigente' || strtolower((string) $detalle->frecuencia) !== $frecuenciaNormalizada) {
                continue;
            }

            SeguimientoAcrilico::create([
                'detalle_acrilico_id' => $detalle->id,
                'integridad_vidrios' => $item['integridad_vidrios'] ?? true,
                'integridad_luminarias' => $item['integridad_luminarias'] ?? true,
                'observaciones' => $item['observaciones'] ?? null,
                'informado' => $item['informado'] ?? false,
                'user_id' => auth()->id(),
                'tiempo' => $validated['tiempo'],
                'codigo' => $detalle->codigo,
                'area' => $detalle->area,
                'cantidad_vidrios' => $detalle->cantidad_vidrios,
                'cantidad_luminarias' => $detalle->cantidad_luminarias,
            ]);
            $creados++;
        }

        return redirect()->route('acrilicos.index')->with('success', 'Se crearon ' . $creados . ' revisiones de acrílicos para la frecuencia ' . ucfirst($frecuenciaNormalizada) . '.');
    }

    private function normalizarFrecuencia(string $frecuencia): string
    {
        return match (strtolower(trim($frecuencia))) {
            'mensual', 'mensuales', 'mensualmente' => 'mensual',
            default => 'quincenal',
        };
    }
}
