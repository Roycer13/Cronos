<?php
namespace App\Domain\ModulosComunes\Old\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class OldRegistro extends Model
{
    use SoftDeletes;

    protected $table = 'old_registros';

    protected $fillable = [
        'tiempo_realizado',
        'tiempo_verificado',
        'user_id',
        'revisor_id',
        'old_item_id',
        'orden',
        'limpieza',
        'desinfeccion',
        'observacion',
        'correcion',
    ];

    protected $dates = [
        'tiempo_realizado',
        'tiempo_verificado',
    ];

    // RELACIONES
    public function item()
    {
        return $this->belongsTo(OldItem::class, 'old_item_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function revisor()
    {
        return $this->belongsTo(User::class, 'revisor_id');
    }

    // =========================
    // 🔥 SCOPES PARA REPORTES
    // =========================

    // 📅 POR FECHA
    public function scopeFecha($query, $desde, $hasta = null)
    {
        if ($hasta) {
            return $query->whereBetween('tiempo_realizado', [$desde, $hasta]);
        }

        return $query->whereDate('tiempo_realizado', $desde);
    }

    // 👤 POR USUARIO
    public function scopeUsuario($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // 🔍 POR REVISOR
    public function scopeRevisor($query, $revisorId)
    {
        return $query->where('revisor_id', $revisorId);
    }

    // 🧱 POR ITEM
    public function scopeItem($query, $itemId)
    {
        return $query->where('old_item_id', $itemId);
    }

    // 📊 SOLO ORDEN
    public function scopeOrden($query)
    {
        return $query->where('orden', true);
    }

    // 🧼 SOLO LIMPIEZA
    public function scopeLimpieza($query)
    {
        return $query->where('limpieza', true);
    }

    // 🧴 SOLO DESINFECCION
    public function scopeDesinfeccion($query)
    {
        return $query->where('desinfeccion', true);
    }

    // ❌ PENDIENTES (no verificados)
    public function scopePendientes($query)
    {
        return $query->whereNull('tiempo_verificado');
    }

    // ✅ VERIFICADOS
    public function scopeVerificados($query)
    {
        return $query->whereNotNull('tiempo_verificado');
    }

    // 📆 HOY
    public function scopeHoy($query)
    {
        return $query->whereDate('tiempo_realizado', Carbon::today());
    }

    // 📅 ESTE MES
    public function scopeEsteMes($query)
    {
        return $query->whereMonth('tiempo_realizado', Carbon::now()->month);
    }
}