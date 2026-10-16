<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;

use App\Domain\ModulosComunes\Productos\Models\ProductoTerminado;
use App\Domain\PlantaLacteos\Models\ItemMateriaPrima;
use App\Domain\PlantaLacteos\Models\SolicitudLaboratorioExterno;
use App\Domain\PlantaLacteos\Models\TipoMuestralaboratorioExterno;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Domain\Sistema\Configuracion\Models\User;
use Inertia\Inertia;

class SolicitudLaboratorioExternoController extends Controller
{


     public function index(Request $request)
    {
        // Extraer todos los filtros posibles del request
        $filters = $request->only([
            'search',
            'user_id',
            'autorizante_id',
            'estado_id',
            'ubicacion_id',
            'tiempo_desde',
            'tiempo_hasta',
            'tiempo_autorizacion_desde',
            'tiempo_autorizacion_hasta',
            'per_page',
            'codigo',
            'observacion'
        ]);

        // Iniciar query con relaciones necesarias
        $query = SolicitudLaboratorioExterno::with([
            'user:id,name,email',
            'autorizante:id,name',
            'estado:id,nombre,color',
            'ubicacion:id,nombre',
            'detalles' => function ($query) {
                $query->select([
                    'id',
                    'solicitud_id',
                    'tipo_muestra_id',
                    'tipo',  // Asegúrate de incluir este campo
                    'lote',
                    'fecha_elaboracion',
                    'fecha_vencimiento',
                    'fecha_muestreo',
                    'observacion',
                    'codigo',
                    'producto_terminado_id',
                    'item_materia_prima_id',
                    'user_id',
                    'otros',
                    'estado_id'
                ])->with([
                    'tipoMuestra:id,nombre,norma_microbiologico,norma_fisicoquimico',
                    'productoTerminado:id,nombre,codigo',
                    'itemMateriaPrima:id,nombre,codigo',
                    'user:id,name',
                    'estado:id,nombre'
                ]);
            }
        ]);

        // Si el usuario no es admin, solo ver solicitudes de su ubicación
        $user = auth()->user();

        if (!$user->hasRole('admin')) {
            // Filtrar por ubicación del usuario
            $query->where('ubicacion_id', $user->ubicacion_id);

            // Además, si el usuario no tiene permiso especial para ver todas las solicitudes de su ubicación,
            // solo verá sus propias solicitudes
            if (!$user->can('ver_todas_solicitudes_ubicacion')) {
                $query->where('user_id', $user->id);
            }
        }

        // Aplicar filtros del scope
        if (!empty($filters)) {
            $query->filter($filters);
        }

        // Ordenar por defecto
        $sort = $request->get('sort', 'created_at');
        $direction = $request->get('direction', 'desc');

        $solicitudes = $query->orderBy($sort, $direction)
            ->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Obtener recursos para filtros
        $estados = Estado::whereIn('nombre', ['Pendiente', 'Autorizada', 'Rechazada', 'En proceso', 'Completada'])
            ->orderBy('nombre')
            ->get(['id', 'nombre']);

        // Para el filtro de usuarios, solo mostrar usuarios de la ubicación actual si no es admin
        $usuariosFiltro = [];
        if ($user->hasRole('admin')) {
            // Admin ve todos los usuarios
            $usuariosFiltro = \App\Domain\Sistema\Configuracion\Models\User::query()
                ->select('id', 'name', 'email')
                ->get()
                ->map(function ($usuario) {
                    return [
                        'value' => $usuario->id,
                        'label' => $usuario->name . ' (' . $usuario->email . ')'
                    ];
                });
        } else {
            // Usuario no admin solo ve usuarios de su ubicación
            $usuariosFiltro = \App\Domain\Sistema\Configuracion\Models\User::where('ubicacion_id', $user->ubicacion_id)
                ->select('id', 'name', 'email')
                ->get()
                ->map(function ($usuario) {
                    return [
                        'value' => $usuario->id,
                        'label' => $usuario->name . ' (' . $usuario->email . ')'
                    ];
                });
        }

        // Para el filtro de ubicaciones
        $ubicacionesFiltro = [];
        if ($user->hasRole('admin')) {
            // Admin ve todas las ubicaciones
            $ubicacionesFiltro = \App\Domain\Sistema\Configuracion\Models\Ubicacion::query()
                ->select('id', 'nombre')
                ->get()
                ->map(function ($ubicacion) {
                    return [
                        'value' => $ubicacion->id,
                        'label' => $ubicacion->nombre
                    ];
                });
        } else {
            // Usuario no admin solo ve su ubicación
            $ubicacionesFiltro = [
                [
                    'value' => $user->ubicacion_id,
                    'label' => $user->ubicacion->nombre
                ]
            ];
        }

        // Para el filtro de autorizantes (similar a usuarios)
        $autorizantesFiltro = [];
        if ($user->hasRole('admin')) {
            $autorizantesFiltro = \App\Domain\Sistema\Configuracion\Models\User::query()
                ->select('id', 'name')
                ->get()
                ->map(function ($autorizante) {
                    return [
                        'value' => $autorizante->id,
                        'label' => $autorizante->name
                    ];
                });
        } else {
            $autorizantesFiltro = \App\Domain\Sistema\Configuracion\Models\User::where('ubicacion_id', $user->ubicacion_id)
                ->select('id', 'name')
                ->get()
                ->map(function ($autorizante) {
                    return [
                        'value' => $autorizante->id,
                        'label' => $autorizante->name
                    ];
                });
        }

        return Inertia::render('planta_lacteos/externos/solicitud/index', [
            'solicitudes' => $solicitudes,
            'filters' => $filters,
            'estados' => $estados->map(function ($estado) {
                return [
                    'value' => $estado->id,
                    'label' => $estado->nombre
                ];
            }),
            'usuarios' => $usuariosFiltro,
            'ubicaciones' => $ubicacionesFiltro,
            'autorizantes' => $autorizantesFiltro,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'user_permissions' => [
                'crear_solicitud' => $user->can('crear_solicitud_laboratorio_externo'),
                'editar_todas_solicitudes' => $user->can('editar_todas_solicitudes'),
                'eliminar_todas_solicitudes' => $user->can('eliminar_todas_solicitudes'),
                'ver_todas_solicitudes' => $user->can('ver_todas_solicitudes'),
            ]
        ]);
    }



     public function create()
    {
        $user = auth()->user();

        // Verificar permisos

        // Obtener tipos de muestra (solo los activos o según criterio)
        $tiposMuestra = TipoMuestralaboratorioExterno::where('ubicacion_id', $user->ubicacion_id)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'norma_microbiologico', 'norma_fisicoquimico']);

        // Obtener productos terminados de la ubicación
        $productosTerminados = ProductoTerminado::where('ubicacion_id', $user->ubicacion_id)
            ->orderBy('id')
            ->get(['id', 'nombre_sap', 'codigo_sap']);

        // Obtener materias primas de la ubicación
        $materiasPrimas = ItemMateriaPrima::where('ubicacion_id', $user->ubicacion_id)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'codigo']);

        // Obtener usuarios de la ubicación (excluyendo al usuario actual)
        $usuarios = User::where('ubicacion_id', $user->ubicacion_id)
            ->where('id', '!=', $user->id)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('planta_lacteos/externos/solicitud/crear', [
            'tiposMuestra' => $tiposMuestra,
            'productosTerminados' => $productosTerminados,
            'materiasPrimas' => $materiasPrimas,
            'usuarios' => $usuarios,
            'ubicacion' => $user->ubicacion,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        // Validar permisos
        if (!$user->can('crear_solicitud_laboratorio_externo')) {
            abort(403, 'No tienes permiso para crear solicitudes');
        }

        // Validación de la solicitud
        $request->validate([
            'observacion' => 'nullable|string|max:500',
            'detalles' => 'required|array|min:1|max:10',
            'detalles.*.tipo_muestra_id' => 'required|exists:PLL_tipo_muestra_laboratorio_externo,id',
            'detalles.*.tipo' => 'required|in:Microbiologico,Fisicoquimico',
            'detalles.*.item_type' => 'required|in:user,item_materia_prima,producto_terminado,otros',
            'detalles.*.user_id' => 'nullable|required_if:detalles.*.item_type,user|exists:users,id',
            'detalles.*.item_materia_prima_id' => 'nullable|required_if:detalles.*.item_type,item_materia_prima|exists:PLL_item_materia_prima,id',
            'detalles.*.producto_terminado_id' => 'nullable|required_if:detalles.*.item_type,producto_terminado|exists:productos_terminados,id',
            'detalles.*.otros' => 'nullable|required_if:detalles.*.item_type,otros|string|max:255',
            'detalles.*.lote' => 'nullable|string|max:100',
            'detalles.*.fecha_elaboracion' => 'nullable|date',
            'detalles.*.fecha_vencimiento' => 'nullable|date|after_or_equal:detalles.*.fecha_elaboracion',
            'detalles.*.fecha_muestreo' => 'nullable|date',
            'detalles.*.observacion' => 'nullable|string|max:500',
        ]);

        try {
            \DB::beginTransaction();

            // Generar código único para la solicitud
            $codigo = 'SLE-' . strtoupper(\Str::random(6)) . '-' . date('Ymd');

            // Crear la solicitud principal
            $solicitud = SolicitudLaboratorioExterno::create([
                'user_id' => $user->id,
                'ubicacion_id' => $user->ubicacion_id,
                'codigo' => $codigo,
                'observacion' => $request->observacion,
                'tiempo' => now(),
                'estado_id' => 1, // Estado inicial: Pendiente
            ]);

            // Crear cada detalle
            foreach ($request->detalles as $detalleData) {
                $detalle = [
                    'solicitud_id' => $solicitud->id,
                    'tipo_muestra_id' => $detalleData['tipo_muestra_id'],
                    'tipo' => $detalleData['tipo'], // Microbiologico o Fisicoquimico
                    'lote' => $detalleData['lote'] ?? null,
                    'fecha_elaboracion' => $detalleData['fecha_elaboracion'] ?? null,
                    'fecha_vencimiento' => $detalleData['fecha_vencimiento'] ?? null,
                    'fecha_muestreo' => $detalleData['fecha_muestreo'] ?? null,
                    'observacion' => $detalleData['observacion'] ?? null,
                    'estado_id' => 1, // Estado inicial del detalle
                    'codigo' => 'DSLE-' . strtoupper(\Str::random(4)) . '-' . date('Ymd'),
                ];

                // Asignar el item según el tipo seleccionado
                switch ($detalleData['item_type']) {
                    case 'user':
                        $detalle['user_id'] = $detalleData['user_id'];
                        break;
                    case 'item_materia_prima':
                        $detalle['item_materia_prima_id'] = $detalleData['item_materia_prima_id'];
                        break;
                    case 'producto_terminado':
                        $detalle['producto_terminado_id'] = $detalleData['producto_terminado_id'];
                        break;
                    case 'otros':
                        $detalle['otros'] = $detalleData['otros'];
                        break;
                }

                // Crear el detalle
                $nuevoDetalle = \App\Domain\PlantaLacteos\Models\DetalleSolicitudLaboratorioExterno::create($detalle);

                // Crear el registro en la tabla correspondiente según el tipo de análisis
                if ($detalleData['tipo'] === 'Microbiologico') {
                    \App\Domain\PlantaLacteos\Models\MicrobiologiaLaboratorioExterno::create([
                        'detalle_id' => $nuevoDetalle->id,
                        'estado_id' => 1, // Pendiente
                        'user_id' => $user->id,
                    ]);
                } elseif ($detalleData['tipo'] === 'Fisicoquimico') {
                    \App\Domain\PlantaLacteos\Models\FisicoquimicoLaboratorioExterno::create([
                        'detalle_id' => $nuevoDetalle->id,
                        'estado_id' => 1, // Pendiente
                    ]);
                }
            }

            \DB::commit();

            return redirect()->route('laboratorio-externo.solicitudes.index')
                ->with('success', 'Solicitud creada exitosamente');

        } catch (\Exception $e) {
            \DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Error al crear la solicitud: ' . $e->getMessage());
        }
    }

}
