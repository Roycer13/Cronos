<?php

namespace App\Exports;

use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class RecepcionesMateriaPrimaExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(private Builder $consulta)
    {
    }

    public function query()
    {
        return $this->consulta
            ->with(['itemMateriaPrima', 'proveedorMateriaPrima', 'estado', 'liberacion', 'recepcionLotes'])
            ->orderBy('tiempo');
    }

    public function headings(): array
    {
        return ['Fecha', 'Materia prima', 'Proveedor', 'Lotes', 'Total kg', 'Estado', 'Liberación', 'Certificado'];
    }

    public function map($r): array
    {
        return [
            $r->tiempo ? \Carbon\Carbon::parse($r->tiempo)->format('Y-m-d H:i') : null,
            $r->itemMateriaPrima?->nombre,
            $r->proveedorMateriaPrima?->nombre,
            $r->recepcionLotes->pluck('lote')->filter()->implode(', '),
            $r->cantidad_recepcionada_total_kg,
            $r->estado?->nombre,
            $r->liberacion?->nombre,
            $r->certificado ? 'Sí' : 'No',
        ];
    }
}
