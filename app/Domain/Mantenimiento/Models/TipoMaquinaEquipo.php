<?php

namespace App\Domain\Mantenimiento\Models;

use App\Domain\Sistema\Configuracion\Models\MaquinaEquipo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class TipoMaquinaEquipo extends Model
{
    use HasFactory;
    protected $table = 'MAN_tipo_maquina_equipos';
    protected $fillable = [

        'nombre',
        'codigo',
        'descripcion',

    ];

    use SoftDeletes;
    // Relación con el modelo User
    public function maquinaEquipos()
    {
        return $this->hasMany(MaquinaEquipo::class, 'tipo_maquina_equipo_id');
    }



}
