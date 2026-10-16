<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Domain\PlantaLacteos\Models\TratamientoAguaResidual;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TratamientoAguaResidualController extends Controller
{
    public function index(Request $request)
    {
        $fecha = $request->get('fecha', now()->toDateString());

        // Registros del día actual
        $registros = TratamientoAguaResidual::whereDate('tiempo_analisis', $fecha)
            ->orderBy('tiempo_analisis')
            ->get();

        $mañana = $registros->where('turno', 'mañana')->values();
        $tarde = $registros->where('turno', 'tarde')->values();

        $existenRegistros = $registros->count() > 0;
        $completo = $mañana->count() === 3 && $tarde->count() === 3;

        $mañana = $mañana->map(function ($item) {
            $item->numero_registro = TratamientoAguaResidual::getNumeroRegistro($item->tiempo_analisis, 'mañana');
            return $item;
        });

        $tarde = $tarde->map(function ($item) {
            $item->numero_registro = TratamientoAguaResidual::getNumeroRegistro($item->tiempo_analisis, 'tarde');
            return $item;
        });

        // ✅ Históricos con paginación
        $filters = $request->only([
            'search',
            'turno',
            'usuario',
            'fecha_desde',
            'fecha_hasta',
            'per_page',
            'page',
        ]);

        $historicosQuery = TratamientoAguaResidual::with('user')
            ->whereDate('tiempo_analisis', '<', $fecha);

        // Aplicar filtros
        if ($request->filled('search')) {
            $search = $request->search;
            $historicosQuery->where(function ($q) use ($search) {
                $q->where('observaciones', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('apellido', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('turno')) {
            $historicosQuery->where('turno', $request->turno);
        }

        if ($request->filled('usuario')) {
            $historicosQuery->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->usuario}%");
            });
        }

        if ($request->filled('fecha_desde')) {
            $historicosQuery->whereDate('tiempo_analisis', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $historicosQuery->whereDate('tiempo_analisis', '<=', $request->fecha_hasta);
        }

        $perPage = $request->get('per_page', 10);
        $historicos = $historicosQuery
            ->orderBy('tiempo_analisis', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        // Agregar número de registro a cada item
        $historicos->getCollection()->transform(function ($item) {
            $item->numero_registro = TratamientoAguaResidual::getNumeroRegistro(
                $item->tiempo_analisis,
                $item->turno
            );
            return $item;
        });

        // Obtener lista de usuarios para filtros
        $usuarios = User::whereHas('tratamientoAguaResidual')
            ->orderBy('name')
            ->get(['id', 'name', 'apellido']);

        return Inertia::render('planta_lacteos/tratamiento_agua/index', [
            'fecha' => $fecha,
            'mañana' => $mañana,
            'tarde' => $tarde,
            'completo' => $completo,
            'existenRegistros' => $existenRegistros,
            'historicos' => $historicos,
            'usuarios' => $usuarios,
            'filters' => $filters,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function iniciarDia(Request $request)
    {
        $fecha = $request->get('fecha', now()->toDateString());

        $creado = TratamientoAguaResidual::crearRegistrosIniciales($fecha);

        if (!$creado) {
            return back()->with('error', 'Ya existen registros para esta fecha');
        }

        return back()->with('success', 'Registros del día creados exitosamente');
    }

    public function update(Request $request, TratamientoAguaResidual $registro)
    {
        $validated = $request->validate([
            'flujometro_aire' => 'nullable|numeric|min:0',
            'flujometro_agua' => 'nullable|numeric|min:0',
            't_nivel' => 'nullable|numeric|min:0',
            'reactor' => 'nullable|numeric|min:0',
            't_balanceo' => 'nullable|numeric|min:0',
            'purgado' => 'nullable|boolean',
            'observaciones' => 'nullable|string|max:500',
        ]);

        $registro->update([
            'flujometro_aire' => $validated['flujometro_aire'] ?? null,
            'flujometro_agua' => $validated['flujometro_agua'] ?? null,
            't_nivel' => $validated['t_nivel'] ?? null,
            'reactor' => $validated['reactor'] ?? null,
            't_balanceo' => $validated['t_balanceo'] ?? null,
            'purgado' => $validated['purgado'] ?? false,
            'observaciones' => $validated['observaciones'] ?? null,
            'user_id' => auth()->id(),
        ]);

        return back()->with('success', 'Registro actualizado correctamente');
    }

    public function destroy(TratamientoAguaResidual $registro)
    {
        $registro->delete();
        return back()->with('success', 'Registro eliminado correctamente');
    }

    public function pdf(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
        ]);

        $fecha = $request->fecha;

        $registros = TratamientoAguaResidual::with('user')
            ->whereDate('tiempo_analisis', $fecha)
            ->orderBy('tiempo_analisis')
            ->get();

        // Añadir numero_registro a cada item
        $registros->transform(function ($item) {
            $item->numero_registro = TratamientoAguaResidual::getNumeroRegistro($item->tiempo_analisis, $item->turno);
            return $item;
        });

        return response()->json(['registros' => $registros]);
    }
}
