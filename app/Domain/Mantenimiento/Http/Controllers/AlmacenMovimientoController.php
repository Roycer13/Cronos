<?php

namespace App\Domain\Mantenimiento\Http\Controllers;

use App\Domain\Mantenimiento\Http\Requests\AlmacenMovimientoRequest;
use App\Domain\Mantenimiento\Models\almacenRepuestos;
use App\Domain\Mantenimiento\Models\DetalleAlmacenRepuestos;
use App\Domain\Mantenimiento\Models\Ot;
use App\Domain\Mantenimiento\Models\Proveedor;
use App\Domain\Mantenimiento\Models\Repuesto;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AlmacenMovimientoController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only([
            'search',
            'ot_id',
            'proveedor_id',
            'user_id',
            'almacenero_id',
            'autorizante_id',
            'estado_id',
            'ubicacion_id',
            'tipo',
            'tipo_descripcion',
            'fecha_desde',
            'fecha_hasta',
            'tiempo_entregado_desde',
            'tiempo_entregado_hasta',
            'per_page',
            'sort',
            'direction',
        ]);

        $movimientos = almacenRepuestos::with([
            'ot',
            'proveedor',
            'user',
            'almacenero',
            'autorizante',
            'estado',
            'ubicacion',
            'detalleAlmacenRepuestos.repuesto',
        ])
            ->filter($filters)
            ->orderBy($filters['sort'] ?? 'created_at', $filters['direction'] ?? 'desc')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();

        $ots = Ot::select('id', 'numero')->orderBy('numero')->get();
        $proveedores = Proveedor::select('id', 'nombre')->orderBy('nombre')->get();
        $usuarios = User::orderBy('name')->get();


        $estados = Estado::whereIn('nombre', [
                'Pendiente',
                'Autorizado',
                'Entregado'


            ])->get();
        $ubicaciones = Ubicacion::orderBy('nombre')->get();
        $tiposDescripcion = almacenRepuestos::distinct()->pluck('tipo_descripcion')->filter();

        return Inertia::render('mantenimiento/almacen/index', [
            'movimientos' => $movimientos,
            'filters' => $filters,
            'ots' => $ots,
            'proveedores' => $proveedores,
            'usuarios' => $usuarios,
            'estados' => $estados,
            'ubicaciones' => $ubicaciones,
            'tiposDescripcion' => $tiposDescripcion,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create()
    {
        $ubicaciones = Ubicacion::orderBy('nombre')
            ->where('codigo', 'like', '%MAN-%')
            ->get();

        $tipos = [
            ['value' => 'OT_salida', 'tipo' => 0, 'descripcion' => 'OT salida', 'label' => 'OT Salida'],
            ['value' => 'OT_devolucion', 'tipo' => 1, 'descripcion' => 'OT devolución', 'label' => 'OT Devolución'],
            ['value' => 'Compra', 'tipo' => 1, 'descripcion' => 'Compra', 'label' => 'Compra'],
            ['value' => 'Baja', 'tipo' => 0, 'descripcion' => 'Baja', 'label' => 'Baja'],
            ['value' => 'Ajuste_entrada', 'tipo' => 1, 'descripcion' => 'Ajuste', 'label' => 'Ajuste (Entrada)'],
            ['value' => 'Ajuste_salida', 'tipo' => 0, 'descripcion' => 'Ajuste', 'label' => 'Ajuste (Salida)'],
        ];
        $ots = Ot::select('id', 'numero')
            ->whereHas('estado', function ($query) {
                $query->where('nombre', '!=', 'Completado');
            })
            ->orderBy('numero')
            ->get();
        $proveedores = Proveedor::select('id', 'nombre')->orderBy('nombre')->get();
        $estados = Estado::orderBy('nombre')->get();
        $repuestos = Repuesto::select('id', 'nombre', 'codigo', 'precio_relativo')->orderBy('nombre')->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'label' => "{$r->codigo} - {$r->nombre}",
                'precio_relativo' => $r->precio_relativo, // opcional, se puede usar en frontend
            ]);

        return Inertia::render('mantenimiento/almacen/crear', [
            'ubicaciones' => $ubicaciones,
            'tipos' => $tipos,
            'ots' => $ots,
            'proveedores' => $proveedores,
            'estados' => $estados,
            'repuestos' => $repuestos,
        ]);
    }

    public function store(AlmacenMovimientoRequest $request)
    {
        DB::beginTransaction();

        try {
            // Determinar estado inicial según tipo de movimiento
            $estadoNombre = $request->tipo == 1 ? 'Entregado' : 'Pendiente';
            $estado = Estado::where('nombre', $estadoNombre)->first();

            if (!$estado) {
                throw new \Exception("Estado '{$estadoNombre}' no encontrado");
            }

            // Crear movimiento principal
            $movimiento = almacenRepuestos::create([
                'ot_id' => in_array($request->tipo_descripcion, ['OT salida', 'OT devolución']) ? $request->ot_id : null,
                'proveedor_id' => $request->tipo_descripcion === 'Compra' ? $request->proveedor_id : null,
                'user_id' => auth()->id(),
                'ubicacion_id' => $request->ubicacion_id,
                'almacenero_id' => null,
                'autorizante_id' => null,
                'estado_id' => $estado->id,
                'observacion' => $request->observacion,
                'tipo' => $request->tipo,
                'tipo_descripcion' => $request->tipo_descripcion,
                'tiempo' => now(),
                'tiempo_autorizacion' => null,
                'tiempo_entregado' => $request->tipo == 1 ? now() : null,
            ]);

            // Procesar cada detalle
            foreach ($request->detalles as $detalle) {
                $repuestoId = $detalle['repuesto_id'];
                $cantidad = $detalle['cantidad'];
                $repuesto = Repuesto::findOrFail($repuestoId);

                // Determinar el precio a guardar y si actualizar el precio_relativo
                $precio = null;
                $esIngresoConPrecio = ($request->tipo == 1 && in_array($request->tipo_descripcion, ['Compra', 'Ajuste (Entrada)']));

                if ($esIngresoConPrecio) {
                    // El precio viene del formulario y es obligatorio
                    if (!isset($detalle['precio']) || $detalle['precio'] <= 0) {
                        throw new \Exception("El precio es obligatorio para el repuesto {$repuesto->nombre}");
                    }
                    $precio = $detalle['precio'];
                    // Actualizar el precio relativo del repuesto
                    $repuesto->precio_relativo = $precio;
                    $repuesto->save();
                } else {
                    // Egreso: tomar el precio actual del repuesto
                    $precio = $repuesto->precio_relativo;
                    if ($precio === null) {
                        throw new \Exception("El repuesto {$repuesto->nombre} no tiene un precio definido");
                    }
                }

                // Calcular saldo (igual que antes)
                $ultimoSaldo = $this->getStockDisponible($repuestoId, $request->ubicacion_id);
                $nuevoSaldo = $request->tipo == 1 ? $ultimoSaldo + $cantidad : $ultimoSaldo - $cantidad;

                DetalleAlmacenRepuestos::create([
                    'almacen_repuesto_id' => $movimiento->id,
                    'repuesto_id' => $repuestoId,
                    'cantidad' => $cantidad,
                    'precio' => $precio,   // ← nuevo campo
                    'saldo' => $nuevoSaldo,
                ]);
            }

            DB::commit();

            return redirect()->route('almacen.movimientos')
                ->with('success', 'Movimiento de almacén creado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al crear el movimiento: ' . $e->getMessage());
        }
    }

    /**
     * Obtiene el stock disponible de un repuesto en una ubicación específica,
     * considerando solo movimientos con estado 'Entregado'.
     */
    private function getStockDisponible($repuestoId, $ubicacionId)
    {
        $ultimoEntregado = DetalleAlmacenRepuestos::whereHas('almacenRepuesto', function ($q) use ($ubicacionId) {
            $q->where('ubicacion_id', $ubicacionId)
                ->whereHas('estado', function ($eq) {
                    $eq->where('nombre', 'Entregado');
                });
        })
            ->where('repuesto_id', $repuestoId)
            ->latest('id')
            ->first();

        $stockEntregado = $ultimoEntregado ? $ultimoEntregado->saldo : 0;

        $comprometido = DetalleAlmacenRepuestos::whereHas('almacenRepuesto', function ($q) use ($ubicacionId) {
            $q->where('ubicacion_id', $ubicacionId)
                ->where('tipo', 0)
                ->whereHas('estado', function ($eq) {
                    $eq->where('nombre', 'Autorizado');
                });
        })
            ->where('repuesto_id', $repuestoId)
            ->sum('cantidad');

        return $stockEntregado - $comprometido;
    }

    public function stockDisponible(Request $request)
    {
        $request->validate([
            'ubicacion_id' => 'required|exists:ubicaciones,id',
            'repuesto_id' => 'required|exists:MAN_repuestos,id',
        ]);

        $stock = $this->getStockDisponible($request->repuesto_id, $request->ubicacion_id);

        return response()->json(['stock' => $stock]);
    }

    public function autorizar(almacenRepuestos $movimiento)
    {
        if ($movimiento->estado->nombre !== 'Pendiente') {
            return back()->with('error', 'Solo se pueden autorizar movimientos pendientes.');
        }

        foreach ($movimiento->detalleAlmacenRepuestos as $detalle) {
            $stockDisponible = $this->getStockDisponible($detalle->repuesto_id, $movimiento->ubicacion_id);
            if ($detalle->cantidad > $stockDisponible) {
                $repuesto = $detalle->repuesto->nombre ?? 'desconocido';
                return back()->with(
                    'error',
                    "No hay suficiente stock para el repuesto {$repuesto}. Disponible: {$stockDisponible}, solicitado: {$detalle->cantidad}"
                );
            }
        }

        $estadoAutorizado = Estado::where('nombre', 'Autorizado')->first();
        if (!$estadoAutorizado) {
            return back()->with('error', 'Estado "Autorizado" no encontrado.');
        }

        $movimiento->update([
            'estado_id' => $estadoAutorizado->id,
            'autorizante_id' => auth()->id(),
            'tiempo_autorizacion' => now(),
        ]);

        return back()->with('success', 'Movimiento autorizado correctamente.');
    }

    public function rechazar(almacenRepuestos $movimiento)
    {
        if ($movimiento->estado->nombre !== 'Pendiente') {
            return back()->with('error', 'Solo se pueden rechazar movimientos pendientes.');
        }

        $estadoRechazado = Estado::where('nombre', 'Rechazado')->first();
        if (!$estadoRechazado) {
            return back()->with('error', 'Estado "Rechazado" no encontrado.');
        }

        $movimiento->update([
            'estado_id' => $estadoRechazado->id,
            'autorizante_id' => auth()->id(),
            'tiempo_autorizacion' => now(),
        ]);

        return back()->with('success', 'Movimiento rechazado.');
    }

    public function entregar(almacenRepuestos $movimiento)
    {
        if ($movimiento->tipo != 0) {
            return back()->with('error', 'Solo se pueden entregar movimientos de salida.');
        }

        if ($movimiento->estado->nombre !== 'Autorizado') {
            return back()->with('error', 'El movimiento debe estar Autorizado para entregarse.');
        }

        DB::beginTransaction();

        try {
            $estadoEntregado = Estado::where('nombre', 'Entregado')->first();
            if (!$estadoEntregado) {
                throw new \Exception('Estado "Entregado" no encontrado.');
            }

            foreach ($movimiento->detalleAlmacenRepuestos as $detalle) {
                $ultimoSaldo = $this->getUltimoSaldoEntregado($detalle->repuesto_id, $movimiento->ubicacion_id);
                $nuevoSaldo = $ultimoSaldo - $detalle->cantidad;
                $detalle->update(['saldo' => $nuevoSaldo]);
            }

            $movimiento->update([
                'estado_id' => $estadoEntregado->id,
                'almacenero_id' => auth()->id(),
                'tiempo_entregado' => now(),
            ]);

            DB::commit();

            return back()->with('success', 'Movimiento entregado y stock actualizado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al entregar el movimiento: ' . $e->getMessage());
        }
    }

    /**
     * Obtiene el último saldo ENTREGADO de un repuesto en una ubicación.
     */
    private function getUltimoSaldoEntregado($repuestoId, $ubicacionId)
    {
        $ultimoEntregado = DetalleAlmacenRepuestos::whereHas('almacenRepuesto', function ($q) use ($ubicacionId) {
            $q->where('ubicacion_id', $ubicacionId)
                ->whereHas('estado', function ($eq) {
                    $eq->where('nombre', 'Entregado');
                });
        })
            ->where('repuesto_id', $repuestoId)
            ->latest('id')
            ->first();

        return $ultimoEntregado ? $ultimoEntregado->saldo : 0;
    }
}
