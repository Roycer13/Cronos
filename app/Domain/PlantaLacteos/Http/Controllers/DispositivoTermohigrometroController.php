<?php
namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\PlantaLacteos\Models\DispositivoTermohigrometro;
use App\Domain\PlantaLacteos\Http\Requests\DispositivoTermohigrometroRequest;
use App\Domain\PlantaLacteos\Services\DispositivoTermohigrometroService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Domain\PlantaLacteos\Models\DispositivoMedicion;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Carbon\Carbon;

class DispositivoTermohigrometroController extends Controller
{
    protected DispositivoTermohigrometroService $service;

    public function __construct(DispositivoTermohigrometroService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        // Este método normalmente no se usa porque se integra en VerificacionDispositivoController
        // pero lo dejamos por si se necesita
    }

    public function create()
    {
        return Inertia::render('planta_lacteos/dispositivos_medicion/dispositivos_termohigrometros/crear', [
            'dispositivos' => DispositivoMedicion::where('dispositivo', 'Termohigrómetro')->where('baja', '-')->get(),
            'estados' => Estado::whereIn('nombre', ['Verificado', 'Observado'])->get(),
            'server_now' => now()->format('Y-m-d\TH:i'),
        ]);
    }

    public function store(DispositivoTermohigrometroRequest $request)
    {
        try {
            $data = $request->validated();
            $this->service->crear($data);

            return redirect()->route('verificaciones-dispositivos.index', ['tipo' => 'termohigrometros'])
                ->with('success', 'Registro de termohigrómetro creado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Error al crear el registro: ' . $e->getMessage()]);
        }
    }

    public function edit($id)
    {
        try {
            $termohigrometro = DispositivoTermohigrometro::findOrFail($id);
            $termohigrometro->load(['dispositivoMedicion', 'usuario', 'estado']);

            return Inertia::render('planta_lacteos/dispositivos_medicion/dispositivos_termohigrometros/editar', [
                'termohigrometro' => $termohigrometro,
                'dispositivos' => DispositivoMedicion::where('dispositivo', 'Termohigrómetro')->where('baja', '-')->get(),
                'estados' => Estado::whereIn('nombre', ['Verificado', 'Observado'])->get(),
                'server_now' => now()->format('Y-m-d\TH:i'),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Error al cargar el formulario: ' . $e->getMessage()
            ]);
        }
    }

    public function update(DispositivoTermohigrometroRequest $request, $id)
    {
        try {
            $termohigrometro = DispositivoTermohigrometro::findOrFail($id);
            $data = $request->validated();
            $this->service->actualizar($termohigrometro, $data);

            return redirect()->route('verificaciones-dispositivos.index', ['tipo' => 'termohigrometros'])
                ->with('success', 'Registro actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Error al actualizar el registro: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        try {
            $termohigrometro = DispositivoTermohigrometro::findOrFail($id);
            $this->service->eliminar($termohigrometro);

            return redirect()->route('verificaciones-dispositivos.index', ['tipo' => 'termohigrometros'])
                ->with('success', 'Registro eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Error al eliminar el registro: ' . $e->getMessage()]);
        }
    }

    public function pdf(Request $request)
    {
        try {
            $query = DispositivoTermohigrometro::with(['dispositivoMedicion', 'usuario', 'estado']);

            if ($request->filled('fecha_desde')) {
                $fechaDesde = Carbon::parse($request->fecha_desde)->startOfDay();
                $query->where('fecha_hora', '>=', $fechaDesde);
            }
            if ($request->filled('fecha_hasta')) {
                $fechaHasta = Carbon::parse($request->fecha_hasta)->endOfDay();
                $query->where('fecha_hora', '<=', $fechaHasta);
            }

            $registros = $query->orderBy('fecha_hora')->get();

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

            return response()->json([
                'registros' => $registros,
                'usuarios_involucrados' => array_values($usuariosMap),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error en pdf termohigrometros: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}