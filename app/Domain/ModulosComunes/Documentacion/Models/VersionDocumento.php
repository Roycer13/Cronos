<?php

namespace App\Domain\ModulosComunes\Documentacion\Models;

use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;

class VersionDocumento extends Model
{
    protected $table = 'version_documentos';

    protected $fillable = [
        'documento_id',
        'numero_version',
        'archivo_pdf_url',
        'archivo_word_url',
        'cambios',
        'creado_por',
        'revisado1_por',
        'revisado2_por',
        'aprobado_por',
        'fecha_creacion',
        'fecha_revision',
        'fecha_aprobado',
        'estado_id',
        'observaciones'
    ];

    public function documento()
    {
        return $this->belongsTo(Documento::class);
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class);
    }

    public function creador()
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function revisor1()
    {
        return $this->belongsTo(User::class, 'revisado1_por');
    }

    public function revisor2()
    {
        return $this->belongsTo(User::class, 'revisado2_por');
    }

    public function aprobador()
    {
        return $this->belongsTo(User::class, 'aprobado_por');
    }

    // SCOPES

    public function scopeVersion($query, $version)
    {
        return $query->when($version, fn($q) => $q->where('numero_version', 'LIKE', "%$version%"));
    }

    public function scopeEstado($query, $estado)
    {
        return $query->when($estado, fn($q) => $q->where('estado_id', $estado));
    }
}
