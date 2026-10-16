<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Domain\PlantaLacteos\Models\ControlFisicoQuimicoOrganoleptico;
use App\Domain\Sistema\Configuracion\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ControlFisicoQuimicoOrganolepticoController
{
     public function index(Request $request)
    {
        // Obtener filtros
        $filters = $request->only([
            'search',
            'user_id',
            'fecha_inicio',
            'fecha_fin',
            'per_page',
        ]);

        $query = ControlFisicoQuimicoOrganoleptico::with('usuario');

        // Aplicar filtros
        if (isset($filters['search']) && $filters['search']) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('observaciones', 'like', "%{$search}%")
                  ->orWhereHas('usuario', function($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('apellido', 'like', "%{$search}%");
                  });
            });
        }

        if (isset($filters['user_id']) && $filters['user_id']) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['fecha_inicio']) && $filters['fecha_inicio']) {
            $query->whereDate('tiempo', '>=', $filters['fecha_inicio']);
        }

        if (isset($filters['fecha_fin']) && $filters['fecha_fin']) {
            $query->whereDate('tiempo', '<=', $filters['fecha_fin']);
        }

        // Usar paginación en lugar de get()
        $perPage = $request->get('per_page', 10);
        $registros = $query->orderByDesc('tiempo')
            ->paginate($perPage)
            ->withQueryString();

        // Obtener usuarios para el filtro
        $usuarios = User::all();

        return Inertia::render('planta_lacteos/control_fisicoquimico_organoleptico/index', [
            'registros' => $registros,
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
        return Inertia::render('planta_lacteos/control_fisicoquimico_organoleptico/crear');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'tiempo' => ['required', 'date'],
            'ph_pozo' => ['nullable', 'numeric'],
            'dureza_pozo' => ['nullable', 'numeric'],
            'conductividad_pozo' => ['nullable', 'numeric'],
            'ph_etap' => ['nullable', 'numeric'],
            'dureza_etap' => ['nullable', 'numeric'],
            'cloruros_etap' => ['nullable', 'numeric'],
            'conductividad_etap' => ['nullable', 'numeric'],
            'color' => ['nullable', 'in:normal,ligero,medio,fuerte'],
            'olor' => ['nullable', 'in:normal,anormal'],
            'sabor' => ['nullable', 'in:normal,anormal'],
            'aspecto' => ['nullable', 'in:normal,anormal'],
            'color_etap' => ['nullable', 'in:normal,ligero,medio,fuerte'],
            'olor_etap' => ['nullable', 'in:normal,anormal'],
            'sabor_etap' => ['nullable', 'in:normal,anormal'],
            'aspecto_etap' => ['nullable', 'in:normal,anormal'],
            'observaciones' => ['nullable', 'string'],
        ]);

        // Parsear el tiempo, detectando el formato (ISO con T o base de datos con espacio)
        $tiempoStr = $data['tiempo'];
        if (strpos($tiempoStr, 'T') !== false) {
            // Formato ISO datetime-local: 2026-07-13T13:32
            $time = Carbon::createFromFormat('Y-m-d\TH:i', $tiempoStr, config('app.timezone'));
        } else {
            // Formato de base de datos: 2026-07-13 13:32:00 o 2026-07-13 13:32
            $normalizado = str_replace(['T'], ' ', $tiempoStr);
            $normalizado = substr($normalizado, 0, 16); // Tomar solo YYYY-MM-DD HH:MM
            $time = Carbon::createFromFormat('Y-m-d H:i', $normalizado, config('app.timezone'));
        }
        $data['tiempo'] = $time->format('Y-m-d H:i:s');
        $data['user_id'] = $request->user()?->id ?? Auth::id();

        ControlFisicoQuimicoOrganoleptico::create($data);

        return redirect()->route('control-fisicoquimico-organoleptico.index')
            ->with('success', 'Registro creado correctamente.');
    }

    public function edit(ControlFisicoQuimicoOrganoleptico $controlFQO)
    {
        $controlFQO->load('usuario');

        return Inertia::render('planta_lacteos/control_fisicoquimico_organoleptico/editar', [
            'registro' => $controlFQO,
        ]);
    }

    public function update(Request $request, ControlFisicoQuimicoOrganoleptico $controlFQO)
    {
        $data = $request->validate([
            'tiempo' => ['required', 'date'],
            'ph_pozo' => ['nullable', 'numeric'],
            'dureza_pozo' => ['nullable', 'numeric'],
            'conductividad_pozo' => ['nullable', 'numeric'],
            'ph_etap' => ['nullable', 'numeric'],
            'dureza_etap' => ['nullable', 'numeric'],
            'cloruros_etap' => ['nullable', 'numeric'],
            'conductividad_etap' => ['nullable', 'numeric'],
            'color' => ['nullable', 'in:normal,ligero,medio,fuerte'],
            'olor' => ['nullable', 'in:normal,anormal'],
            'sabor' => ['nullable', 'in:normal,anormal'],
            'aspecto' => ['nullable', 'in:normal,anormal'],
            'color_etap' => ['nullable', 'in:normal,ligero,medio,fuerte'],
            'olor_etap' => ['nullable', 'in:normal,anormal'],
            'sabor_etap' => ['nullable', 'in:normal,anormal'],
            'aspecto_etap' => ['nullable', 'in:normal,anormal'],
            'observaciones' => ['nullable', 'string'],
        ]);

        // Parsear el tiempo, detectando el formato (ISO con T o base de datos con espacio)
        $tiempoStr = $data['tiempo'];
        if (strpos($tiempoStr, 'T') !== false) {
            // Formato ISO datetime-local: 2026-07-13T13:32
            $time = Carbon::createFromFormat('Y-m-d\TH:i', $tiempoStr, config('app.timezone'));
        } else {
            // Formato de base de datos: 2026-07-13 13:32:00 o 2026-07-13 13:32
            $normalizado = str_replace(['T'], ' ', $tiempoStr);
            $normalizado = substr($normalizado, 0, 16); // Tomar solo YYYY-MM-DD HH:MM
            $time = Carbon::createFromFormat('Y-m-d H:i', $normalizado, config('app.timezone'));
        }
        $data['tiempo'] = $time->format('Y-m-d H:i:s');
        $data['user_id'] = $request->user()?->id ?? Auth::id();

        $controlFQO->update($data);

        return redirect()->route('control-fisicoquimico-organoleptico.index')
            ->with('success', 'Registro actualizado correctamente.');
    }

    public function destroy(ControlFisicoQuimicoOrganoleptico $controlFQO)
    {
        $controlFQO->delete();

        return redirect()->route('control-fisicoquimico-organoleptico.index')
            ->with('success', 'Registro eliminado correctamente.');
    }

    public function pdf(Request $request)
    {
        $request->validate([
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'required|date',
        ]);

        $desde = Carbon::parse($request->fecha_desde)->startOfDay();
        $hasta = Carbon::parse($request->fecha_hasta)->endOfDay();

        $registros = ControlFisicoQuimicoOrganoleptico::with('usuario')
            ->whereBetween('tiempo', [$desde->format('Y-m-d H:i:s'), $hasta->format('Y-m-d H:i:s')])
            ->orderByDesc('tiempo')
            ->get();

        $usuariosMap = [];
        foreach ($registros->pluck('usuario')->filter() as $usuario) {
            if ($usuario->codigo) {
                $usuariosMap[$usuario->codigo] = [
                    'codigo' => $usuario->codigo,
                    'nombre' => trim(($usuario->name ?? '') . ' ' . ($usuario->apellido ?? '')),
                ];
            }
        }

        return response()->json([
            'registros' => $registros,
            'usuarios_involucrados' => array_values($usuariosMap),
        ]);
    }
}
