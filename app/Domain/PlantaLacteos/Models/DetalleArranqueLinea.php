<?php

namespace App\Domain\PlantaLacteos\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleArranqueLinea extends Model
{
    protected $table = 'PLL_detalle_arranque_linea';

    protected $fillable = [
        'arranque_linea_id',
        'origen_id',
        'numero',
        'inicio_final',
        'tiempo',
        'h202',
    ];

    protected $casts = [
        'tiempo' => 'datetime',
        'h202' => 'boolean',
    ];

    public function arranqueLinea(): BelongsTo
    {
        return $this->belongsTo(ArranqueLinea::class, 'arranque_linea_id');
    }

    public function origen(): BelongsTo
    {
        return $this->belongsTo(Origen::class, 'origen_id');
    }
}
