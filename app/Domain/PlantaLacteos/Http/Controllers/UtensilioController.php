<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use Carbon\Carbon;
use App\Domain\PlantaLacteos\Models\DetalleUtensilio;
use App\Domain\PlantaLacteos\Models\SeguimientoUtensilio;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UtensilioController extends Controller
{
    public function index(Request $request)
    {
        $seguimientos = SeguimientoUtensilio::with(['detalleUtensilio', 'user', 'usuarioResponsable'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query->where('area', 'like', "%{$search}%")
                        ->orWhere('cargo', 'like', "%{$search}%")
                        ->orWhere('observaciones', 'like', "%{$search}%")
                        ->orWhereHas('detalleUtensilio', function ($query) use ($search) {
                            $query->where('nombre_utensilio', 'like', "%{$search}%")
                                ->orWhere('codigo', 'like', "%{$search}%")
                                ->orWhere('frecuencia', 'like', "%{$search}%");
                        })
                        ->orWhereHas('user', function ($query) use ($search) {
                            $query->where('name', 'like', "%{$search}%")
                                ->orWhere('apellido', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->filled('nombre_utensilio'), function ($query) use ($request) {
                $query->whereHas('detalleUtensilio', fn ($query) =>
                    $query->where('nombre_utensilio', 'like', '%' . $request->nombre_utensilio . '%'));
            })
            ->when($request->filled('area'), fn ($query) =>
                $query->where('area', 'like', '%' . $request->area . '%'))
            ->when($request->filled('cargo'), fn ($query) =>
                $query->where('cargo', 'like', '%' . $request->cargo . '%'))
            ->when($request->filled('codigo'), function ($query) use ($request) {
                $query->whereHas('detalleUtensilio', fn ($query) =>
                    $query->where('codigo', 'like', '%' . $request->codigo . '%'));
            })
            ->when($request->filled('frecuencia'), function ($query) use ($request) {
                $query->whereHas('detalleUtensilio', fn ($query) =>
                    $query->where('frecuencia', $request->frecuencia));
            })
            ->when($request->filled('usuario'), function ($query) use ($request) {
                $usuario = $request->string('usuario')->toString();

                $query->whereHas('user', fn ($query) =>
                    $query->where('name', 'like', "%{$usuario}%")
                        ->orWhere('apellido', 'like', "%{$usuario}%"));
            })
            ->when($request->filled('fecha_desde'), fn ($query) =>
                $query->whereDate('tiempo', '>=', $request->fecha_desde))
            ->when($request->filled('fecha_hasta'), fn ($query) =>
                $query->whereDate('tiempo', '<=', $request->fecha_hasta))
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('planta_lacteos/utensilios/index', [
            'seguimientos' => $seguimientos,
            'filters' => $request->only([
                'search', 'nombre_utensilio', 'area', 'cargo', 'codigo',
                'frecuencia', 'usuario', 'fecha_desde', 'fecha_hasta', 'per_page',
            ]),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function pdf(Request $request)
    {
        $validated = $request->validate([
            'mes' => ['required', 'date_format:Y-m'],
        ]);

        $inicio = Carbon::createFromFormat('Y-m', $validated['mes'])->startOfMonth();
        $fin = $inicio->copy()->endOfMonth();

        $seguimientos = SeguimientoUtensilio::with(['detalleUtensilio', 'user', 'usuarioResponsable'])
            ->whereBetween('tiempo', [$inicio, $fin])
            ->whereHas('detalleUtensilio', function ($query) {
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
            ->groupBy('detalle_utensilio_id')
            ->map(function ($revisiones) {
                $detalle = $revisiones->first()->detalleUtensilio;
                $usuario = $revisiones->first()->user;

                return [
                    'detalle_utensilio_id' => $detalle?->id,
                    'area' => $detalle?->area ?? $revisiones->first()->area,
                    'cargo' => $detalle?->cargo ?? $revisiones->first()->cargo,
                    'usuario' => $usuario ? trim(($usuario->name ?? '') . ' ' . ($usuario->apellido ?? '')) : null,
                    'responsable' => $revisiones->first()->usuarioResponsable
                        ? trim(($revisiones->first()->usuarioResponsable->name ?? '') . ' ' . ($revisiones->first()->usuarioResponsable->apellido ?? ''))
                        : null,
                    'utensilio' => $detalle?->nombre_utensilio,
                    'cantidad' => 1,
                    'codigo' => $detalle?->codigo,
                    'frecuencia' => strtolower(trim((string) $detalle?->frecuencia)),
                    'revisiones' => $revisiones->sortBy('tiempo')->take(2)->values()->map(fn ($revision) => [
                        'fecha' => $revision->tiempo,
                        'tiene_codigo' => $revision->tiene_codigo,
                        'buen_estado' => $revision->buen_estado,
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

    public function create(Request $request, string $frecuencia = 'quincenal')
    {
        $frecuenciaNormalizada = $this->normalizarFrecuencia($frecuencia);

        $utensilios = DetalleUtensilio::query()
            ->with('user')
            ->where('vigencia_utensilio', 'Vigente')
            ->whereRaw('LOWER(frecuencia) = ?', [strtolower($frecuenciaNormalizada)])
            ->orderBy('area')
            ->orderBy('cargo')
            ->get()
            ->map(function ($utensilio) {
                $usuario = $utensilio->user
                    ? trim(($utensilio->user->name ?? '') . ' ' . ($utensilio->user->apellido ?? ''))
                    : null;

                return [
                    'id' => $utensilio->id,
                    'nombre_utensilio' => $utensilio->nombre_utensilio,
                    'area' => $utensilio->area,
                    'cargo' => $utensilio->cargo,
                    'codigo' => $utensilio->codigo,
                    'frecuencia' => $utensilio->frecuencia,
                    'vigencia_utensilio' => $utensilio->vigencia_utensilio,
                    'usuario' => $usuario ?: null,
                    'tiene_codigo' => true,
                    'buen_estado' => true,
                    'observaciones' => '',
                ];
            });

        return Inertia::render('planta_lacteos/utensilios/crear', [
            'frecuencia' => $frecuenciaNormalizada,
            'utensilios' => $utensilios,
        ]);
    }

    public function store(Request $request, string $frecuencia = 'quincenal')
    {
        $frecuenciaNormalizada = $this->normalizarFrecuencia($frecuencia);

        $validated = $request->validate([
            'tiempo' => ['required', 'date_format:Y-m-d\\TH:i'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.detalle_utensilio_id' => ['required', 'integer', 'exists:PLL_detalle_utensilios,id'],
            'items.*.tiene_codigo' => ['nullable', 'boolean'],
            'items.*.buen_estado' => ['nullable', 'boolean'],
            'items.*.observaciones' => ['nullable', 'string', 'max:1000'],
        ]);

        $creados = 0;

        foreach ($validated['items'] as $item) {
            $detalle = DetalleUtensilio::find($item['detalle_utensilio_id']);

            if (!$detalle) {
                continue;
            }

            if (strtolower((string) $detalle->vigencia_utensilio) !== 'vigente') {
                continue;
            }

            if (strtolower((string) $detalle->frecuencia) !== $frecuenciaNormalizada) {
                continue;
            }

            SeguimientoUtensilio::create([
                'detalle_utensilio_id' => $detalle->id,
                'user_id' => auth()->id(),
                'responsable_id' => $detalle->user_id,
                'tiempo' => $validated['tiempo'],
                'cargo' => $detalle->cargo,
                'area' => $detalle->area,
                'tiene_codigo' => $item['tiene_codigo'] ?? true,
                'buen_estado' => $item['buen_estado'] ?? true,
                'observaciones' => $item['observaciones'] ?? null,
            ]);

            $creados++;
        }

        return redirect()->route('utensilios.index')
            ->with('success', 'Se crearon ' . $creados . ' revisiones de utensilios para la frecuencia ' . ucfirst($frecuenciaNormalizada) . '.');
    }

    private function normalizarFrecuencia(string $frecuencia): string
    {
        $valor = strtolower(trim($frecuencia));

        return match ($valor) {
            'quincenal', 'quincenales', 'quincenalmente' => 'quincenal',
            'mensual', 'mensuales', 'mensualmente' => 'mensual',
            default => 'quincenal',
        };
    }
}
