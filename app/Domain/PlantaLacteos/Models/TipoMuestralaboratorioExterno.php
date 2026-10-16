<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\Unidad;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TipoMuestralaboratorioExterno extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'PLL_tipo_muestra_laboratorio_externo';

    protected $fillable = [
        'nombre',
        'norma_microbiologico',
        'norma_fisicoquimico',
        'min_mesofilos',
        'max_mesofilos',
        'min_coliformes',
        'max_coliformes',
        'max_mohos',
        'min_mohos',
        'mesofilos',
        'coliformes',
        'mohos',
        'mesofilos2',
        'coliformes2',
        'mohos2',
        'temperatura',
        'humedad',
        'actividad_agua',
        'ph',
        'dureza',
        'cloruros',
        'unidad_id',
        'ubicacion_id'
    ];

    protected $casts = [
        'mesofilos' => 'boolean',
        'coliformes' => 'boolean',
        'mohos' => 'boolean',
        'mesofilos2' => 'boolean',
        'coliformes2' => 'boolean',
        'mohos2' => 'boolean',
        'temperatura' => 'boolean',
        'humedad' => 'boolean',
        'actividad_agua' => 'boolean',
        'ph' => 'boolean',
        'dureza' => 'boolean',
        'cloruros' => 'boolean',
        'min_mesofilos' => 'integer',
        'max_mesofilos' => 'integer',

    ];

    public function scopeFilter($query, array $filters)
    {
        return $query
            ->when(
                $filters['search'] ?? null,
                fn($q, $search) =>
                $q->where(function ($query) use ($search) {
                    $query->where('nombre', 'like', "%{$search}%")
                        ->orWhere('norma_microbiologico', 'like', "%{$search}%")
                        ->orWhere('norma_fisicoquimico', 'like', "%{$search}%")
                        ->orWhereHas('unidad', fn($mq) =>
                            $mq->where('nombre', 'like', "%{$search}%"))
                        ->orWhereHas('ubicacion', fn($sq) =>
                            $sq->where('nombre', 'like', "%{$search}%"));
                })
            )
            ->when(
                $filters['nombre'] ?? null,
                fn($q, $nombre) =>
                $q->where('nombre', 'like', "%{$nombre}%")
            )
            ->when(
                $filters['unidad_id'] ?? null,
                fn($q, $unidad_id) =>
                $q->where('unidad_id', $unidad_id)
            )
            ->when(
                $filters['ubicacion_id'] ?? null,
                fn($q, $ubicacion_id) =>
                $q->where('ubicacion_id', $ubicacion_id)
            )
            ->when(
                $filters['mesofilos'] ?? null,
                fn($q, $mesofilos) =>
                $q->where('mesofilos', $mesofilos)
            )
            ->when(
                $filters['coliformes'] ?? null,
                fn($q, $coliformes) =>
                $q->where('coliformes', $coliformes)
            )
            ->when(
                $filters['mohos'] ?? null,
                fn($q, $mohos) =>
                $q->where('mohos', $mohos)
            )
            ->when(
                $filters['temperatura'] ?? null,
                fn($q, $temperatura) =>
                $q->where('temperatura', $temperatura)
            )
            ->when(
                $filters['humedad'] ?? null,
                fn($q, $humedad) =>
                $q->where('humedad', $humedad)
            )
            ->when(
                $filters['actividad_agua'] ?? null,
                fn($q, $actividad_agua) =>
                $q->where('actividad_agua', $actividad_agua)
            )
            ->when(
                $filters['ph'] ?? null,
                fn($q, $ph) =>
                $q->where('ph', $ph)
            )
            ->when(
                $filters['dureza'] ?? null,
                fn($q, $dureza) =>
                $q->where('dureza', $dureza)
            )
            ->when(
                $filters['cloruros'] ?? null,
                fn($q, $cloruros) =>
                $q->where('cloruros', $cloruros)
            )
            ->when(
                $filters['has_microbiologia'] ?? null,
                fn($q, $has_microbiologia) =>
                $q->where(function ($query) {
                    $query->where('mesofilos', true)
                        ->orWhere('coliformes', true)
                        ->orWhere('mohos', true)
                        ->orWhere('mesofilos2', true)
                        ->orWhere('coliformes2', true)
                        ->orWhere('mohos2', true);
                })
            )
            ->when(
                $filters['has_fisicoquimico'] ?? null,
                fn($q, $has_fisicoquimico) =>
                $q->where(function ($query) {
                    $query->where('temperatura', true)
                        ->orWhere('humedad', true)
                        ->orWhere('actividad_agua', true)
                        ->orWhere('ph', true)
                        ->orWhere('dureza', true)
                        ->orWhere('cloruros', true);
                })
            );
    }

    public function unidad()
    {
        return $this->belongsTo(Unidad::class, 'unidad_id');
    }

    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }



    // Relación con solicitudes de laboratorio externo (si existe)
    public function solicitud()
    {
        return $this->hasMany(SolicitudLaboratorioExterno::class, 'tipo_muestra_id');
    }

}
