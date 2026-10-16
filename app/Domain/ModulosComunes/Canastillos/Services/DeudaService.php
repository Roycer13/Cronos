<?php

namespace App\Domain\ModulosComunes\Canastillos\Services;

use App\Domain\ModulosComunes\Canastillos\Models\Movimiento;
use App\Domain\ModulosComunes\Canastillos\Models\DetalleMovimiento;
use App\Domain\ModulosComunes\Canastillos\Models\Canastillo;
use App\Domain\ModulosComunes\Canastillos\Models\Vendedor;
use Illuminate\Support\Facades\DB;

class DeudaService
{
    /**
     * Obtener deudas globales (todos los almacenes) o filtradas por almacén.
     * Retorna array con estructura de deudas por vendedor.
     */
    public function getDeudasGlobales(?int $almacenId = null): array
    {
        $movimientos = Movimiento::with('detalles')
            ->whereIn('tipo_movimiento', ['prestamo', 'devolucion'])
            ->whereNotNull('vendedor_id')
            ->when($almacenId, fn($q) => $q->where('almacen_id', $almacenId))
            ->get();

        return $this->procesarDeudas($movimientos);
    }

    /**
     * Obtener deudas de un vendedor específico, opcionalmente por almacén.
     */
    public function getDeudasPorVendedor(int $vendedorId, ?int $almacenId = null): array
    {
        $movimientos = Movimiento::with('detalles')
            ->whereIn('tipo_movimiento', ['prestamo', 'devolucion'])
            ->where('vendedor_id', $vendedorId)
            ->when($almacenId, fn($q) => $q->where('almacen_id', $almacenId))
            ->get();

        $deudas = $this->procesarDeudas($movimientos);
        // Si hay múltiples almacenes, combinamos todos los detalles del vendedor
        if (count($deudas) > 0) {
            // Fusionar todos los detalles del mismo vendedor (solo debería haber uno)
            $detallesCombinados = [];
            foreach ($deudas as $v) {
                foreach ($v['detalles'] as $det) {
                    $key = $det['canastillo_id'];
                    if (!isset($detallesCombinados[$key])) {
                        $detallesCombinados[$key] = $det;
                    } else {
                        $detallesCombinados[$key]['prestado'] += $det['prestado'];
                        $detallesCombinados[$key]['devuelto'] += $det['devuelto'];
                        $detallesCombinados[$key]['deuda_actual'] = $detallesCombinados[$key]['prestado'] - $detallesCombinados[$key]['devuelto'];
                    }
                }
            }
            return [
                'vendedor_id' => $vendedorId,
                'detalles' => array_values($detallesCombinados),
            ];
        }
        return ['vendedor_id' => $vendedorId, 'detalles' => []];
    }

    /**
     * Obtener deudas por almacén (qué vendedores le deben a un almacén).
     */

public function getDeudasPorAlmacen(int $almacenId): array
{
    // Obtener todos los movimientos (préstamos y devoluciones) del almacén, con sus detalles
    $movimientos = Movimiento::with('detalles')
        ->where('almacen_id', $almacenId)
        ->whereIn('tipo_movimiento', ['prestamo', 'devolucion'])
        ->whereNotNull('vendedor_id')
        ->get();

    // Acumulador: [vendedor_id][canastillo_id] = ['prestado'=>x, 'devuelto'=>y]
    $acumulador = [];

    foreach ($movimientos as $mov) {
        $vendedorId = $mov->vendedor_id;
        $tipo = $mov->tipo_movimiento;
        foreach ($mov->detalles as $det) {
            $canastilloId = $det->canastillo_id;
            $cantidad = abs($det->cantidad); // siempre positivo

            if (!isset($acumulador[$vendedorId][$canastilloId])) {
                $acumulador[$vendedorId][$canastilloId] = ['prestado' => 0, 'devuelto' => 0];
            }

            if ($tipo === 'prestamo') {
                $acumulador[$vendedorId][$canastilloId]['prestado'] += $cantidad;
            } elseif ($tipo === 'devolucion') {
                $acumulador[$vendedorId][$canastilloId]['devuelto'] += $cantidad;
            }
        }
    }

    // Construir resultado final
    $resultado = [];
    foreach ($acumulador as $vendedorId => $canastillos) {
        $vendedor = Vendedor::find($vendedorId);
        $detalles = [];
        $totalDeudaVendedor = 0;

        foreach ($canastillos as $canastilloId => $cantidades) {
            $canastillo = Canastillo::find($canastilloId);
            $prestado = $cantidades['prestado'];
            $devuelto = $cantidades['devuelto'];
            $deudaActual = $prestado - $devuelto;

            // Solo incluir si hay deuda o hubo movimiento (para no mostrar ceros innecesarios)
            if ($deudaActual != 0 || $prestado > 0) {
                $detalles[] = [
                    'canastillo_id' => $canastilloId,
                    'canastillo' => $canastillo ? $canastillo->only(['id', 'nombre', 'tamaño']) : null,
                    'prestado' => $prestado,
                    'devuelto' => $devuelto,
                    'deuda_actual' => $deudaActual,
                ];
                $totalDeudaVendedor += $deudaActual;
            }
        }

        // Solo agregar vendedores que tengan al menos un detalle (con deuda o movimiento)
        if (!empty($detalles)) {
            $resultado[] = [
                'vendedor_id' => $vendedorId,
                'vendedor' => $vendedor ? $vendedor->only(['id', 'nombre', 'apellido']) : null,
                'total_deuda' => $totalDeudaVendedor,  // ← NUEVO CAMPO
                'detalles' => $detalles,
            ];
        }
    }

    return $resultado;
}
    /**
     * Procesa una colección de movimientos y devuelve las deudas agrupadas por vendedor.
     */
    private function procesarDeudas($movimientos): array
    {
        $deudas = []; // [vendedor_id][canastillo_id] = ['prestado' => x, 'devuelto' => y]

        foreach ($movimientos as $mov) {
            $vendedorId = $mov->vendedor_id;
            foreach ($mov->detalles as $det) {
                $canastilloId = $det->canastillo_id;
                $cantidad = abs($det->cantidad); // almacenamos cantidad positiva

                if (!isset($deudas[$vendedorId][$canastilloId])) {
                    $deudas[$vendedorId][$canastilloId] = ['prestado' => 0, 'devuelto' => 0];
                }

                if ($mov->tipo_movimiento === 'prestamo') {
                    $deudas[$vendedorId][$canastilloId]['prestado'] += $cantidad;
                } elseif ($mov->tipo_movimiento === 'devolucion') {
                    $deudas[$vendedorId][$canastilloId]['devuelto'] += $cantidad;
                }
            }
        }

        // Formatear resultado
        $resultado = [];
        foreach ($deudas as $vendedorId => $canastillos) {
            $detalles = [];
            foreach ($canastillos as $canastilloId => $cantidades) {
                $prestado = $cantidades['prestado'];
                $devuelto = $cantidades['devuelto'];
                $deudaActual = $prestado - $devuelto;
                if ($deudaActual != 0 || $prestado > 0) { // solo mostrar si hay movimiento
                    $canastillo = Canastillo::find($canastilloId);
                    $detalles[] = [
                        'canastillo_id' => $canastilloId,
                        'prestado' => $prestado,
                        'devuelto' => $devuelto,
                        'deuda_actual' => $deudaActual,
                        'canastillo' => $canastillo ? $canastillo->only(['id', 'nombre', 'tamaño']) : null,
                    ];
                }
            }
            if (!empty($detalles)) {
                $resultado[] = [
                    'vendedor_id' => $vendedorId,
                    'detalles' => $detalles,
                ];
            }
        }

        return $resultado;
    }
}
