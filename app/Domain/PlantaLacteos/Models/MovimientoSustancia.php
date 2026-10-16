<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MovimientoSustancia extends Model
{
    use HasFactory;

    protected $table = 'PLL_movimiento_sustancias';

    protected $fillable = [
        'tiempo',
        'user_id',
        'sustancia_id',
        'cantidad',
        'estado_id',
        'tipo',
        'autorizante_id',
        'entregante_id',
        'fecha_entrega',
        'saldo',
        'observacion',
        'ubicacion_id'
    ];


    // En app/Domain/PlantaLacteos/Models/MovimientoSustancia.php
    public static function getStockDisponible($sustancia_id)
    {
        $estadoEntregado = Estado::where('nombre', 'Entregado')->first();
        $estadoAceptado = Estado::where('nombre', 'Aceptado')->first();

        // Calcular ingresos entregados
        $ingresos = self::where('sustancia_id', $sustancia_id)
            ->where('tipo', 1) // Ingresos
            ->where('estado_id', $estadoEntregado->id)
            ->sum('cantidad') ?? 0;

        // Calcular egresos entregados
        $egresosEntregados = self::where('sustancia_id', $sustancia_id)
            ->where('tipo', 0) // Egresos
            ->where('estado_id', $estadoEntregado->id)
            ->sum('cantidad') ?? 0;

        // Calcular egresos aceptados (pero no entregados aún)
        $egresosAceptados = self::where('sustancia_id', $sustancia_id)
            ->where('tipo', 0) // Egresos
            ->where('estado_id', $estadoAceptado->id)
            ->sum('cantidad') ?? 0;

        // Stock disponible = Ingresos entregados - Egresos entregados - Egresos aceptados
        return $ingresos - $egresosEntregados - $egresosAceptados;
    }





    public static function getStockDisponibleReal($sustancia_id)
    {
        $estadoEntregado = Estado::where('nombre', 'Entregado')->first();
        $estadoAceptado = Estado::where('nombre', 'Aceptado')->first();

        // Calcular ingresos entregados
        $ingresos = self::where('sustancia_id', $sustancia_id)
            ->where('tipo', 1) // Ingresos
            ->where('estado_id', $estadoEntregado->id)
            ->sum('cantidad') ?? 0;

        // Calcular egresos entregados
        $egresosEntregados = self::where('sustancia_id', $sustancia_id)
            ->where('tipo', 0) // Egresos
            ->where('estado_id', $estadoEntregado->id)
            ->sum('cantidad') ?? 0;



        // Stock disponible = Ingresos entregados - Egresos entregados - Egresos aceptados
        return $ingresos - $egresosEntregados ;
    }


    protected $casts = [
    'tipo' => 'boolean',
    // otros casts...
];

    public function scopeFilter($query, array $filters)
    {
        return $query
            // 🔍 Búsqueda general
            ->when(
                $filters['search'] ?? null,
                fn($q, $search) =>
                $q->where(function ($query) use ($search) {
                    $query->where('observacion', 'like', "%{$search}%")
                        ->orWhere('tipo', 'like', "%{$search}%")
                        ->orWhereHas('user', fn($uq) =>
                        $uq->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('autorizante', fn($aq) =>
                        $aq->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('entregante', fn($eq) =>
                        $eq->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('sustancia', fn($sq) =>
                        $sq->where('nombre', 'like', "%{$search}%"));
                })
            )

            // 🔹 Usuario que realizó el movimiento
            ->when(
                $filters['user_id'] ?? null,
                fn($q, $user_id) =>
                $q->where('user_id', $user_id)
            )

            // 🔹 Sustancia
            ->when(
                $filters['sustancia_id'] ?? null,
                fn($q, $sustancia_id) =>
                $q->where('sustancia_id', $sustancia_id)
            )

            // 🔹 Autorizante
            ->when(
                $filters['autorizante_id'] ?? null,
                fn($q, $autorizante_id) =>
                $q->where('autorizante_id', $autorizante_id)
            )

            // 🔹 Entregante
            ->when(
                $filters['entregante_id'] ?? null,
                fn($q, $entregante_id) =>
                $q->where('entregante_id', $entregante_id)
            )

            // 🔹 Fecha del movimiento
            ->when(
                $filters['tiempo'] ?? null,
                fn($q, $tiempo) =>
                $q->whereDate('tiempo', $tiempo)
            )

            // 🔹 Fecha de entrega (si aplica)
            ->when(
                $filters['fecha_entrega'] ?? null,
                fn($q, $fecha_entrega) =>
                $q->whereDate('fecha_entrega', $fecha_entrega)
            )

            // 🔹 Estado
            ->when(
                $filters['estado_id'] ?? null,
                fn($q, $estado_id) =>
                $q->where('estado_id', $estado_id)
            )

            // 🔹 Tipo de movimiento (entrada / salida / otro)
            ->when(
                $filters['tipo'] ?? null,
                fn($q, $tipo) =>
                $q->where('tipo', $tipo)
            );
    }

    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function sustancia()
    {
        return $this->belongsTo(ItemSustancia::class, 'sustancia_id');
    }
    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

    public function autorizante()
    {
        return $this->belongsTo(User::class, 'autorizante_id');
    }
    public function entregante()
    {
        return $this->belongsTo(User::class, 'entregante_id');
    }
}
