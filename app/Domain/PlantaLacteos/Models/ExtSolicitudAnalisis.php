<?php
// app/Models/ExtSolicitudAnalisis.php
namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;

class ExtSolicitudAnalisis extends Model
{
    protected $table = 'ext_solicitud_analisis';
    public $timestamps = false;

    protected $fillable = [
        'tiempo', 'user_id', 'ubicacion_id', 'codigo', 'estado', 'observaciones',
    ];

    protected $casts = [
        'tiempo' => 'datetime',
    ];

    // Relaciones
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }

    public function detalles()
    {
        return $this->hasMany(ExtDetalleSolicitudAnalisis::class, 'ext_solicitud_analisis_id');
    }

    // SCOPES
    public function scopeByEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    public function scopeByUsuario($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByUbicacion($query, $ubicacionId)
    {
        return $query->where('ubicacion_id', $ubicacionId);
    }

    public function scopeByCodigo($query, $codigo)
    {
        return $query->where('codigo', 'like', "%$codigo%");
    }

    public function scopeRangoFechas($query, $desde, $hasta)
    {
        return $query->whereBetween('tiempo', [$desde, $hasta]);
    }
}