<?php
namespace App\Domain\ModulosComunes\Old\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domain\Sistema\Configuracion\Models\User;
use App\Domain\ModulosComunes\Orp\Models\Orp;

class OldEnvasadoraHtst extends Model
{
    protected $table = 'old_envasadoras_htst';

    protected $fillable = [
        'tipo_maquina',
        'fecha',
        'orp_id',
        'valor_produccion',
        'tipo_medicion',
        'maquinista_id',
        'usuario_verificador',
        'tiempo_inicio_limpieza',
        'tiempo_fin_limpieza',
        'tipo_limpieza',
        'calibracion_inicio',
        'calibracion_fin',
        'envasado_inicio',
        'envasado_fin',
        'merma',
        'checks',
        'origenes',
        'observaciones',
        'correciones',
    ];

    protected $casts = [
        'fecha' => 'date',
        'valor_produccion' => 'decimal:2',
        'merma' => 'decimal:2',
        'checks' => 'array',
        'origenes' => 'array',

        'tiempo_inicio_limpieza' => 'datetime',
        'tiempo_fin_limpieza' => 'datetime',
        'calibracion_inicio' => 'datetime',
        'calibracion_fin' => 'datetime',
        'envasado_inicio' => 'datetime',
        'envasado_fin' => 'datetime',
    ];

    public function maquinista()
    {
        return $this->belongsTo(User::class, 'maquinista_id');
    }

    public function verificador()
    {
        return $this->belongsTo(User::class, 'usuario_verificador');
    }

    public function orp()
    {
        return $this->belongsTo(Orp::class);
    }
}