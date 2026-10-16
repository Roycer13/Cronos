<?php

namespace App\Domain\Mantenimiento\Http\Controllers;

use App\Domain\Mantenimiento\Http\Requests\OtRequest;

use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Domain\Mantenimiento\Http\Requests\SolicitudOtRequest;
use App\Domain\Mantenimiento\Models\AyudanteOt;
use App\Domain\Mantenimiento\Models\Ot;
use App\Domain\Mantenimiento\Models\Proveedor;
use App\Domain\Mantenimiento\Models\Repuesto;
use App\Domain\Mantenimiento\Models\SolicitudOt;
use App\Domain\Mantenimiento\Services\OtService;
use App\Domain\Mantenimiento\Services\SolicitudOtService;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\MaquinaEquipo;
use App\Domain\Sistema\Configuracion\Models\Prioridad;
use App\Domain\Sistema\Configuracion\Models\Sector;
use App\Domain\Sistema\Configuracion\Models\Unidad;
use App\Domain\Sistema\Configuracion\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Spatie\Permission\Models\Role;

class OtController extends Controller
{
    protected OtService $otService;

    public function __construct(OtService $otService)
    {
        $this->otService = $otService;
    }

    public function index(Request $request, OtService $otService)
    {
        $filters = $request->only([
            'search',
            'user_id',
            'prioridad_id',
            'estado_id',
            'tipo_orden',
            'fecha_desde',
            'solicitanteOt',
            'fecha_hasta',
        ]);

        // 🔹 Recibimos el array del service (ots + isAdmin)
        $data = $otService->getOtsForUser(auth()->user(), $filters);

        // 🔹 Extraemos las partes
        $ots = $data['ots'];
        $isAdmin = $data['isAdmin'];

        return Inertia::render('mantenimiento/ots/index', [
            'ots' => $ots,
            'isAdmin' => $isAdmin, // 🔹 enviamos flag al frontend
            'filters' => $filters,
            'users' => User::whereHas('area', function ($query) {
                $query->where('nombre', 'Mantenimiento');
            })->get(),
            'solicitanteOts' => User::all(),
            'estados' => Estado::whereIn('nombre', [
                'Asignado',
                'Completado',
                'Revisado',
                'Cerrado'

            ])->get(),
            'prioridades' => Prioridad::all(),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }




    public function create() {}





    public function store(OtRequest $request)
    {
        //usamos el servicio de crear
        $this->otService->createOt($request->all());
        return redirect()->route('solicitudOts')->with('success', ' Ot creada exitosamente.');
    }


    public function edit(Ot $ot)
    {



        // return Inertia::render('mantenimiento/ots/editar', [
        //     'users' => User::all(),
        //     'estados' => Estado::all(),
        //     'prioridades' => Prioridad::all(),
        //     'solicitudOts' => SolicitudOt::all(),
        // ]);
    }
    // Actualizar planta
    public function update(SolicitudOtRequest $request, SolicitudOt $solicitudOt)
    {

        // try {
        //     //usamos el servicio de editar
        //     $this->solicitudOtService->updateSolicitudOt($solicitudOt, $request->all());
        //     return redirect()->route('solicitudOts')
        //         ->with('success', 'Solicitud actualizado correctamente.');
        // } catch (\Exception $e) {
        //     return redirect()->back()
        //         ->with('error', $e->getMessage());
        // }
    }

    // Eliminar planta
    public function destroy(SolicitudOt $solicitudOt)
    {




        // try {
        //     //usamos el servicio de eliminar
        //     $this->solicitudOtService->deleteSolicitudOt($solicitudOt);
        //     return redirect()->route('solicitudOts')
        //         ->with('success', 'solicitudOt eliminado exitosamente.');
        // } catch (\Exception $e) {
        //     return redirect()->route('solicitudOts')
        //         ->with('error', $e->getMessage());
        // }
    }



    public function actualizarDetalles(Request $request, Ot $ot)
    {
        $validated = $request->validate([
            'diagnostico' => 'nullable|string|max:1000',
            'accion' => 'nullable|string|max:1000',
            'sugerencia' => 'nullable|string|max:1000',
        ]);

        try {
            // 🔹 Lógica delegada al service
            $this->otService->actualizarDetalles($ot, $validated);

            return back()->with('success', 'Detalles actualizados correctamente.');
        } catch (\Throwable $e) {
            \Log::error('Error al actualizar detalles de OT', [
                'ot_id' => $ot->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Error al actualizar los detalles de la OT.');
        }
    }

    public function marcarVisto(Ot $ot)
    {
        try {

            // Registrar solo si aún no tiene valor
            if (is_null($ot->tiempo_visto) && $ot->user_id == auth()->id()) {

                $ot->tiempo_visto = now();
                $ot->save();
                return back()->with('success', 'OT marcada como vista.');
            } else {
                return back();
            }
        } catch (\Throwable $e) {
            \Log::error('Error al marcar OT como vista', [
                'ot_id' => $ot->id,
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'No se pudo marcar la OT como vista.');
        }
    }



















    public function iniciarTiempo(Ot $ot)
    {
        try {
            $userId = auth()->id();

            // 🔍 Verificar si el usuario ya tiene un tiempo activo en cualquier OT
            $tiempoActivoGlobal = AyudanteOt::where('user_id', $userId)
                ->whereNotNull('tiempo_inicio')
                ->whereNull('tiempo_fin')
                ->exists();

            if ($tiempoActivoGlobal) {
                return back()->with('error', 'Ya tienes un tiempo activo en otra orden de trabajo. Debes finalizarlo antes de iniciar uno nuevo.');
            }

            // Buscar si existe un registro de asignación (inicio y fin null) para esta OT
            $registroAsignacion = AyudanteOt::where('ot_id', $ot->id)
                ->where('user_id', $userId)
                ->whereNull('tiempo_inicio')
                ->whereNull('tiempo_fin')
                ->first();

            if ($registroAsignacion) {
                // Es el primer inicio: actualizar el registro de asignación
                $registroAsignacion->update(['tiempo_inicio' => now()]);
                return back()->with('success', 'Tiempo iniciado correctamente.');
            }

            // Si no hay registro de asignación, verificar si ya hay un tiempo activo en esta OT (por si acaso)
            $activo = AyudanteOt::where('ot_id', $ot->id)
                ->where('user_id', $userId)
                ->whereNotNull('tiempo_inicio')
                ->whereNull('tiempo_fin')
                ->exists();

            if ($activo) {
                return back()->with('error', 'Ya tienes un tiempo en curso en esta OT. Finalízalo antes de iniciar otro.');
            }

            // No hay registro de asignación ni activo, crear uno nuevo
            AyudanteOt::create([
                'ot_id' => $ot->id,
                'user_id' => $userId,
                'tiempo_inicio' => now(),
            ]);

            return back()->with('success', 'Tiempo iniciado correctamente.');
        } catch (\Throwable $e) {
            Log::error('Error al iniciar tiempo: ' . $e->getMessage());
            return back()->with('error', 'No se pudo iniciar el tiempo.');
        }
    }

    public function finalizarTiempo(Ot $ot, AyudanteOt $tiempo)
    {


        // Seguridad: el tiempo debe pertenecer al usuario y a la OT
        if ($tiempo->user_id != auth()->id() || $tiempo->ot_id != $ot->id) {
            abort(403);
        }

        if ($tiempo->tiempo_fin) {
            return back()->with('error', 'Este tiempo ya fue finalizado.');
        }

        $tiempo->update(['tiempo_fin' => now()]);

        return back()->with('success', 'Tiempo finalizado correctamente.');
    }


    public function registrarTiempoManual(Request $request, Ot $ot)
    {
        $validated = $request->validate([
            'user_id'       => 'required|exists:users,id',
            'tiempo_inicio' => 'required|date',
            'tiempo_fin'    => 'required|date|after:tiempo_inicio',
        ]);

        $userId = $validated['user_id'];
        $start  = Carbon::parse($validated['tiempo_inicio']);
        $end    = Carbon::parse($validated['tiempo_fin']);

        // Verificar solapamiento para el usuario seleccionado
        $overlap = AyudanteOt::where('user_id', $userId)
            ->where(function ($query) use ($start, $end) {
                // Tiempos finalizados que solapan
                $query->whereNotNull('tiempo_fin')
                    ->where(function ($q) use ($start, $end) {
                        $q->where('tiempo_inicio', '<=', $end)
                            ->where('tiempo_fin', '>=', $start);
                    });
            })
            ->orWhere(function ($query) use ($start, $end) {
                // Tiempos activos (sin fin) que solapan
                $query->whereNull('tiempo_fin')
                    ->where('tiempo_inicio', '<=', $end);
            })
            ->exists();

        if ($overlap) {
            return back()->with('error', 'El usuario seleccionado ya tiene un tiempo registrado que solapa con el horario indicado.');
        }

        try {
            AyudanteOt::create([
                'ot_id'        => $ot->id,
                'user_id'      => $userId,
                'tiempo_inicio' => $start,
                'tiempo_fin'   => $end,
            ]);

            return back()->with('success', 'Tiempo registrado manualmente.');
        } catch (\Throwable $e) {
            Log::error('Error al registrar tiempo manual: ' . $e->getMessage());
            return back()->with('error', 'No se pudo registrar el tiempo.');
        }
    }

    public function listarTiempos(Ot $ot)
    {
        $tiempos = AyudanteOt::where('ot_id', $ot->id)
            ->where('user_id', auth()->id())
            ->orderBy('tiempo_inicio', 'desc')
            ->get();

        return response()->json($tiempos);
    }




    public function ayudantesDisponibles(Ot $ot)
    {
        $idsAsignados = AyudanteOt::where('ot_id', $ot->id)
            ->pluck('user_id')
            ->toArray();

        $usuarios = User::whereNotIn('id', $idsAsignados)
            ->whereHas('ubicacion', function ($query) {
                $query->where('nombre', 'Mantenimiento');
            })
            ->select('id', 'name', 'apellido')
            ->orderBy('name')
            ->get();

        return response()->json($usuarios);
    }

    public function asignarAyudante(Request $request, Ot $ot)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        // Verificar que no esté ya asignado
        $yaAsignado = AyudanteOt::where('ot_id', $ot->id)
            ->where('user_id', $validated['user_id'])
            ->exists();

        if ($yaAsignado) {
            return back()->with('error', 'El usuario ya está asignado a esta OT.');
        }

        // Crear registro de ayudante (tiempos null)
        AyudanteOt::create([
            'ot_id' => $ot->id,
            'user_id' => $validated['user_id'],
            // tiempo_inicio y tiempo_fin se quedan null
        ]);

        return back()->with('success', 'Ayudante asignado correctamente.');
    }
}
