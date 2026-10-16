<?php

namespace App\Domain\Mantenimiento\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\MaquinaEquipo;
use App\Domain\Sistema\Configuracion\Models\Prioridad;
use App\Domain\Sistema\Configuracion\Models\Sector;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AyudanteOt extends Model
{
    use HasFactory;
    protected $table = 'MAN_ayudante_ots';
    protected $fillable = [
        'ot_id',
        'user_id',
        'tiempo_inicio',
        'tiempo_fin'
    ];

    // Relación con el modelo User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function ot()
    {
        return $this->belongsTo(Ot::class, 'ot_id');
    }



}
