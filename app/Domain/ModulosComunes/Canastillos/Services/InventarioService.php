<?php

namespace App\Domain\ModulosComunes\Canastillos\Services;

use App\Domain\ModulosComunes\Canastillos\Models\DetalleMovimiento;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Support\Facades\DB;

class InventarioService
{
    private $estadoAceptadoId;

    public function __construct()
    {
        $this->estadoAceptadoId = Estado::where('nombre', 'Aceptado')->value('id');
        if (!$this->estadoAceptadoId) {
            throw new \Exception('El estado "Aceptado" no existe en la tabla estados.');
        }
    }

    /**
     * Obtener el inventario actual de todos los almacenes.
     */
    public function getInventarioGlobal(): array
    {
        // Obtener todos los detalles de movimientos aceptados, ordenados por updated_at desc
        $detalles = DetalleMovimiento::whereHas('movimiento', function ($q) {
                $q->where('estado_id', $this->estadoAceptadoId);
            })
            ->with('canastillo', 'movimiento.almacen')
            ->orderBy('updated_at', 'desc')
            ->get();

        // Agrupar por almacén y canastillo, quedándonos con el primer detalle de cada grupo (el más reciente)
        $ultimos = [];
        foreach ($detalles as $detalle) {
            $key = $detalle->movimiento->almacen_id . '_' . $detalle->canastillo_id;
            if (!isset($ultimos[$key])) {
                $ultimos[$key] = $detalle;
            }
        }

        // Formatear la salida agrupada por almacén
        $resultado = [];
        foreach ($ultimos as $detalle) {
            $almacenId = $detalle->movimiento->almacen_id;
            $resultado[$almacenId][] = [
                'almacen_id' => $almacenId,
                'almacen_nombre' => $detalle->movimiento->almacen->nombre,
                'canastillo' => $detalle->canastillo,
                'saldo' => $detalle->saldo,
            ];
        }

        return $resultado;
    }

    /**
     * Obtener el inventario de un almacén específico.
     */
    public function getInventarioPorAlmacen(int $almacenId): array
    {
        // Obtener todos los detalles de movimientos aceptados para el almacén, ordenados por updated_at desc
        $detalles = DetalleMovimiento::whereHas('movimiento', function ($q) use ($almacenId) {
                $q->where('almacen_id', $almacenId)
                  ->where('estado_id', $this->estadoAceptadoId);
            })
            ->with('canastillo')
            ->orderBy('updated_at', 'desc')
            ->get();

        // Quedarnos con el último registro por cada canastillo
        $ultimos = [];
        foreach ($detalles as $detalle) {
            if (!isset($ultimos[$detalle->canastillo_id])) {
                $ultimos[$detalle->canastillo_id] = $detalle;
            }
        }

        // Formatear salida
        return collect($ultimos)->map(fn($d) => [
            'canastillo' => $d->canastillo,
            'saldo' => $d->saldo,
        ])->values()->toArray();
    }
}
