<?php

namespace App\Domain\Sistema\Configuracion\Models;

use App\Domain\Mantenimiento\Models\TipoMaquinaEquipo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaquinaEquipo extends Model
{
    use HasFactory;

    protected $table = 'maquina_equipos';


    protected $fillable = [

          'nombre',
           'codigo_interno',
           'codigo_contable',
           'alias',
           'serie',
           'fecha_compra',
           'modelo',
           'costo',
           'fabricante',
           'criticidad',
            'pcc',
           'descripcion',
            'tipo_maquina_equipo_id',
            'estado_id',
            'sector_id',

    ];

    public $timestamps = false;

    // Relación con el modelo User
    public function tipoMaquinaEquipo()
    {
        return $this->belongsTo(TipoMaquinaEquipo::class, 'tipo_maquina_equipo_id');
    }
    // Relación con el modelo Area



}
