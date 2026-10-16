<?php
namespace App\Domain\ModulosComunes\Old\Models;

use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OldArea extends Model
{
    use SoftDeletes;

    protected $table = 'old_areas';

    protected $fillable = [
        'nombre',
        'ubicacion_id',
        'descripcion',
    ];

    // RELACIONES
    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class);
    }

    public function subareas()
    {
        return $this->hasMany(OldSubarea::class);
    }
}