<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AditivoQuimicoServicio extends Model
{
    use HasFactory;

    protected $table = 'PLL_aditivos_quimicos';

    protected $fillable = [
        'tiempo',
        'wet_boil_101',
        'wet_boil_201',
        'wet_boil_402',
        'wet_boil_801',
        'soda_caustica',
        'user_id',
    ];

    protected $casts = [
        'tiempo' => 'datetime:Y-m-d H:i:s',
        'wet_boil_101' => 'decimal:5',
        'wet_boil_201' => 'decimal:5',
        'wet_boil_402' => 'decimal:5',
        'wet_boil_801' => 'decimal:5',
        'soda_caustica' => 'decimal:5',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
