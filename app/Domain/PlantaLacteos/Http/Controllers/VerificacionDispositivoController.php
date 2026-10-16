<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\DispositivoRefractometro;
use App\Domain\PlantaLacteos\Models\DispositivoPhmetro;
use App\Domain\PlantaLacteos\Models\DispositivoTemperatura;
use App\Domain\PlantaLacteos\Models\DispositivoCrioscopo;
use App\Domain\PlantaLacteos\Models\DispositivoTermohigrometro; // 👈 NUEVO
use App\Domain\PlantaLacteos\Models\DispositivoMedicion;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VerificacionDispositivoController extends Controller
{
    public function index(Request $request)
    {
        try {
            $tipo = $request->input('tipo', 'refractometros');
            $perPage = $request->input('per_page', 30);

            // Inicializar variables con paginación vacía
            $refractometros = $this->emptyPagination();
            $phmetros = $this->emptyPagination();
            $temperaturas = $this->emptyPagination();
            $crioscopos = $this->emptyPagination();
            $termohigrometros = $this->emptyPagination(); // 👈 NUEVO

            switch ($tipo) {
                case 'phmetros':
                    $query = $this->applyCommonFilters(DispositivoPhmetro::query(), $request);
                    $query = $this->applyPhmetroFilters($query, $request);
                    $phmetros = $this->formatPagination(
                        $query->with(['dispositivoMedicion', 'usuario', 'estado'])
                            ->orderBy('fecha_hora', 'desc')
                            ->paginate($perPage)
                    );
                    break;

                case 'temperaturas':
                    $query = $this->applyCommonFilters(DispositivoTemperatura::query(), $request);
                    $query = $this->applyTemperaturaFilters($query, $request);
                    $temperaturas = $this->formatPagination(
                        $query->with(['dispositivoMedicion', 'usuario', 'estado'])
                            ->orderBy('fecha_hora', 'desc')
                            ->paginate($perPage)
                    );
                    break;

                case 'crioscopos':
                    $query = $this->applyCommonFilters(DispositivoCrioscopo::query(), $request);
                    $query = $this->applyCrioscopoFilters($query, $request);
                    $crioscopos = $this->formatPagination(
                        $query->with(['dispositivoMedicion', 'usuario', 'estado'])
                            ->orderBy('fecha_hora', 'desc')
                            ->paginate($perPage)
                    );
                    break;

                case 'termohigrometros':
                    $query = $this->applyCommonFilters(DispositivoTermohigrometro::query(), $request);
                    $query = $this->applyTermohigrometroFilters($query, $request);
                    $termohigrometros = $this->formatPagination(
                        $query->with(['dispositivoMedicion', 'usuario', 'estado'])
                            ->orderBy('fecha_hora', 'desc')
                            ->paginate($perPage)
                    );
                    break;

                default: // refractometros
                    $query = $this->applyCommonFilters(DispositivoRefractometro::query(), $request);
                    $query = $this->applyRefractometroFilters($query, $request);
                    $refractometros = $this->formatPagination(
                        $query->with(['dispositivoMedicion', 'usuario', 'estado'])
                            ->orderBy('fecha_hora', 'desc')
                            ->paginate($perPage)
                    );
            }

            // Totales para las pestañas (sin filtros)
            $totales = [
                'refractometros' => DispositivoRefractometro::count(),
                'phmetros' => DispositivoPhmetro::count(),
                'temperaturas' => DispositivoTemperatura::count(),
                'crioscopos' => DispositivoCrioscopo::count(),
                'termohigrometros' => DispositivoTermohigrometro::count(), // 👈 NUEVO
            ];

            return Inertia::render('planta_lacteos/dispositivos_medicion/index', [
                'dispositivosRefractometros' => $refractometros,
                'dispositivosPhmetros' => $phmetros,
                'dispositivosTemperaturas' => $temperaturas,
                'dispositivosCrioscopos' => $crioscopos,
                'dispositivosTermohigrometros' => $termohigrometros, // 👈 NUEVO
                'totales' => $totales,
                'filters' => $request->only([
                    'fecha_inicio',
                    'fecha_fin',
                    'dispositivos_medicion_id',
                    'estado_id',
                    'user_id',
                    'per_page'
                ]),
                'dispositivos' => DispositivoMedicion::where('baja', false)->get(),
                'estados' => Estado::all(),
                'usuarios' => User::all(),
                'current_tipo' => $tipo,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error en VerificacionDispositivoController@index: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->withErrors(['error' => 'Error al cargar los registros: ' . $e->getMessage()]);
        }
    }

    private function applyCommonFilters($query, Request $request)
    {
        return $query->when($request->filled('fecha_inicio'), function ($q) use ($request) {
            $q->where('fecha_hora', '>=', $request->fecha_inicio);
        })
            ->when($request->filled('fecha_fin'), function ($q) use ($request) {
                $q->where('fecha_hora', '<=', $request->fecha_fin);
            })
            ->when($request->filled('dispositivos_medicion_id'), function ($q) use ($request) {
                $q->where('dispositivos_medicion_id', $request->dispositivos_medicion_id);
            })
            ->when($request->filled('estado_id'), function ($q) use ($request) {
                $q->where('estado_id', $request->estado_id);
            })
            ->when($request->filled('user_id'), function ($q) use ($request) {
                $q->where('user_id', $request->user_id);
            });
    }

    private function applyRefractometroFilters($query, Request $request)
    {
        return $query->when($request->filled('requiere_ajuste'), function ($q) use ($request) {
            $q->where('requiere_ajuste', $request->requiere_ajuste);
        });
    }

    private function applyPhmetroFilters($query, Request $request)
    {
        return $query->when($request->filled('requiere_ajuste'), function ($q) use ($request) {
            $q->where('requiere_ajuste', $request->requiere_ajuste);
        });
    }

    private function applyTemperaturaFilters($query, Request $request)
    {
        return $query->when($request->filled('error_mayor_a'), function ($q) use ($request) {
            $q->where(function ($query) use ($request) {
                $query->where('error_1', '>', $request->error_mayor_a)
                    ->orWhere('error_2', '>', $request->error_mayor_a)
                    ->orWhere('error_3', '>', $request->error_mayor_a);
            });
        });
    }

    private function applyCrioscopoFilters($query, Request $request)
    {
        return $query->when($request->filled('punto_ajuste_a'), function ($q) use ($request) {
            $q->where('punto_ajuste_a', $request->punto_ajuste_a);
        })
            ->when($request->filled('punto_ajuste_b'), function ($q) use ($request) {
                $q->where('punto_ajuste_b', $request->punto_ajuste_b);
            });
    }

    // 👇 NUEVO: filtros específicos para termohigrómetros
    private function applyTermohigrometroFilters($query, Request $request)
    {
        return $query->when($request->filled('requiere_ajuste'), function ($q) use ($request) {
            $q->where('requiere_ajuste', $request->requiere_ajuste);
        });
    }

    private function formatPagination($paginator)
    {
        return $paginator->toArray();
    }

    private function emptyPagination()
    {
        return [
            'data' => [],
            'links' => [],
            'current_page' => 1,
            'last_page' => 1,
            'per_page' => 30,
            'total' => 0,
        ];
    }
    public function cronogramaPdf()
    {
        $path = storage_path('app/public/PLL-PRO-212-CRG-001.pdf');
        if (!file_exists($path)) {
            abort(404, 'Guía no encontrada');
        }
        return response()->file($path);
    }
    public function pdf2025()
    {
        $path = storage_path('app/public/dispositivos-2025.pdf');
        if (!file_exists($path)) {
            abort(404, 'PDF 2025 no encontrado');
        }
        return response()->file($path);
    }

    public function pdf2026()
    {
        $path = storage_path('app/public/dispositivos-2026.pdf');
        if (!file_exists($path)) {
            abort(404, 'PDF 2026 no encontrado');
        }
        return response()->file($path);
    }
}
