<?php

namespace App\Domain\PlantaLacteos\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleOpArranque extends Model
{
    protected $table = 'PLL_detalle_op_arranque';

    protected $fillable = ['arranque_linea_id', 'numero', 'tipo'];

    public function arranqueLinea(): BelongsTo
    {
        return $this->belongsTo(ArranqueLinea::class, 'arranque_linea_id');
    }
}
