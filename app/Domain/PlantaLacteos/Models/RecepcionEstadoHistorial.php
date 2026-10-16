<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecepcionEstadoHistorial extends Model
{
    use HasFactory;

    protected $table = 'PLL_recepcion_estado_historial';

    protected $fillable = [
        'recepcion_materia_prima_id',
        'user_id',
        'estado_id',
        'liberacion_id',
        'observacion',
    ];

    public function recepcion()
    {
        return $this->belongsTo(RecepcionMateriaPrima::class, 'recepcion_materia_prima_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

    public function liberacion()
    {
        return $this->belongsTo(Estado::class, 'liberacion_id');
    }
}
