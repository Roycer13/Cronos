<?php

namespace App\Domain\ModulosComunes\Orp\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrpEstado extends Model
{
    use SoftDeletes;

    protected $table = 'orp_estados';

    protected $fillable = [
        'orp_id',
        'estado_id',
        'usuario_id',
        'fecha_hora',
        'observaciones'
    ];

    protected $casts = [
        'fecha_hora' => 'datetime',
    ];

    public function orp(): BelongsTo
    {
        return $this->belongsTo(Orp::class);
    }

    public function estado(): BelongsTo
    {
        return $this->belongsTo(Estado::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}