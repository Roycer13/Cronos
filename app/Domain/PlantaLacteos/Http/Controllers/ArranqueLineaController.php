<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Domain\PlantaLacteos\Http\Requests\ArranqueLineaRequest;
use App\Domain\PlantaLacteos\Models\ArranqueLinea;
use App\Domain\PlantaLacteos\Models\Origen;
use App\Domain\ModulosComunes\Orp\Models\Orp;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ArranqueLineaController extends Controller
{
    private const ORIGENES_PERMITIDOS = [
        'ENVASADORA UHT',
        'ENVASADORA CD',
        'ENVASADORA JK',
    ];

    public function index(Request $request): Response
    {
        $ultimoArranque = ArranqueLinea::with('estado')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->first();
        $cipActivo = ArranqueLinea::query()
            ->whereNotNull('CIP')
            ->whereHas('estado', fn ($query) => $query->where('nombre', '!=', 'Completado'))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->first();

        $arranques = ArranqueLinea::with(['estado', 'usuario', 'detalles.origen', 'orps.orp.productoTerminado.destino', 'detallesOp'])
            ->when($request->filled('fecha'), fn ($query) => $query->whereDate('tiempo', $request->string('fecha')))
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');
                $query->whereHas('orps.orp', fn ($orp) => $orp->where('codigo', 'like', "%{$search}%"));
            })
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate((int) $request->get('per_page', 10))
            ->withQueryString();

        return Inertia::render('planta_lacteos/arranquesLinea/index', [
            'arranques' => $arranques,
            'origenes' => $this->origenesPermitidos()->values(),
            'filters' => $request->only(['search', 'fecha', 'per_page']),
            'ultimoArranqueId' => $ultimoArranque?->id,
            'cipActivoId' => $cipActivo?->id,
            'puedeCrearArranque' => $this->puedeCrearArranque(),
        ]);
    }

    public function create(): Response
    {
        if (!$this->puedeCrearArranque()) {
            abort(403, 'No se puede crear un arranque mientras haya un CIP activo.');
        }

        return Inertia::render('planta_lacteos/arranquesLinea/crear', [
            'origenes' => $this->origenesPermitidos()->values(),
            'orps' => $this->orpsDisponibles(),
            'fecha' => now()->toDateString(),
            'arranque' => null,
            'numero' => 1,
        ]);
    }

    public function createDetalles(ArranqueLinea $arranqueLinea): Response
    {
        abort_if($arranqueLinea->CIP !== null, 422, 'Los arranques CIP no admiten detalles adicionales.');

        return Inertia::render('planta_lacteos/arranquesLinea/crear-detalles', [
            'origenes' => $this->origenesPermitidos()->values(),
            'fecha' => $arranqueLinea->tiempo->toDateString(),
            'arranque' => $arranqueLinea,
            'numero' => ((int) $arranqueLinea->detalles()->max('numero')) + 1,
        ]);
    }

    public function editDetalles(ArranqueLinea $arranqueLinea, int $numero): Response
    {
        abort_if($arranqueLinea->CIP !== null, 422, 'Los arranques CIP no se pueden editar desde este módulo.');

        $detalles = $arranqueLinea->detalles()
            ->where('numero', $numero)
            ->get()
            ->map(function ($detalle) {
                $tiempo = $detalle->getRawOriginal('tiempo');

                return [
                    'origen_id' => (int) $detalle->origen_id,
                    'tiempo' => $tiempo ? str_replace(' ', 'T', substr((string) $tiempo, 0, 16)) : null,
                    'h202' => (bool) $detalle->h202,
                ];
            });

        abort_if($detalles->isEmpty(), 404, 'La tanda solicitada no existe.');

        return Inertia::render('planta_lacteos/arranquesLinea/editar-detalles', [
            'arranque' => [
                'id' => $arranqueLinea->id,
                'detalles' => $detalles,
            ],
            'origenes' => $this->origenesPermitidos()->values(),
            'numero' => $numero,
        ]);
    }

    public function edit(ArranqueLinea $arranqueLinea): Response
    {
        abort_if($arranqueLinea->CIP !== null, 422, 'Los arranques CIP no se pueden editar desde este módulo.');

        $ultimoNumero = (int) $arranqueLinea->detalles()->max('numero') ?: 1;
        $arranqueLinea->load(['detalles' => fn ($query) => $query->where('numero', $ultimoNumero)->with('origen'), 'orps.orp', 'detallesOp']);

        return Inertia::render('planta_lacteos/arranquesLinea/editar', [
            'arranque' => $arranqueLinea,
            'origenes' => $this->origenesPermitidos()->values(),
            'orps' => $this->orpsDisponibles(),
            'ops' => $arranqueLinea->detallesOp,
        ]);
    }

    public function store(ArranqueLineaRequest $request): RedirectResponse
    {
        if (!$this->puedeCrearArranque()) {
            abort(403, 'No se puede crear un arranque mientras haya un CIP activo.');
        }

        $user = $request->user();
        $estadoPendiente = Estado::where('nombre', 'Pendiente')->firstOrFail();
        $origenesPermitidos = $this->origenesPermitidos()->keyBy('id');

        $detalles = $this->normalizarDetalles($request->validated('detalles', []), $origenesPermitidos, 1);

        DB::transaction(function () use ($request, $user, $estadoPendiente, $detalles) {
            $tiempo = Carbon::createFromFormat('Y-m-d', $request->validated('tiempo'))->startOfDay();

            $arranque = ArranqueLinea::create([
                'tiempo' => $tiempo,
                'estado_id' => $estadoPendiente->id,
                'user_id' => $user->id,
                'observacion' => $request->validated('observacion'),
            ]);

            $arranque->detalles()->createMany($detalles->all());

            $arranque->orps()->createMany(collect($request->validated('orps', []))->map(fn (int $orpId) => [
                'orp_id' => $orpId,
            ])->all());
            $arranque->detallesOp()->createMany($this->normalizarOps($request->validated('ops', []))->all());
        });

        return redirect()->route('arranques-linea.index')->with('success', 'Arranque de línea creado correctamente.');
    }

    public function storeDetalles(Request $request, ArranqueLinea $arranqueLinea): RedirectResponse
    {
        abort_if($arranqueLinea->CIP !== null, 422, 'Los arranques CIP no admiten detalles adicionales.');

        $origenesPermitidos = $this->origenesPermitidos()->keyBy('id');
        $ahora = now();

        $numero = DB::transaction(function () use ($arranqueLinea, $origenesPermitidos, $ahora) {
            $arranqueBloqueado = ArranqueLinea::query()
                ->whereKey($arranqueLinea->id)
                ->lockForUpdate()
                ->firstOrFail();

            $numero = ((int) $arranqueBloqueado->detalles()->max('numero')) + 1;
            $detalles = $origenesPermitidos->map(fn ($origen) => [
                'origen_id' => $origen->id,
                'numero' => $numero,
                'inicio_final' => $numero === 1 ? 'INICIO' : null,
                'tiempo' => $ahora,
                'h202' => false,
            ])->values();

            $arranqueBloqueado->detalles()->createMany($detalles->all());

            return $numero;
        });

        return redirect()->route('arranques-linea.index')->with('success', "Tanda {$numero} creada con la hora actual.");
    }

    public function updateDetalles(Request $request, ArranqueLinea $arranqueLinea, int $numero): RedirectResponse
    {
        abort_if($arranqueLinea->CIP !== null, 422, 'Los arranques CIP no se pueden editar desde este módulo.');

        $validated = $request->validate([
            'detalles' => ['required', 'array', 'min:1'],
            'detalles.*.origen_id' => ['required', 'integer', 'distinct'],
            'detalles.*.tiempo' => ['nullable', 'date_format:Y-m-d\\TH:i'],
            'detalles.*.h202' => ['required', 'boolean'],
        ]);

        $origenesPermitidos = $this->origenesPermitidos()->keyBy('id');
        $origenesSolicitados = collect($validated['detalles'])->keyBy(fn (array $detalle) => (int) $detalle['origen_id']);
        abort_if($origenesSolicitados->keys()->diff($origenesPermitidos->keys())->isNotEmpty(), 422, 'Uno o más orígenes no están permitidos.');

        $detallesActuales = $arranqueLinea->detalles()->where('numero', $numero)->get()->keyBy('origen_id');

        $marcadorFinal = $detallesActuales->contains(fn ($detalle) => $detalle->inicio_final === 'FINAL');

        DB::transaction(function () use ($arranqueLinea, $numero, $origenesSolicitados, $detallesActuales, $marcadorFinal) {
            $arranqueLinea->detalles()
                ->where('numero', $numero)
                ->whereNotIn('origen_id', $origenesSolicitados->keys())
                ->delete();

            foreach ($origenesSolicitados as $origenId => $detalle) {
                $datos = [
                    'tiempo' => !empty($detalle['tiempo'])
                        ? Carbon::createFromFormat('Y-m-d\\TH:i', $detalle['tiempo'])
                        : null,
                    'h202' => $detalle['h202'],
                ];
                $modelo = $detallesActuales->get($origenId);

                if ($modelo) {
                    $modelo->update($datos);
                } else {
                    $arranqueLinea->detalles()->create($datos + [
                        'origen_id' => $origenId,
                        'numero' => $numero,
                        'inicio_final' => $marcadorFinal ? 'FINAL' : ($numero === 1 ? 'INICIO' : null),
                    ]);
                }
            }
        });

        return redirect()->route('arranques-linea.index')->with('success', "Orígenes, horas y H202 de la tanda {$numero} actualizados correctamente.");
    }

    public function destroyDetalles(ArranqueLinea $arranqueLinea, int $numero): RedirectResponse
    {
        $ultimoNumero = (int) $arranqueLinea->detalles()->max('numero');
        abort_if($ultimoNumero === 0 || $numero !== $ultimoNumero, 422, 'Solo se puede eliminar la última tanda.');

        $detalles = $arranqueLinea->detalles()->where('numero', $numero);
        $eraFinal = (clone $detalles)->where('inicio_final', 'FINAL')->exists();
        $hayOtrosDetalles = $arranqueLinea->detalles()->where('numero', '!=', $numero)->exists();

        DB::transaction(function () use ($arranqueLinea, $numero, $detalles, $eraFinal, $hayOtrosDetalles) {
            $arranqueLinea->detalles()->where('numero', $numero)->delete();

            if (!$hayOtrosDetalles) {
                $arranqueLinea->detallesOp()->delete();
                $arranqueLinea->orps()->delete();
                $arranqueLinea->delete();

                return;
            }

            if ($eraFinal) {
                $estadoPendiente = Estado::where('nombre', 'Pendiente')->firstOrFail();
                $arranqueLinea->update(['estado_id' => $estadoPendiente->id]);
            }
        });

        $mensaje = !$hayOtrosDetalles
            ? 'Tanda inicial y arranque eliminados correctamente.'
            : "Tanda {$numero} eliminada correctamente.";

        return redirect()->route('arranques-linea.index')->with('success', $mensaje);
    }

    public function update(ArranqueLineaRequest $request, ArranqueLinea $arranqueLinea): RedirectResponse
    {
        abort_if($arranqueLinea->CIP !== null, 422, 'Los arranques CIP no se pueden editar desde este módulo.');

        $origenesPermitidos = $this->origenesPermitidos()->keyBy('id');
        $numero = (int) $arranqueLinea->detalles()->max('numero') ?: 1;
        $horasActuales = $arranqueLinea->detalles()->where('numero', $numero)->pluck('tiempo', 'origen_id');
        $detallesSolicitados = $request->validated('detalles', []);
        $origenesSeleccionados = collect($detallesSolicitados)
            ->pluck('origen_id')
            ->map(fn ($origenId) => (int) $origenId)
            ->all();
        $detalles = $this->normalizarDetalles($detallesSolicitados, $origenesPermitidos, $numero)
            ->filter(fn (array $detalle) => in_array((int) $detalle['origen_id'], $origenesSeleccionados, true))
            ->values();
        $detalles = $detalles->map(function (array $detalle) use ($horasActuales) {
            $detalle['tiempo'] = $horasActuales->get($detalle['origen_id']);
            return $detalle;
        });

        DB::transaction(function () use ($request, $arranqueLinea, $detalles, $numero) {
            $arranqueLinea->update([
                'tiempo' => Carbon::createFromFormat('Y-m-d', $request->validated('tiempo'))->startOfDay(),
                'observacion' => $request->validated('observacion'),
            ]);
            $arranqueLinea->detalles()->where('numero', $numero)->delete();
            $arranqueLinea->orps()->delete();
            $arranqueLinea->detalles()->createMany($detalles->all());
            $arranqueLinea->orps()->createMany(collect($request->validated('orps', []))->map(fn (int $orpId) => [
                'orp_id' => $orpId,
            ])->all());
            $arranqueLinea->detallesOp()->delete();
            $arranqueLinea->detallesOp()->createMany($this->normalizarOps($request->validated('ops', []))->all());
        });

        return redirect()->route('arranques-linea.index')->with('success', 'Arranque de línea actualizado correctamente.');
    }

    public function marcarFinal(ArranqueLinea $arranqueLinea): RedirectResponse
    {
        abort_if($arranqueLinea->CIP !== null, 422, 'Los arranques CIP se terminan con su acción específica.');
        abort_if($arranqueLinea->estado()->where('nombre', 'Completado')->exists(), 422, 'El arranque ya está completado.');

        $estadoCompletado = Estado::where('nombre', 'Completado')->firstOrFail();
        $ultimoNumero = $arranqueLinea->detalles()->max('numero');

        abort_if($ultimoNumero === null, 422, 'El arranque no tiene detalles para finalizar.');

        DB::transaction(function () use ($arranqueLinea, $estadoCompletado, $ultimoNumero) {
            $arranqueLinea->detalles()
                ->where('numero', $ultimoNumero)
                ->update(['inicio_final' => 'FINAL']);
            $arranqueLinea->update(['estado_id' => $estadoCompletado->id]);
        });

        return redirect()->route('arranques-linea.index')->with('success', 'Arranque de línea marcado como final.');
    }

    public function storeCip(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'CIP' => ['required', 'string', 'in:CIP Intermedio,CIP Final'],
        ]);

        abort_unless($this->puedeCrearArranque(), 403, 'Debe completarse el arranque actual antes de iniciar un CIP.');

        $user = $request->user();
        $estadoPendiente = Estado::where('nombre', 'Pendiente')->firstOrFail();
        $ahora = now();
        $origenesPermitidos = $this->origenesPermitidos()->keyBy('id');

        DB::transaction(function () use ($validated, $user, $estadoPendiente, $ahora, $origenesPermitidos) {
            $arranque = ArranqueLinea::create([
                'tiempo' => $ahora,
                'estado_id' => $estadoPendiente->id,
                'user_id' => $user->id,
                'CIP' => $validated['CIP'],
            ]);

            $arranque->detalles()->createMany($origenesPermitidos->map(fn ($origen) => [
                'origen_id' => $origen->id,
                'numero' => 1,
                'inicio_final' => 'INICIO',
                'tiempo' => $ahora,
                'h202' => false,
            ])->values()->all());
        });

        return redirect()->route('arranques-linea.index')->with('success', 'CIP iniciado correctamente.');
    }

    public function terminarCip(ArranqueLinea $arranqueLinea): RedirectResponse
    {
        abort_if($arranqueLinea->CIP === null, 422, 'El arranque seleccionado no es un CIP.');

        $cipActivo = ArranqueLinea::query()
            ->whereNotNull('CIP')
            ->whereHas('estado', fn ($query) => $query->where('nombre', '!=', 'Completado'))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->first();

        abort_unless($cipActivo?->is($arranqueLinea), 422, 'Solo se puede terminar el CIP activo.');

        $estadoCompletado = Estado::where('nombre', 'Completado')->firstOrFail();
        $ahora = now();
        $origenesPermitidos = $this->origenesPermitidos()->keyBy('id');
        $numero = ((int) $arranqueLinea->detalles()->max('numero')) + 1;

        DB::transaction(function () use ($arranqueLinea, $estadoCompletado, $ahora, $origenesPermitidos, $numero) {
            $arranqueLinea->detalles()->createMany($origenesPermitidos->map(fn ($origen) => [
                'origen_id' => $origen->id,
                'numero' => $numero,
                'inicio_final' => 'FINAL',
                'tiempo' => $ahora,
                'h202' => false,
            ])->values()->all());
            $arranqueLinea->update(['estado_id' => $estadoCompletado->id]);
        });

        return redirect()->route('arranques-linea.index')->with('success', 'CIP terminado correctamente.');
    }

    private function normalizarDetalles(array $detalles, $origenesPermitidos, int $numero)
    {
        $porOrigen = collect($detalles)
            ->filter(fn (array $detalle) => $origenesPermitidos->has((int) $detalle['origen_id']))
            ->keyBy(fn (array $detalle) => (int) $detalle['origen_id']);

        return $origenesPermitidos->map(function ($origen) use ($porOrigen, $numero) {
            $detalle = $porOrigen->get($origen->id);

            return [
                'origen_id' => $origen->id,
                'numero' => $numero,
                'inicio_final' => $numero === 1 ? 'INICIO' : null,
                'tiempo' => !empty($detalle['tiempo'] ?? null)
                    ? Carbon::createFromFormat('Y-m-d\\TH:i', $detalle['tiempo'])
                    : null,
                'h202' => (bool) ($detalle['h202'] ?? false),
            ];
        })->values();
    }

    private function normalizarOps(array $ops)
    {
        return collect($ops)
            ->map(fn (array $op) => [
                'numero' => trim((string) ($op['numero'] ?? '')),
                'tipo' => trim((string) ($op['tipo'] ?? '')),
            ])
            ->filter(fn (array $op) => $op['numero'] !== '' || $op['tipo'] !== '')
            ->values();
    }

    private function origenesPermitidos()
    {
        return Origen::query()
            ->select(['id', 'alias', 'descripcion'])
            ->whereIn('descripcion', self::ORIGENES_PERMITIDOS)
            ->orderByRaw("CASE descripcion WHEN 'ENVASADORA UHT' THEN 1 WHEN 'ENVASADORA CD' THEN 2 WHEN 'ENVASADORA JK' THEN 3 ELSE 4 END")
            ->get();
    }

    private function puedeCrearArranque(): bool
    {
        return !ArranqueLinea::query()
            ->whereNotNull('CIP')
            ->whereHas('estado', fn ($query) => $query->where('nombre', '!=', 'Completado'))
            ->exists();
    }

    private function orpsDisponibles()
    {
        $query = Orp::query()
            ->select(['id', 'codigo', 'lote', 'producto_terminado_id', 'ubicacion_id'])
            ->with('productoTerminado:id,nombre_sap')
            ->whereHas('productoTerminado.linea', fn ($linea) => $linea->where('nombre', 'UHT'))
            ->whereHas('ultimoEstado.estado', fn ($estado) => $estado->where('nombre', 'En Proceso'));

        if (!auth()->user()?->hasRole('admin') && auth()->user()?->ubicacion_id) {
            $query->where('ubicacion_id', auth()->user()->ubicacion_id);
        }

        return $query->orderByDesc('fecha_creacion')->limit(500)->get();
    }
}
