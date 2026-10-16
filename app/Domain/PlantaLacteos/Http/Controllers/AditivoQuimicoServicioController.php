<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Domain\PlantaLacteos\Models\AditivoQuimicoServicio;
use App\Domain\Sistema\Configuracion\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AditivoQuimicoServicioController
{
    public function index(Request $request)
    {
        $query = AditivoQuimicoServicio::with('usuario')->orderByDesc('tiempo');

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($qq) use ($q) {
                $qq->whereHas('usuario', function ($u) use ($q) {
                    $u->whereRaw("concat(name,' ',apellido) like ?", ["%{$q}%"]);
                })->orWhere('tiempo', 'like', "%{$q}%");
            });
        }

        if ($request->filled('fecha_desde')) {
            $desde = Carbon::parse($request->fecha_desde)->startOfDay();
            $query->where('tiempo', '>=', $desde->format('Y-m-d H:i:s'));
        }
        if ($request->filled('fecha_hasta')) {
            $hasta = Carbon::parse($request->fecha_hasta)->endOfDay();
            $query->where('tiempo', '<=', $hasta->format('Y-m-d H:i:s'));
        }

        $perPage = (int) ($request->get('per_page', 10));
        $aditivos = $query->paginate($perPage)->withQueryString();

        $usuarios = User::select(['id', 'name', 'apellido'])
            ->orderBy('name')
            ->get();

        return Inertia::render('planta_lacteos/aditivos_quimicos/index', [
            'aditivos' => $aditivos,
            'usuarios' => $usuarios,
            'filters' => $request->only(['search', 'fecha_desde', 'fecha_hasta', 'per_page']),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function pdf(Request $request)
    {
        $request->validate([
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'required|date',
        ]);

        $query = AditivoQuimicoServicio::with('usuario')->orderByDesc('tiempo');
        $desde = Carbon::parse($request->fecha_desde)->startOfDay();
        $hasta = Carbon::parse($request->fecha_hasta)->endOfDay();
        $query->whereBetween('tiempo', [$desde->format('Y-m-d H:i:s'), $hasta->format('Y-m-d H:i:s')]);

        $aditivos = $query->get();

        $usuariosMap = [];
        foreach ($aditivos->pluck('usuario')->filter() as $usuario) {
            if ($usuario->codigo) {
                $usuariosMap[$usuario->codigo] = [
                    'codigo' => $usuario->codigo,
                    'nombre' => trim(($usuario->name ?? '') . ' ' . ($usuario->apellido ?? '')),
                ];
            }
        }

        return response()->json([
            'aditivos' => $aditivos,
            'usuarios_involucrados' => array_values($usuariosMap),
        ]);
    }

    public function create()
    {
        $usuarios = User::select(['id', 'name', 'apellido'])
            ->orderBy('name')
            ->get();

        return Inertia::render('planta_lacteos/aditivos_quimicos/crear', [
            'usuarios' => $usuarios,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'tiempo' => ['required', 'date'],
            'wet_boil_101' => ['nullable', 'numeric'],
            'wet_boil_201' => ['nullable', 'numeric'],
            'wet_boil_402' => ['nullable', 'numeric'],
            'wet_boil_801' => ['nullable', 'numeric'],
            'soda_caustica' => ['nullable', 'numeric'],
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

        AditivoQuimicoServicio::create($data);

        return redirect()->route('aditivos-quimicos.index')
            ->with('success', 'Registro creado correctamente.');
    }

    public function edit(AditivoQuimicoServicio $aditivoQuimico)
    {
        $aditivoQuimico->load('usuario');
        $usuarios = User::select(['id', 'name', 'apellido'])
            ->orderBy('name')
            ->get();

        return Inertia::render('planta_lacteos/aditivos_quimicos/editar', [
            'aditivoQuimico' => $aditivoQuimico,
            'usuarios' => $usuarios,
        ]);
    }

    public function update(Request $request, AditivoQuimicoServicio $aditivoQuimico)
    {
        $data = $request->validate([
            'tiempo' => ['required', 'date'],
            'wet_boil_101' => ['nullable', 'numeric'],
            'wet_boil_201' => ['nullable', 'numeric'],
            'wet_boil_402' => ['nullable', 'numeric'],
            'wet_boil_801' => ['nullable', 'numeric'],
            'soda_caustica' => ['nullable', 'numeric'],
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

        $aditivoQuimico->update($data);

        return redirect()->route('aditivos-quimicos.index')
            ->with('success', 'Registro actualizado correctamente.');
    }

    public function destroy(AditivoQuimicoServicio $aditivoQuimico)
    {
        $aditivoQuimico->delete();

        return redirect()->route('aditivos-quimicos.index')
            ->with('success', 'Registro eliminado correctamente.');
    }
}
