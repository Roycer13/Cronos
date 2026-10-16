<?php

namespace App\Domain\ModulosComunes\Old\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Request;

class OldItem extends Model
{
    use SoftDeletes;

    protected $table = 'old_items';

    // =========================
    // 🛡️ SEGURIDAD
    // =========================
    protected $fillable = [
        'nombre',
        'old_subarea_id',
        'old_area_id',  // ✅ NUEVO
        'descripcion',

        // Lunes
        'lun_1_o',
        'lun_1_l',
        'lun_1_d',
        'lun_2_o',
        'lun_2_l',
        'lun_2_d',
        'lun_3_o',
        'lun_3_l',
        'lun_3_d',

        // Martes
        'mar_1_o',
        'mar_1_l',
        'mar_1_d',
        'mar_2_o',
        'mar_2_l',
        'mar_2_d',
        'mar_3_o',
        'mar_3_l',
        'mar_3_d',

        // Miércoles
        'mie_1_o',
        'mie_1_l',
        'mie_1_d',
        'mie_2_o',
        'mie_2_l',
        'mie_2_d',
        'mie_3_o',
        'mie_3_l',
        'mie_3_d',

        // Jueves
        'jue_1_o',
        'jue_1_l',
        'jue_1_d',
        'jue_2_o',
        'jue_2_l',
        'jue_2_d',
        'jue_3_o',
        'jue_3_l',
        'jue_3_d',

        // Viernes
        'vie_1_o',
        'vie_1_l',
        'vie_1_d',
        'vie_2_o',
        'vie_2_l',
        'vie_2_d',
        'vie_3_o',
        'vie_3_l',
        'vie_3_d',

        // Sábado
        'sab_1_o',
        'sab_1_l',
        'sab_1_d',
        'sab_2_o',
        'sab_2_l',
        'sab_2_d',
        'sab_3_o',
        'sab_3_l',
        'sab_3_d',

        // Domingo
        'dom_1_o',
        'dom_1_l',
        'dom_1_d',
        'dom_2_o',
        'dom_2_l',
        'dom_2_d',
        'dom_3_o',
        'dom_3_l',
        'dom_3_d',

        // Frecuencias
        'quincenal',
        'mensual',
        'bimensual',
        'trimestral',
        'semestral',
        'anual',
    ];

    // =========================
    // 🔄 CASTS (MUY IMPORTANTE)
    // =========================
    protected $casts = [

        // todos los boolean
        'lun_1_o' => 'boolean',
        'lun_1_l' => 'boolean',
        'lun_1_d' => 'boolean',
        'lun_2_o' => 'boolean',
        'lun_2_l' => 'boolean',
        'lun_2_d' => 'boolean',
        'lun_3_o' => 'boolean',
        'lun_3_l' => 'boolean',
        'lun_3_d' => 'boolean',

        'mar_1_o' => 'boolean',
        'mar_1_l' => 'boolean',
        'mar_1_d' => 'boolean',
        'mar_2_o' => 'boolean',
        'mar_2_l' => 'boolean',
        'mar_2_d' => 'boolean',
        'mar_3_o' => 'boolean',
        'mar_3_l' => 'boolean',
        'mar_3_d' => 'boolean',

        'mie_1_o' => 'boolean',
        'mie_1_l' => 'boolean',
        'mie_1_d' => 'boolean',
        'mie_2_o' => 'boolean',
        'mie_2_l' => 'boolean',
        'mie_2_d' => 'boolean',
        'mie_3_o' => 'boolean',
        'mie_3_l' => 'boolean',
        'mie_3_d' => 'boolean',

        'jue_1_o' => 'boolean',
        'jue_1_l' => 'boolean',
        'jue_1_d' => 'boolean',
        'jue_2_o' => 'boolean',
        'jue_2_l' => 'boolean',
        'jue_2_d' => 'boolean',
        'jue_3_o' => 'boolean',
        'jue_3_l' => 'boolean',
        'jue_3_d' => 'boolean',

        'vie_1_o' => 'boolean',
        'vie_1_l' => 'boolean',
        'vie_1_d' => 'boolean',
        'vie_2_o' => 'boolean',
        'vie_2_l' => 'boolean',
        'vie_2_d' => 'boolean',
        'vie_3_o' => 'boolean',
        'vie_3_l' => 'boolean',
        'vie_3_d' => 'boolean',

        'sab_1_o' => 'boolean',
        'sab_1_l' => 'boolean',
        'sab_1_d' => 'boolean',
        'sab_2_o' => 'boolean',
        'sab_2_l' => 'boolean',
        'sab_2_d' => 'boolean',
        'sab_3_o' => 'boolean',
        'sab_3_l' => 'boolean',
        'sab_3_d' => 'boolean',

        'dom_1_o' => 'boolean',
        'dom_1_l' => 'boolean',
        'dom_1_d' => 'boolean',
        'dom_2_o' => 'boolean',
        'dom_2_l' => 'boolean',
        'dom_2_d' => 'boolean',
        'dom_3_o' => 'boolean',
        'dom_3_l' => 'boolean',
        'dom_3_d' => 'boolean',

        'quincenal' => 'boolean',
        'mensual' => 'boolean',
        'bimensual' => 'boolean',
        'trimestral' => 'boolean',
        'semestral' => 'boolean',
        'anual' => 'boolean',
    ];

    // =========================
    // 🔗 RELACIONES
    // =========================
    public function subarea()
    {
        return $this->belongsTo(OldSubarea::class, 'old_subarea_id');
    }

    public function area()  // ✅ NUEVO
    {
        return $this->belongsTo(OldArea::class, 'old_area_id');
    }

    public function registros()
    {
        return $this->hasMany(OldRegistro::class, 'old_item_id');
    }

    // =========================
    // 🔥 HELPERS
    // =========================
    public function getValor($dia, $turno, $tipo)
    {
        $columna = "{$dia}_{$turno}_{$tipo}";
        return $this->$columna ?? false;
    }

    public function debeHacerse($dia, $turno)
    {
        return [
            'orden' => $this->getValor($dia, $turno, 'o'),
            'limpieza' => $this->getValor($dia, $turno, 'l'),
            'desinfeccion' => $this->getValor($dia, $turno, 'd'),
        ];
    }

    // =========================
    // 📊 SCOPE
    // =========================
    public function scopeFrecuencia($query, $tipo)
    {
        return $query->where($tipo, true);
    }
  
}
