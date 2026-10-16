<?php
// app/Models/ExtVerifiacionEquipo.php
namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;

class ExtVerifiacionEquipo extends Model
{
    protected $table = 'ext_verifiacion_equipo';
    public $timestamps = false;

    protected $fillable = [
        'fecha', 'sal_1', 'temperatura_1', 'por_hum_rel_1', 'act_agua_1',
        'sal_2', 'temperatura_2', 'por_hum_rel_2', 'act_agua_2',
        'user_id', 'observaciones',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    // Relaciones
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // SCOPES
    public function scopeByFecha($query, $fecha)
    {
        return $query->where('fecha', $fecha);
    }

    public function scopeByUsuario($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRangoFechas($query, $desde, $hasta)
    {
        return $query->whereBetween('fecha', [$desde, $hasta]);
    }
}