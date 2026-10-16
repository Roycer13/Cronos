<?php

namespace App\Domain\ModulosComunes\Sanidad\Models;

use App\Domain\ModulosComunes\Sanidad\Models\Caja;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Policlinico extends Model
{
    protected $table = 'san_policlinicos';

    protected $fillable = [
        'nombre',
        'direccion',
        'caja_id'
    ];

    public function caja(): BelongsTo
    {
        return $this->belongsTo(Caja::class);
    }

    public function atencionesMedicas(): HasMany
    {
        return $this->hasMany(AtencionMedica::class, 'policlinico_id');
    }

    public function reconsultas(): HasMany
    {
        return $this->hasMany(ReconsultaAtencionMedica::class, 'policlinico_id');
    }

    public function examenesOcupacionales(): HasMany
    {
        return $this->hasMany(ExamenOcupacional::class, 'policlinico_id');
    }

    public function empleadosReferencia(): HasMany
    {
        return $this->hasMany(User::class, 'policlinico_id');
    }
}