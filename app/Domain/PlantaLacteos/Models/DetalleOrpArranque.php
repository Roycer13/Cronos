<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\ModulosComunes\Orp\Models\Orp;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleOrpArranque extends Model
{
    protected $table = 'PLL_detalle_orp_arranque';

    protected $fillable = ['arranque_linea_id', 'orp_id'];

    public function arranqueLinea(): BelongsTo
    {
        return $this->belongsTo(ArranqueLinea::class, 'arranque_linea_id');
    }

    public function orp(): BelongsTo
    {
        return $this->belongsTo(Orp::class, 'orp_id');
    }
}
