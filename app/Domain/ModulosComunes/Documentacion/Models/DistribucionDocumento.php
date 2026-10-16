<?php

namespace App\Domain\ModulosComunes\Documentacion\Models;

use App\Domain\Sistema\Configuracion\Models\Area;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;

class DistribucionDocumento extends Model
{
    protected $table = 'distribucion_documentos';

    protected $fillable = [
        'documento_id', 'tipo', 'cantidad_copias', 'area_destinataria_id',
        'responsable_user_id', 'ubicacion_fisica', 'acceso_usuario_id',
        'fecha_inicio_acceso', 'fecha_fin_acceso', 'control_descarga',
        'cantidad_descargas'
    ];

    public function documento()
    {
        return $this->belongsTo(Documento::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'area_destinataria_id');
    }

    public function responsable()
    {
        return $this->belongsTo(User::class, 'responsable_user_id');
    }

    public function usuarioAcceso()
    {
        return $this->belongsTo(User::class, 'acceso_usuario_id');
    }
}

