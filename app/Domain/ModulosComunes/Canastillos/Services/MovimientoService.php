<?php

namespace App\Domain\ModulosComunes\Canastillos\Services;

use App\Domain\ModulosComunes\Canastillos\Models\Movimiento;
use App\Domain\ModulosComunes\Canastillos\Models\DetalleMovimiento;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MovimientoService
{
    private $estadoPendienteId;
    private $estadoAceptadoId;

    public function __construct()
    {
        // Asegúrate de que los nombres de los estados coincidan con los registros en la tabla 'estados'
        $this->estadoPendienteId = Estado::where('nombre', 'Pendiente')->value('id');
        $this->estadoAceptadoId = Estado::where('nombre', 'Aceptado')->value('id');

        if (!$this->estadoPendienteId || !$this->estadoAceptadoId) {
            throw new \Exception('Los estados "Pendiente" y/o "Aceptado" no existen en la tabla estados.');
        }
    }

    /**
     * Registrar un préstamo a vendedor.
     */
    public function storePrestamo(array $data): Movimiento
    {
        return DB::transaction(function () use ($data) {
            $this->verificarStock($data['almacen_id'], $data['detalles']);

            $movimiento = Movimiento::create([
                'almacen_id' => $data['almacen_id'],
                'vendedor_id' => $data['vendedor_id'],
                'responsable_id' => auth()->id(),
                'tipo_movimiento' => 'prestamo',
                'observaciones' => $data['observaciones'] ?? null,
                'estado_id' => $this->estadoAceptadoId,

                'numero' => Movimiento::getNextNumero(),
            ]);

            foreach ($data['detalles'] as $detalle) {
                $lastSaldo = $this->getUltimoSaldo($data['almacen_id'], $detalle['canastillo_id']);
                $nuevoSaldo = $lastSaldo - $detalle['cantidad'];

                DetalleMovimiento::create([
                    'movimiento_id' => $movimiento->id,
                    'canastillo_id' => $detalle['canastillo_id'],
                    'cantidad' => -$detalle['cantidad'],
                    'saldo' => $nuevoSaldo,
                ]);
            }

            return $movimiento->load('detalles.canastillo');
        });
    }

    /**
     * Registrar una devolución de vendedor.
     */
    public function storeDevolucion(array $data): Movimiento
    {
        return DB::transaction(function () use ($data) {
            // Validar deuda para cada detalle
            foreach ($data['detalles'] as $detalle) {
                $deudaActual = $this->getDeudaVendedor(
                    $data['almacen_id'],
                    $data['vendedor_id'],
                    $detalle['canastillo_id']
                );
                if ($deudaActual < $detalle['cantidad']) {
                    throw ValidationException::withMessages([
                        'detalles' => "El vendedor solo debe {$deudaActual} unidades de ese canastillo, no puede devolver {$detalle['cantidad']}."
                    ]);
                }
                if ($deudaActual <= 0) {
                    throw ValidationException::withMessages([
                        'detalles' => "El vendedor no tiene deuda pendiente de ese canastillo."
                    ]);
                }
            }

            $movimiento = Movimiento::create([
                'almacen_id' => $data['almacen_id'],
                'vendedor_id' => $data['vendedor_id'],
                'responsable_id' => auth()->id(),
                'tipo_movimiento' => 'devolucion',
                'observaciones' => $data['observaciones'] ?? null,
                'estado_id' => $this->estadoAceptadoId,

                'numero' => Movimiento::getNextNumero(),
            ]);

            foreach ($data['detalles'] as $detalle) {
                $lastSaldo = $this->getUltimoSaldo($data['almacen_id'], $detalle['canastillo_id']);
                $nuevoSaldo = $lastSaldo + $detalle['cantidad'];

                DetalleMovimiento::create([
                    'movimiento_id' => $movimiento->id,
                    'canastillo_id' => $detalle['canastillo_id'],
                    'cantidad' => $detalle['cantidad'],
                    'saldo' => $nuevoSaldo,
                ]);
            }

            return $movimiento->load('detalles.canastillo');
        });
    }

    /**
     * Registrar una transferencia entre almacenes (crea dos movimientos en estado pendiente).
     */
    public function storeTransferencia(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $numero = Movimiento::getNextNumero();
            // No verificamos stock aquí porque aún no afecta inventario
            $detalles = $data['detalles'];

            $movimientoSalida = Movimiento::create([
                'almacen_id' => $data['almacen_origen_id'],
                'almacen2_id' => $data['almacen_destino_id'],
                'responsable_id' => auth()->id(),
                'tipo_movimiento' => 'transferencia_salida',
                'observaciones' => $data['observaciones'] ?? null,
                'estado_id' => $this->estadoPendienteId,
                'numero' => $numero,
            ]);

            $movimientoEntrada = Movimiento::create([
                'almacen_id' => $data['almacen_destino_id'],
                'almacen2_id' => $data['almacen_origen_id'],
                'responsable_id' => auth()->id(),
                'tipo_movimiento' => 'transferencia_entrada',
                'observaciones' => $data['observaciones'] ?? null,
                'estado_id' => $this->estadoPendienteId,
                'numero' => $numero,
            ]);

            foreach ($detalles as $detalle) {
                $canastilloId = $detalle['canastillo_id'];
                $cantidad = $detalle['cantidad'];

                // Detalle de salida (cantidad negativa, saldo temporal 0)
                DetalleMovimiento::create([
                    'movimiento_id' => $movimientoSalida->id,
                    'canastillo_id' => $canastilloId,
                    'cantidad' => -$cantidad,
                    'saldo' => 0,
                ]);

                // Detalle de entrada (cantidad positiva, saldo temporal 0)
                DetalleMovimiento::create([
                    'movimiento_id' => $movimientoEntrada->id,
                    'canastillo_id' => $canastilloId,
                    'cantidad' => $cantidad,
                    'saldo' => 0,
                ]);
            }

            return [$movimientoSalida, $movimientoEntrada];
        });
    }

    /**
     * Aceptar una transferencia pendiente (actualiza stock y marca como aceptado).
     */
    public function aceptarTransferencia(Movimiento $movimiento, int $responsable2Id): void
    {

        DB::transaction(function () use ($movimiento, $responsable2Id) {
            if ($movimiento->estado_id != $this->estadoPendienteId) {
                throw new \Exception('La transferencia ya fue procesada.');
            }

            // Buscar el movimiento hermano (entrada o salida)
            $hermano = Movimiento::where('numero', $movimiento->numero)
                ->where('id', '!=', $movimiento->id)
                ->first();


            if (!$hermano) {
                throw new \Exception('No se encontró el movimiento complementario.');
            }

            // Recalcular saldos para el movimiento de salida (origen)
            foreach ($movimiento->detalles as $detalle) {
                $stockActual = $this->getUltimoSaldo($movimiento->almacen_id, $detalle->canastillo_id);
                $nuevoSaldo = $stockActual + $detalle->cantidad; // detalle->cantidad es negativo
                $detalle->update(['saldo' => $nuevoSaldo]);
            }

            // Recalcular saldos para el movimiento de entrada (destino)
            foreach ($hermano->detalles as $detalle) {
                $stockActual = $this->getUltimoSaldo($hermano->almacen_id, $detalle->canastillo_id);
                $nuevoSaldo = $stockActual + $detalle->cantidad; // detalle->cantidad es positivo
                $detalle->update(['saldo' => $nuevoSaldo]);
            }

            // Cambiar estado y registrar responsable2
            $movimiento->update(['estado_id' => $this->estadoAceptadoId, 'responsable2_id' => $responsable2Id]);
            $hermano->update(['estado_id' => $this->estadoAceptadoId, 'responsable2_id' => $responsable2Id]);
        });
    }

    /**
     * Rechazar una transferencia pendiente.
     */
    public function rechazarTransferencia(Movimiento $movimiento): void
    {
        DB::transaction(function () use ($movimiento) {
            if ($movimiento->estado_id != $this->estadoPendienteId) {
                throw new \Exception('La transferencia ya fue procesada.');
            }

            $hermano = Movimiento::where('numero', $movimiento->numero)
                ->where('id', '!=', $movimiento->id)
                ->first();
            $estadoRechazadoId = Estado::where('nombre', 'Rechazado')->value('id');
            if (!$estadoRechazadoId) {
                throw new \Exception('El estado "Rechazado" no existe en la tabla estados.');
            }

            $movimiento->update(['estado_id' => $estadoRechazadoId]);
            if ($hermano) {
                $hermano->update(['estado_id' => $estadoRechazadoId]);
            }

            // Opcional: eliminar los detalles para limpiar
            $movimiento->detalles()->delete();
            if ($hermano) {
                $hermano->detalles()->delete();
            }
        });
    }

    /**
     * Registrar un ajuste de inventario (ingreso o salida manual)
     */
    public function storeAjuste(array $data): Movimiento
    {
        return DB::transaction(function () use ($data) {
            if ($data['tipo_ajuste'] === 'salida') {
                $this->verificarStock($data['almacen_id'], $data['detalles']);
            }

            $tipoMovimiento = $data['tipo_ajuste'] === 'ingreso'
                ? Movimiento::TIPO_AJUSTE_INGRESO
                : Movimiento::TIPO_AJUSTE_SALIDA;

            $movimiento = Movimiento::create([
                'almacen_id' => $data['almacen_id'],
                'responsable_id' => auth()->id(),
                'tipo_movimiento' => $tipoMovimiento,
                'observaciones' => $data['observaciones'] ?? null,
                'estado_id' => $this->estadoAceptadoId,

                'numero' => Movimiento::getNextNumero(),
            ]);

            foreach ($data['detalles'] as $detalle) {
                $lastSaldo = $this->getUltimoSaldo($data['almacen_id'], $detalle['canastillo_id']);
                $cantidad = $detalle['cantidad'];
                $nuevoSaldo = $data['tipo_ajuste'] === 'ingreso'
                    ? $lastSaldo + $cantidad
                    : $lastSaldo - $cantidad;

                $cantidadRegistro = $data['tipo_ajuste'] === 'ingreso' ? $cantidad : -$cantidad;

                DetalleMovimiento::create([
                    'movimiento_id' => $movimiento->id,
                    'canastillo_id' => $detalle['canastillo_id'],
                    'cantidad' => $cantidadRegistro,
                    'saldo' => $nuevoSaldo,
                ]);
            }

            return $movimiento->load('detalles.canastillo');
        });
    }

    /**
     * Anular un movimiento: crea un movimiento compensatorio y (opcionalmente) elimina el original.
     */
    public function delete(Movimiento $movimiento): void
    {
        DB::transaction(function () use ($movimiento) {
            $detalles = $movimiento->detalles;
            if ($detalles->isEmpty()) {
                throw new \Exception('No se puede anular un movimiento sin detalles.');
            }

            $anulacion = Movimiento::create([
                'almacen_id' => $movimiento->almacen_id,
                'responsable_id' => auth()->id(),
                'tipo_movimiento' => 'anulacion',
                'observaciones' => 'Anulación del movimiento #' . $movimiento->id,
                'estado_id' => $this->estadoAceptadoId,
            ]);

            foreach ($detalles as $detalle) {
                $cantidadInversa = -$detalle->cantidad;
                $ultimoSaldo = $this->getUltimoSaldo($movimiento->almacen_id, $detalle->canastillo_id);
                $nuevoSaldo = $ultimoSaldo + $cantidadInversa;

                DetalleMovimiento::create([
                    'movimiento_id' => $anulacion->id,
                    'canastillo_id' => $detalle->canastillo_id,
                    'cantidad' => $cantidadInversa,
                    'saldo' => $nuevoSaldo,
                ]);
            }

            $movimiento->delete();
        });
    }

    /**
     * Obtener el último saldo registrado para un almacén y canastillo (solo movimientos aceptados).
     */
    private function getUltimoSaldo(int $almacenId, int $canastilloId): int
{
    $ultimoDetalle = DetalleMovimiento::whereHas('movimiento', function ($q) use ($almacenId) {
            $q->where('almacen_id', $almacenId)
              ->where('estado_id', $this->estadoAceptadoId);
        })
        ->where('canastillo_id', $canastilloId)
        ->lockForUpdate()
        ->orderBy('updated_at', 'desc') // ← ordenar por última modificación
        ->first();

    return $ultimoDetalle ? $ultimoDetalle->saldo : 0;
}

    /**
     * Verificar que el almacén tenga suficiente stock de cada canastillo.
     */
    private function verificarStock(int $almacenId, array $detalles): void
    {
        foreach ($detalles as $detalle) {
            $stockActual = $this->getUltimoSaldo($almacenId, $detalle['canastillo_id']);
            if ($stockActual < $detalle['cantidad']) {
                throw ValidationException::withMessages([
                    'detalles' => "Stock insuficiente para el canastillo ID {$detalle['canastillo_id']}. Disponible: $stockActual, solicitado: {$detalle['cantidad']}",
                ]);
            }
        }
    }

    /**
     * Obtener la deuda actual de un vendedor con un almacén para un canastillo.
     */
    private function getDeudaVendedor(int $almacenId, int $vendedorId, int $canastilloId): int
    {
        $prestamos = DetalleMovimiento::whereHas('movimiento', function ($q) use ($almacenId, $vendedorId) {
            $q->where('almacen_id', $almacenId)
                ->where('vendedor_id', $vendedorId)
                ->where('tipo_movimiento', 'prestamo')
                ->where('estado_id', $this->estadoAceptadoId);
        })
            ->where('canastillo_id', $canastilloId)
            ->sum('cantidad');

        $devoluciones = DetalleMovimiento::whereHas('movimiento', function ($q) use ($almacenId, $vendedorId) {
            $q->where('almacen_id', $almacenId)
                ->where('vendedor_id', $vendedorId)
                ->where('tipo_movimiento', 'devolucion')
                ->where('estado_id', $this->estadoAceptadoId);
        })
            ->where('canastillo_id', $canastilloId)
            ->sum('cantidad');

        return abs($prestamos) - $devoluciones;
    }
}
