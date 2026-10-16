<?php

namespace App\Domain\ModulosComunes\HigienePersonal\Services;

use App\Domain\ModulosComunes\HigienePersonal\Models\ControlVisita;
use Illuminate\Support\Facades\DB;

class ControlVisitaService
{
    public function crearRegistro(array $data, $supervisor): ControlVisita
    {
        return DB::transaction(function () use ($data, $supervisor) {
            $conforme = $data['vestimenta'] &&
                $data['higiene'] &&
                $data['salud'] &&
                $data['epp_entregado'] &&
                $data['induccion'];

            return ControlVisita::create([
                'ubicacion_id'       => $supervisor->ubicacion_id,
                'supervisor_id'      => $supervisor->id,
                'nombre_visita'      => $data['nombre_visita'],
                'empresa_area_trabajo' => $data['empresa_area_trabajo'],
                'fecha'              => $data['fecha'],
                'fecha_entrada'      => $data['fecha_entrada'],
                'fecha_salida'       => $data['fecha_salida'] ?? null,
                'motivo'             => $data['motivo'],
                'area_empresa'       => $data['area_empresa'],
                'vestimenta'         => $data['vestimenta'],
                'higiene'            => $data['higiene'],
                'salud'              => $data['salud'],
                'epp_entregado'      => $data['epp_entregado'],
                'induccion'          => $data['induccion'],
                'conforme'           => $conforme,
                'observaciones'      => $data['observaciones'] ?? null,
                'correcion'          => $data['correcion'] ?? null,
            ]);
        });
    }

    public function actualizarRegistro(ControlVisita $visita, array $data): ControlVisita
    {
        return DB::transaction(function () use ($visita, $data) {
            $conforme = $data['vestimenta'] &&
                $data['higiene'] &&
                $data['salud'] &&
                $data['epp_entregado'] &&
                $data['induccion'];

            $visita->update([
                'nombre_visita'        => $data['nombre_visita'],
                'empresa_area_trabajo' => $data['empresa_area_trabajo'],
                'fecha'                => $data['fecha'],
                'fecha_entrada'        => $data['fecha_entrada'],
                'fecha_salida'         => $data['fecha_salida'] ?? null,
                'motivo'               => $data['motivo'],
                'area_empresa'         => $data['area_empresa'],
                'vestimenta'           => $data['vestimenta'],
                'higiene'              => $data['higiene'],
                'salud'                => $data['salud'],
                'epp_entregado'        => $data['epp_entregado'],
                'induccion'            => $data['induccion'],
                'conforme'             => $conforme,
                'observaciones'        => $data['observaciones'] ?? null,
                'correcion'            => $data['correcion'] ?? null,
            ]);

            return $visita->fresh();
        });
    }

    public function registrarSalida(ControlVisita $visita): ControlVisita
    {
        $visita->update(['fecha_salida' => now()]);
        return $visita->fresh();
    }

    public function generarEstadisticas($query): array
    {
        $registros = $query->get();

        $total      = $registros->count();
        $conformes  = $registros->where('conforme', true)->count();
        $activas    = $registros->whereNull('fecha_salida')->count();

        $porcentaje = $total > 0 ? round(($conformes / $total) * 100) : 0;

        $duracionPromedio = $registros
            ->whereNotNull('fecha_salida')
            ->map(fn($r) => $r->duracionVisita())
            ->filter()
            ->avg();

        return [
            'total'              => $total,
            'conformes'          => $conformes,
            'no_conformes'       => $total - $conformes,
            'activas'            => $activas,
            'porcentaje_conformidad' => $porcentaje,
            'duracion_promedio'  => $duracionPromedio ? round($duracionPromedio) : null,
        ];
    }
}