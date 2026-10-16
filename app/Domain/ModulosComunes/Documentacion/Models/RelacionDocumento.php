<?php

namespace App\Domain\ModulosComunes\Documentacion\Models;

use Illuminate\Database\Eloquent\Model;

class RelacionDocumento extends Model
{
    protected $table = 'relacion_documentos';

    protected $fillable = [
        'documento_id', 'documento_relacion_id', 'tipo_relacion'
    ];

    public function documento()
    {
        return $this->belongsTo(Documento::class, 'documento_id');
    }

    public function relacionado()
    {
        return $this->belongsTo(Documento::class, 'documento_relacion_id');
    }
}
