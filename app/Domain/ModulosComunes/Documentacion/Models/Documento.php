<?php

namespace App\Domain\ModulosComunes\Documentacion\Models;

use App\Domain\Sistema\Configuracion\Models\Area;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Model;

class Documento extends Model
{
    protected $table = 'documentos';

    protected $fillable = [
        'codigo',
        'titulo',
        'descripcion',
        'tipo',
        'area_id',
        'ubicacion_id',
        'estado_id',
        'version_vigente_id',
        'ultima_version_elaboracion_id',
        'creador_asignado',
        'revisor1_asignado',
        'revisor2_asignado',
        'aprobador_asignado',
        'documento_padre_id',
        'custodio',
        'tipo_distribucion',
        'ubicacion_fisica'
    ];

    // -------------------------
    // RELACIONES
    // -------------------------

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function ubicacion()
    {
        return $this->belongsTo(Ubicacion::class);
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class);
    }

    public function versiones()
    {
        return $this->hasMany(VersionDocumento::class, 'documento_id');
    }

    public function versionVigente()
    {
        return $this->belongsTo(VersionDocumento::class, 'version_vigente_id');
    }

    public function ultimaVersionElaboracion()
    {
        return $this->belongsTo(VersionDocumento::class, 'ultima_version_elaboracion_id');
    }

    public function creador()
    {
        return $this->belongsTo(User::class, 'creador_asignado');
    }

    public function revisor1()
    {
        return $this->belongsTo(User::class, 'revisor1_asignado');
    }

    public function revisor2()
    {
        return $this->belongsTo(User::class, 'revisor2_asignado');
    }

    public function aprobador()
    {
        return $this->belongsTo(User::class, 'aprobador_asignado');
    }

    public function padre()
    {
        return $this->belongsTo(Documento::class, 'documento_padre_id');
    }

    public function relaciones()
    {
        return $this->hasMany(RelacionDocumento::class, 'documento_id');
    }

    public function distribucion()
    {
        return $this->hasMany(DistribucionDocumento::class, 'documento_id');
    }
    public function custodio()
    {
        return $this->belongsTo(User::class, 'custodio', 'codigo');
    }

    // -------------------------
    // SCOPES
    // -------------------------

    public function scopeCodigo($query, $codigo)
    {
        return $query->when($codigo, fn($q) => $q->where('codigo', 'LIKE', "%$codigo%"));
    }

    public function scopeTitulo($query, $titulo)
    {
        return $query->when($titulo, fn($q) => $q->where('titulo', 'LIKE', "%$titulo%"));
    }

    public function scopeTipo($query, $tipo)
    {
        return $query->when($tipo, fn($q) => $q->where('tipo', $tipo));
    }

    public function scopeEstado($query, $estado)
    {
        return $query->when($estado, fn($q) => $q->where('estado_id', $estado));
    }

    public function scopeArea($query, $area)
    {
        return $query->when($area, fn($q) => $q->where('area_id', $area));
    }
}
