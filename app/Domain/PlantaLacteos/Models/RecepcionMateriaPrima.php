<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecepcionMateriaPrima extends Model
{
    use HasFactory;

    protected $table = 'PLL_recepcion_materia_primas';

    protected $fillable = [
        'tiempo',
        'user_id',
        'item_materia_prima_id',
        'cantidad',
        'unidades',
        'proveedor_materia_prima_id',
        'marca',
        'limpieza_transporte',
        'sin_elementos',
        'cerrado',
        'nit',
        'rs',
        'certificado',
        'observacion',
        'correccion',
        'almacenero_id',
        'codigo_certificado',
        'estado_id',
        'liberacion_id',
        'ubicacion_id',
        'almacen_materia_prima_id',
        // Nuevos campos
        'registro_senasag',
        'cantidad_recepcionada_unidades',
        'cantidad_recepcionada_unidad',
        'cantidad_recepcionada_peso_por_unidad_kg',
        'cantidad_recepcionada_total_kg',
        'estado_analisis_id',
        'dilucion',
        'plan_muestreo',
        'nivel_inspeccion',
        'nca',
        'cantidad_preliminar',
        'tiempo_analisis',
        'analista_id',
        'observaciones_analisis',
        'correcciones_analisis',
        // Campos de revisión
        'estado_revision_id',
        'revisor_id',
    ];

    protected $casts = [
        'limpieza_transporte' => 'boolean',
        'sin_elementos' => 'boolean',
        'cerrado' => 'boolean',
        'nit' => 'boolean',
        'rs' => 'boolean',
        'certificado' => 'boolean',
        'cantidad_recepcionada_unidades' => 'decimal:3',
        'cantidad_recepcionada_peso_por_unidad_kg' => 'decimal:2',
        'cantidad_recepcionada_total_kg' => 'decimal:3',
        'dilucion' => 'decimal:8,4',
        'tiempo_analisis' => 'datetime',
    ];

    public function scopeFilter($query, array $filters)
    {
        return $query
            ->when(
                $filters['search'] ?? null,
                fn($q, $search) =>
                $q->where(function ($query) use ($search) {
                    $query->where('marca', 'like', "%{$search}%")
                        ->orWhere('codigo_certificado', 'like', "%{$search}%")
                        ->orWhere('registro_senasag', 'like', "%{$search}%")
                        ->orWhereHas('user', fn($mq) =>
                        $mq->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('almacenero', fn($sq) =>
                        $sq->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('itemMateriaPrima', fn($uq) =>
                        $uq->where('nombre', 'like', "%{$search}%"));
                })
            )
            ->when(
                $filters['user_id'] ?? null,
                fn($q, $user_id) =>
                $q->where('user_id', $user_id)
            )
            ->when(
                $filters['item_materia_prima_id'] ?? null,
                fn($q, $item_materia_prima_id) =>
                $q->where('item_materia_prima_id', $item_materia_prima_id)
            )
            ->when(
                $filters['proveedor_materia_prima_id'] ?? null,
                fn($q, $proveedor_materia_prima_id) =>
                $q->where('proveedor_materia_prima_id', $proveedor_materia_prima_id)
            )
            ->when(
                $filters['tiempo'] ?? null,
                fn($q, $tiempo) =>
                $q->whereDate('tiempo', $tiempo)
            )
            ->when(
                $filters['almacenero_id'] ?? null,
                fn($q, $almacenero_id) =>
                $q->where('almacenero_id', $almacenero_id)
            )
            ->when(
                $filters['estado_id'] ?? null,
                fn($q, $estado_id) =>
                $q->where('estado_id', $estado_id)
            )
            ->when(
                $filters['liberacion_id'] ?? null,
                fn($q, $liberacion_id) =>
                $q->where('liberacion_id', $liberacion_id)
            )
            ->when(
                $filters['lote'] ?? null,
                fn($q, $lote) =>
                $q->whereHas('recepcionLotes', fn($loteQuery) =>
                    $loteQuery->where('lote', 'like', "%{$lote}%"))
            )
            ->when(
                $filters['fecha_vencimiento'] ?? null,
                fn($q, $fechaVencimiento) =>
                $q->whereHas('recepcionLotes', fn($loteQuery) =>
                    $loteQuery->whereDate('fecha_vencimiento', $fechaVencimiento))
            )
            ->when(
                $filters['almacen_materia_prima_id'] ?? null,
                fn($q, $almacen_materia_prima_id) =>
                $q->where('almacen_materia_prima_id', $almacen_materia_prima_id)
            )
            ->when(
                isset($filters['certificado']) && $filters['certificado'] !== '',
                fn($q) =>
                $q->where('certificado', $filters['certificado'])
            )
            // Nuevos filtros opcionales
            ->when(
                $filters['registro_senasag'] ?? null,
                fn($q, $registro) => $q->where('registro_senasag', 'like', "%{$registro}%")
            )
            // Rango de fechas (usado por el informe de materias primas ingresadas)
            ->when(
                $filters['fecha_desde'] ?? null,
                fn($q, $desde) => $q->where('tiempo', '>=', \Carbon\Carbon::parse($desde)->startOfDay())
            )
            ->when(
                $filters['fecha_hasta'] ?? null,
                fn($q, $hasta) => $q->where('tiempo', '<=', \Carbon\Carbon::parse($hasta)->endOfDay())
            );
    }

    // Relaciones (sin cambios)
    public function itemMateriaPrima()
    {
        return $this->belongsTo(ItemMateriaPrima::class, 'item_materia_prima_id');
    }

    public function proveedorMateriaPrima()
    {
        return $this->belongsTo(ProveedorMateriaPrima::class, 'proveedor_materia_prima_id');
    }

    public function recepcionLotes()
    {
        return $this->hasMany(RecepcionLote::class, 'recepcion_materia_prima_id');
    }

    public function certificadoPdf()
    {
        return $this->hasOne(RecepcionCertificado::class, 'recepcion_materia_prima_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function almacenero()
    {
        return $this->belongsTo(User::class, 'almacenero_id');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

    public function liberacion()
    {
        return $this->belongsTo(Estado::class, 'liberacion_id');
    }

    public function historialEstados()
    {
        return $this->hasMany(RecepcionEstadoHistorial::class, 'recepcion_materia_prima_id');
    }

    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }

    public function almacen()
    {
        return $this->belongsTo(AlmacenMateriaPrima::class, 'almacen_materia_prima_id');
    }

    public function analista()
    {
        return $this->belongsTo(User::class, 'analista_id');
    }

    public function estadoAnalisis()
    {
        return $this->belongsTo(Estado::class, 'estado_analisis_id');
    }

    public function estadoRevision()
    {
        return $this->belongsTo(Estado::class, 'estado_revision_id');
    }

    public function revisor()
    {
        return $this->belongsTo(User::class, 'revisor_id');
    }

    public function analisisMateriaPrima()
    {
        return $this->hasMany(AnalisisMateriaPrima::class, 'recepcion_materia_prima_id');
    }
}

