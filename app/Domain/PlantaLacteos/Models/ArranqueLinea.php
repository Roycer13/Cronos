<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ArranqueLinea extends Model
{
    protected $table = 'PLL_arranque_linea';

    protected $fillable = [
        'tiempo',
        'estado_id',
        'user_id',
        'observacion',
        'CIP',
    ];

    protected $casts = [
        'tiempo' => 'datetime',
    ];

    public function estado(): BelongsTo
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleArranqueLinea::class, 'arranque_linea_id');
    }

    public function detallesOrp(): HasMany
    {
        return $this->hasMany(DetalleOrpArranque::class, 'arranque_linea_id');
    }

    public function detallesOp(): HasMany
    {
        return $this->hasMany(DetalleOpArranque::class, 'arranque_linea_id');
    }

    public function orps()
    {
        return $this->hasMany(DetalleOrpArranque::class, 'arranque_linea_id');
    }
}
