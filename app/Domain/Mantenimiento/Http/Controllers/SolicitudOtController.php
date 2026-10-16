<?php

namespace App\Domain\Mantenimiento\Http\Controllers;



use App\Http\Controllers\Controller;
use App\Domain\Mantenimiento\Http\Requests\SolicitudOtRequest;
use App\Domain\Mantenimiento\Models\Ot;
use App\Domain\Mantenimiento\Models\Proveedor;
use App\Domain\Mantenimiento\Models\Repuesto;
use App\Domain\Mantenimiento\Models\SolicitudOt;
use App\Domain\Mantenimiento\Services\SolicitudOtService;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\MaquinaEquipo;
use App\Domain\Sistema\Configuracion\Models\Prioridad;
use App\Domain\Sistema\Configuracion\Models\Sector;
use App\Domain\Sistema\Configuracion\Models\Unidad;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

use Spatie\Permission\Models\Role;

class SolicitudOtController extends Controller
{
    protected SolicitudOtService $solicitudOtService;

    public function __construct(SolicitudOtService $solicitudOtService)
    {
        $this->solicitudOtService = $solicitudOtService;
    }

    public function index(Request $request)
    {


        // Obtén todos los usuarios cuya área sea "Mantenimiento"
        $usersMantenimiento = User::whereHas('area', function ($q) {
            $q->where('nombre', 'Mantenimiento');
        })->get(['id', 'name']); // Solo id y name para el select

        $filters = $request->only(['search', 'user_id', 'maquina_equipo_id', 'sector_id', 'estado_id', 'observacion', 'fecha_desde', 'fecha_hasta']);


        //llamamos los datos de usuarios
        $solicitudOts = SolicitudOt::with(['sector', 'createdBy', 'user', 'maquinaEquipo', 'ot', 'estado',])
            ->filter($filters) // Aplicamos el scope de filtros
            ->orderBy($request->get('sort', 'created_at'))
            ->paginate($request->get('per_page', 10))
            ->withQueryString();


        //usamos inertia para llamar a la vista
        return Inertia::render('mantenimiento/solicitudOts/index', [
            'solicitudOts' => $solicitudOts,
            'filters' => $filters,
            'sectores' => Sector::all(),
            // 'users' => $usersMantenimiento,
            'users' => User::all(),
            'maquinaEquipos' => MaquinaEquipo::all(),
            'ots' => Ot::all(),
            'prioridades' => Prioridad::all(),
            'estados' => Estado::whereIn('nombre', [
                'Pendiente',
                'Aprobado',
                'Completado',
                'Revisado',
                'Cerrado'

            ])->get(),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],

        ]);
    }


    public function create()
    {
        return Inertia::render('mantenimiento/solicitudOts/crear', [
            'unidades' => Unidad::all(),
              'sectores'      => Sector::select('id', 'nombre', 'codigo')->get(),
            'users' => User::all(),

            // Enviar el sector_id junto con la máquina
            'maquinaEquipos' => MaquinaEquipo::select('id', 'nombre', 'sector_id','codigo_contable')->get(),

            'estados' => Estado::all(),
        ]);
    }





    public function store(SolicitudOtRequest $request)
    {
        //usamos el servicio de crear
        $this->solicitudOtService->createSolicitudOt($request->all());
        return redirect()->route('solicitudOts')->with('success', 'solicitud de Ot creada exitosamente.');
    }


    public function edit(SolicitudOt $solicitudOt)
    {



        return Inertia::render('mantenimiento/solicitudOts/editar', [
            'unidades' => Unidad::all(),
            'sectores' => Sector::all(),
            'users' => User::all(),

            'maquinaEquipos' => MaquinaEquipo::select('id', 'nombre', 'sector_id')->get(),

            'estados' => Estado::all(),

            'solicitudOt' => $solicitudOt,
            'unidades' => Unidad::all(),

        ]);
    }
    // Actualizar planta
    public function update(SolicitudOtRequest $request, SolicitudOt $solicitudOt)
    {

        try {
            //usamos el servicio de editar
            $this->solicitudOtService->updateSolicitudOt($solicitudOt, $request->all());



            return redirect()->route('solicitudOts')
                ->with('success', 'Solicitud actualizado correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    // Eliminar planta
    public function destroy(SolicitudOt $solicitudOt)
    {




        try {
            //usamos el servicio de eliminar
            $this->solicitudOtService->deleteSolicitudOt($solicitudOt);
            return redirect()->route('solicitudOts')
                ->with('success', 'solicitudOt eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('solicitudOts')
                ->with('error', $e->getMessage());
        }
    }

    public function rechazar(SolicitudOt $solicitud)
    {
        $estado = Estado::where('nombre', 'Rechazado')->first();

        $solicitud->update([
            'estado_id' => $estado->id
        ]);
        return redirect()->route('solicitudOts')->with('success', 'Solicitud rechazada.');
    }

    public function marcarRevisado(SolicitudOt $solicitudOt)
    {
        try {

            // Verificamos que exista una OT asociada
            $ot = $solicitudOt->ot;
            if (!$ot) {
                return redirect()->route('solicitudOts')
                    ->with('error', 'Esta solicitud no tiene una OT asociada.');
            }

            // Verificamos que la OT esté completada
            if ($ot->estado->nombre !== 'Completado') {
                return redirect()->route('solicitudOts')
                    ->with('error', 'Solo se pueden revisar OTs completadas.');
            }

            // Verificamos que el usuario autenticado sea el mismo asignado a la OT
            if (auth()->id() != $solicitudOt->user_id) {
                return redirect()->route('solicitudOts')
                    ->with('error', 'No tienes permiso para revisar esta OT.');
            }

            // Obtenemos el estado "Revisado"
            $estadoRevisado = Estado::where('nombre', 'Revisado')->first();
            // Actualizamos la OT

            $ot->update([
                'tiempo_revisado' => now(),
                'estado_id' => $estadoRevisado?->id ?? $ot->estado_id,
            ]);

            // Actualizamos también la solicitud
            $solicitudOt->update([
                'estado_id' => $estadoRevisado?->id ?? $solicitudOt->estado_id,
            ]);

            return redirect()->route('solicitudOts')
                ->with('success', 'OT marcada como revisada correctamente.');
        } catch (\Throwable $e) {
            dd($e->getMessage());

            return redirect()->route('solicitudOts')
                ->with('error', 'Error al marcar la OT como revisada.');
        }
    }



    public function marcarCerrado(SolicitudOt $solicitudOt)
    {
        try {

            // Verificamos que exista una OT asociada
            $ot = $solicitudOt->ot;
            if (!$ot) {
                return redirect()->route('solicitudOts')
                    ->with('error', 'Esta solicitud no tiene una OT asociada.');
            }

            // Verificamos que la OT esté completada
            if ($ot->estado->nombre !== 'Revisado') {
                return redirect()->route('solicitudOts')
                    ->with('error', 'Solo se pueden revisar OTs revisado.');
            }



            // Obtenemos el estado "Revisado"
            $estadoRevisado = Estado::where('nombre', 'Cerrado')->first();
            // Actualizamos la OT

            $ot->update([
                'tiempo_cerrado' => now(),
                'estado_id' => $estadoRevisado?->id ?? $ot->estado_id,
            ]);

            // Actualizamos también la solicitud
            $solicitudOt->update([
                'estado_id' => $estadoRevisado?->id ?? $solicitudOt->estado_id,
            ]);

            return redirect()->route('solicitudOts')
                ->with('success', 'OT marcada como cerrada correctamente.');
        } catch (\Throwable $e) {
            dd($e->getMessage());

            return redirect()->route('solicitudOts')
                ->with('error', 'Error al marcar la OT como cerrada.');
        }
    }

    public function approve(SolicitudDocumento $solicitudDocumentacion, Request $request)
    {
        try {
            $data = $request->validate([
                'creador_asignado' => 'required|exists:users,id',
                'revisor1_asignado' => 'nullable|exists:users,id',
                'revisor2_asignado' => 'nullable|exists:users,id',
                'aprobador_asignado' => 'required|exists:users,id',
                'documento_padre_id' => 'nullable|exists:documentos,id',
                'custodio' => 'nullable|string|max:255',
                'tipo_distribucion' => 'nullable|string|max:50',
                'ubicacion_fisica' => 'nullable|string|max:255',
            ]);

            $this->service->approve($solicitudDocumentacion, $data);

            return redirect()
                ->route('solicitudDocumentacion.index')
                ->with('success', 'Solicitud aprobada exitosamente');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Error al aprobar la solicitud: ' . $e->getMessage()]);
        }
    }

    public function reject(SolicitudDocumento $solicitudDocumentacion, Request $request)
    {
        try {
            $request->validate([
                'razon' => 'required|string|max:1000',
            ]);

            $this->service->reject($solicitudDocumentacion, $request->input('razon'));

            return redirect()
                ->route('solicitudDocumentacion.index')
                ->with('success', 'Solicitud rechazada exitosamente');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Error al rechazar la solicitud: ' . $e->getMessage()]);
        }
    }
}
