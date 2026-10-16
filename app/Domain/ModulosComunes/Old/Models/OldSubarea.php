<?php
namespace App\Domain\ModulosComunes\Old\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OldSubarea extends Model
{
    use SoftDeletes;

    protected $table = 'old_subareas';

    protected $fillable = [
        'nombre',
        'old_area_id',
        'descripcion',
    ];

    // RELACIONES
    public function area()
    {
        return $this->belongsTo(OldArea::class, 'old_area_id');
    }

    public function items()
    {
        return $this->hasMany(OldItem::class);
    }
}